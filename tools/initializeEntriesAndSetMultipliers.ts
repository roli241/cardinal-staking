import type { AccountData } from "@cardinal/common";
import { withFindOrInitAssociatedTokenAccount } from "@cardinal/common";
import { utils } from "@project-serum/anchor";
import { SignerWallet } from "@saberhq/solana-contrib";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";

import { executeTransaction } from "../src";
import type { RewardEntryData } from "../src/programs/rewardDistributor";
import {
  getRewardDistributor,
  getRewardEntries,
} from "../src/programs/rewardDistributor/accounts";
import {
  findRewardDistributorId,
  findRewardEntryId,
} from "../src/programs/rewardDistributor/pda";
import {
  withInitRewardEntry,
  withUpdateRewardEntry,
} from "../src/programs/rewardDistributor/transaction";
import type { StakeEntryData } from "../src/programs/stakePool";
import { getStakeEntries } from "../src/programs/stakePool/accounts";
import { findStakeEntryId } from "../src/programs/stakePool/pda";
import { withInitStakeEntry } from "../src/programs/stakePool/transaction";
import { connectionFor } from "./connection";
import type { Metadata } from "./getMetadataForPoolTokens";
import { fetchMetadata } from "./getMetadataForPoolTokens";
import type { UpdateRule } from "./updateMultipliersOnRules";
import { chunkArray } from "./utils";

const wallet = Keypair.fromSecretKey(utils.bytes.bs58.decode("SECRET_KEY"));

const POOL_ID = new PublicKey("");
const CLUSTER = "mainnet";
const FUNGIBLE = false;
const BATCH_SIZE = 4;
const PARALLEL_BATCH_SIZE = 20;

type EntryData = { mintId: PublicKey; multiplier?: number };

// REMINDER: Take into account rewardDistributor.multiplierDecimals!
const MINT_LIST: EntryData[] = [];
const metadataRules: UpdateRule = {};

