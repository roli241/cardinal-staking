// eslint-disable-next-line import/first
import type { AccountData } from "@cardinal/common";
import { utils } from "@project-serum/anchor";
import { SignerWallet } from "@saberhq/solana-contrib";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import * as dotenv from "dotenv";

import { executeTransaction } from "../src";
import type { RewardEntryData } from "../src/programs/rewardDistributor";
import {
  getRewardDistributor,
  getRewardEntriesForRewardDistributor,
} from "../src/programs/rewardDistributor/accounts";
import { withUpdateRewardEntry } from "../src/programs/rewardDistributor/transaction";
import { connectionFor } from "./connection";
import { chunkArray } from "./utils";

dotenv.config();

const MULTIPLIER = 100;
const BATCH_SIZE = 1;

const wallet = Keypair.fromSecretKey(
  utils.bytes.bs58.decode(process.env.TOOLS_WALLET ?? "")
);

const checkMultipliers = async (
  rewardDistributorId: PublicKey,
  cluster: string
) => {
  const connection = connectionFor(cluster);
  const rewardEntries = await getRewardEntriesForRewardDistributor(
    connection,
    rewardDistributorId
  );
  const rewardDistributorData = await getRewardDistributor(
    connection,
    rewardDistributorId
  );
  console.log(`--------- Found ${rewardEntries.length} entries ---------`);
  const missingMultipliers: AccountData<RewardEntryData>[] = [];
  rewardEntries.forEach((entry) => {
    if (!entry.parsed.multiplier.eq(new BN(100))) {
      missingMultipliers.push(entry);
    }
  });
  console.log(`Found ${missingMultipliers.length} entries with multipler=1`);
  console.log(missingMultipliers);
  const chunks = chunkArray(
    missingMultipliers,
    BATCH_SIZE
  ) as AccountData<RewardEntryData>[][];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const transaction = new Transaction();
    const entriesInTx: AccountData<RewardEntryData>[] = [];
    for (let j = 0; j < chunk.length; j++) {
      const m = chunk[j]!;
      console.log(m);
      console.log(`\n\n${i}. Reward entry: ${m.pubkey.toString()}`);
      await withUpdateRewardEntry(
        transaction,
        connection,
        new SignerWallet(wallet),
        {
          stakePoolId: rewardDistributorData.parsed.stakePool,
          rewardDistributorId: rewardDistributorId,
          stakeEntryId: m.parsed.stakeEntry,
          multiplier: new BN(MULTIPLIER),
        }
      );
      entriesInTx.push(m);
    }
    try {
      const txid = await executeTransaction(
        connection,
        new SignerWallet(wallet),
        transaction,
        {}
      );
      console.log(
        `Succesfully migrated entries [${entriesInTx
          .map((e) => e.pubkey.toString())
          .join()}] with transaction ${txid} (https://explorer.solana.com/tx/${txid}?cluster=${cluster})`
      );
    } catch (e) {
      console.log(e);
    }
    console.log(entriesInTx);
  }
};

checkMultipliers(
  new PublicKey("7CgYMgEhXFLeNfS66VLo93PCTNDjtK6BEq9Wmp6yGJ5T"),
  "mainnet"
).catch((e) => console.log(e));