const initializeEntries = async (
  stakePoolId: PublicKey,
  initEntries: EntryData[],
  cluster: string,
  fungible = false
) => {
  const connection = connectionFor(cluster);
  const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
  const rewardDistributorData = await getRewardDistributor(
    connection,
    rewardDistributorId
  );
  console.log(
    `--------- Initialize ${
      initEntries.length
    } entries for pool (${stakePoolId.toString()}) and reward distributor (${rewardDistributorId.toString()}) ---------`
  );
  const stakeEntryIds = await Promise.all(
    initEntries.map(
      async (e) =>
        (
          await findStakeEntryId(
            wallet.publicKey,
            stakePoolId,
            e.mintId,
            fungible
          )
        )[0]
    )
  );
  const stakeEntries = await getStakeEntries(connection, stakeEntryIds);
  const stakeEntriesById = stakeEntries.reduce(
    (acc, stakeEntry) =>
      stakeEntry.parsed
        ? { ...acc, [stakeEntry.pubkey.toString()]: stakeEntry }
        : { ...acc },
    {} as { [id: string]: AccountData<StakeEntryData> }
  );

  const rewardEntryIds = await Promise.all(
    stakeEntryIds.map(
      async (stakeEntryId) =>
        (
          await findRewardEntryId(rewardDistributorId, stakeEntryId)
        )[0]
    )
  );
  const rewardEntries = await getRewardEntries(connection, rewardEntryIds);
  const rewardEntriesById = rewardEntries.reduce(
    (acc, rewardEntry) =>
      rewardEntry.parsed
        ? { ...acc, [rewardEntry.pubkey.toString()]: rewardEntry }
        : { ...acc },
    {} as { [id: string]: AccountData<RewardEntryData> }
  );

  const chunkedEntries = chunkArray(initEntries, BATCH_SIZE) as EntryData[][];
  const batchedChunks = chunkArray(
    chunkedEntries,
    PARALLEL_BATCH_SIZE
  ) as EntryData[][][];
  for (let i = 0; i < batchedChunks.length; i++) {
    const chunk = batchedChunks[i]!;
    console.log(
      `\n\n\n---------------- Chunk ${i + 1} of ${
        batchedChunks.length
      } ----------------`
    );
    await Promise.all(
      chunk.map(async (entries, c) => {
        let metadata: Metadata[] = [];
        if (metadataRules.metadata) {
          const temp = await fetchMetadata(
            connection,
            entries.map((entry) => entry.mintId)
          );
          metadata = temp[0];
        }
        const transaction = new Transaction();
        const entriesInTx: EntryData[] = [];
        for (let j = 0; j < entries.length; j++) {
          const { mintId, multiplier } = entries[j]!;
          console.log(
            `>>[${c + 1}/${chunk.length}][${j + 1}/${
              entries.length
            }] (${mintId.toString()})`
          );
          try {
            const [stakeEntryId] = await findStakeEntryId(
              wallet.publicKey,
              stakePoolId,
              mintId,
              fungible
            );

            await withFindOrInitAssociatedTokenAccount(
              transaction,
              connection,
              mintId,
              stakeEntryId,
              wallet.publicKey,
              true
            );

            if (!stakeEntriesById[stakeEntryId.toString()]) {
              await withInitStakeEntry(
                transaction,
                connection,
                new SignerWallet(wallet),
                {
                  stakePoolId,
                  originalMintId: mintId,
                }
              );
              console.log(
                `>>[${c + 1}/${chunk.length}][${j + 1}/${
                  entries.length
                }] 1. Adding stake entry instruction`
              );
            }

            const [rewardEntryId] = await findRewardEntryId(
              rewardDistributorId,
              stakeEntryId
            );
            const rewardEntry = rewardEntriesById[rewardEntryId.toString()];
            if (rewardDistributorData && !rewardEntry) {
              console.log(
                `>>[${c + 1}/${chunk.length}][${j + 1}/${
                  entries.length
                }] 2. reward entry not found for reward distributor - adding reward entry instruction`
              );
              await withInitRewardEntry(
                transaction,
                connection,
                new SignerWallet(wallet),
                {
                  stakeEntryId,
                  rewardDistributorId,
                }
              );
            }

            let multiplierToSet = multiplier;
            if (metadataRules.metadata) {
              const md = metadata[j]!;
              for (const rule of metadataRules.metadata) {
                console.log(md.attributes);
                if (
                  md.attributes.find(
                    (attr) =>
                      attr.trait_type === rule.traitType &&
                      attr.value === rule.value
                  )
                ) {
                  multiplierToSet = rule.multiplier;
                }
              }
            }

            if (
              multiplierToSet &&
              rewardEntry?.parsed.multiplier.toNumber() !== multiplierToSet
            ) {
              console.log(
                `>>[${c + 1}/${chunk.length}][${j + 1}/${
                  entries.length
                }] 3. Updating reward entry multipler from  ${
                  rewardEntry?.parsed.multiplier.toNumber() || 0
                } => ${multiplierToSet}`
              );
              await withUpdateRewardEntry(
                transaction,
                connection,
                new SignerWallet(wallet),
                {
                  stakePoolId,
                  stakeEntryId,
                  rewardDistributorId,
                  multiplier: new BN(multiplierToSet),
                }
              );
            }
            entriesInTx.push({ mintId });
          } catch (e: unknown) {
            console.log(
              `Failed to add entry IXs for mint (${mintId.toString()})`
            );
          }
        }

        try {
          if (transaction.instructions.length > 0) {
            const txid = await executeTransaction(
              connection,
              new SignerWallet(wallet),
              transaction,
              {}
            );
            console.log(
              `Succesfully created/updated entries [${entriesInTx
                .map((e) => e.mintId.toString())
                .join()}] with transaction ${txid} (https://explorer.solana.com/tx/${txid}?cluster=${cluster})`
            );
          }
        } catch (e) {
          console.log(e);
        }
      })
    );
  }
};

initializeEntries(POOL_ID, MINT_LIST, CLUSTER, FUNGIBLE).catch((e) =>
  console.log(e)
);
