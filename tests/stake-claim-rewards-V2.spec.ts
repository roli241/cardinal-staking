import {
  emptyWallet,
  findAta,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { BN } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import {
  SignerWallet,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import type * as splToken from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { expect } from "chai";

import {
  claimRewards,
  createStakeEntry,
  createStakePool,
  rewardDistributor,
  stake,
  unstake,
} from "../src";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";
import {
  getRewardDistributor,
  getRewardEntry,
} from "../src/programs/rewardDistributor/accounts";
import {
  claimRewards as claimRewardsV1,
  initRewardEntry,
} from "../src/programs/rewardDistributor/instruction";
import {
  findRewardDistributorId,
  findRewardEntryId,
} from "../src/programs/rewardDistributor/pda";
import { withRemainingAccountsForKind } from "../src/programs/rewardDistributor/utils";
import { ReceiptType } from "../src/programs/stakePool";
import { getStakeEntry } from "../src/programs/stakePool/accounts";
import { findStakeEntryIdFromMint } from "../src/programs/stakePool/utils";
import { createMasterEditionIxs, createMint, delay } from "./utils";
import { getProvider } from "./workspace";

describe("Stake and claim rewards V2", () => {
  let originalMintTokenAccountId: PublicKey;
  let originalMint: splToken.Token;
  let rewardMint: splToken.Token;
  let stakePoolId: PublicKey;

  const maxSupply = 100;
  const originalMintAuthority = Keypair.generate();
  const rewardMintAuthority = Keypair.generate();
  const permissonlessUser = Keypair.generate();

  before(async () => {
    const provider = getProvider();
    const fromAirdropSignature = await provider.connection.requestAirdrop(
      permissonlessUser.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(fromAirdropSignature);

    // original mint
    [originalMintTokenAccountId, originalMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey,
      1,
      originalMintAuthority.publicKey
    );

    // master edition
    const ixs = await createMasterEditionIxs(
      originalMint.publicKey,
      originalMintAuthority.publicKey
    );
    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: new SignerWallet(originalMintAuthority),
        opts: provider.opts,
      }),
      ixs
    );
    await expectTXTable(txEnvelope, "before", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    // reward mint
    [, rewardMint] = await createMint(
      provider.connection,
      rewardMintAuthority,
      provider.wallet.publicKey,
      maxSupply,
      provider.wallet.publicKey
    );
  });

  it("Create Pool", async () => {
    const provider = getProvider();

    let transaction: Transaction;
    [transaction, stakePoolId] = await createStakePool(
      provider.connection,
      provider.wallet,
      {}
    );

    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...transaction.instructions,
      ]),
      "Create pool"
    ).to.be.fulfilled;
  });

  it("Create Reward Distributor", async () => {
    const provider = getProvider();
    const transaction = new Transaction();
    await rewardDistributor.transaction.withInitRewardDistributor(
      transaction,
      provider.connection,
      provider.wallet,
      {
        stakePoolId: stakePoolId,
        rewardMintId: rewardMint.publicKey,
        kind: RewardDistributorKind.Treasury,
        maxSupply: new BN(maxSupply),
      }
    );

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );

    await expectTXTable(txEnvelope, "Create reward distributor", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    const rewardDistributorData = await getRewardDistributor(
      provider.connection,
      rewardDistributorId
    );

    expect(rewardDistributorData.parsed.rewardMint.toString()).to.eq(
      rewardMint.publicKey.toString()
    );
  });

  it("Init stake entry for pool", async () => {
    const provider = getProvider();

    const [transaction, _] = await createStakeEntry(
      provider.connection,
      provider.wallet,
      {
        stakePoolId: stakePoolId,
        originalMintId: originalMint.publicKey,
      }
    );

    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...transaction.instructions,
      ]),
      "Init stake entry"
    ).to.be.fulfilled;

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      (
        await findStakeEntryIdFromMint(
          provider.connection,
          provider.wallet.publicKey,
          stakePoolId,
          originalMint.publicKey
        )
      )[0]
    );

    expect(stakeEntryData.parsed.originalMint.toString()).to.eq(
      originalMint.publicKey.toString()
    );
    expect(stakeEntryData.parsed.pool.toString()).to.eq(stakePoolId.toString());
    expect(stakeEntryData.parsed.stakeMint).to.eq(null);
  });

  it("Stake", async () => {
    const provider = getProvider();

    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...(
          await stake(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMint.publicKey,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: ReceiptType.Original,
          })
        ).instructions,
      ]),
      "Stake"
    ).to.be.fulfilled;

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      (
        await findStakeEntryIdFromMint(
          provider.connection,
          provider.wallet.publicKey,
          stakePoolId,
          originalMint.publicKey
        )
      )[0]
    );

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );

    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.be.greaterThan(0);
    expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
      provider.wallet.publicKey.toString()
    );

    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);
    expect(checkUserOriginalTokenAccount.isFrozen).to.eq(true);
  });

  it("Fail Claim Rewards", async () => {
    const provider = getProvider();
    const transaction = new Transaction();

    const [stakeEntryId] = await findStakeEntryIdFromMint(
      provider.connection,
      provider.wallet.publicKey,
      stakePoolId,
      originalMint.publicKey,
      false
    );
    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    const rewardDistributorData = await getRewardDistributor(
      provider.connection,
      rewardDistributorId
    );

    const rewardMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(
      transaction,
      provider.connection,
      rewardDistributorData.parsed.rewardMint,
      provider.wallet.publicKey,
      provider.wallet.publicKey
    );

    const remainingAccountsForKind = await withRemainingAccountsForKind(
      transaction,
      provider.connection,
      provider.wallet.publicKey,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint,
      provider.wallet.publicKey,
      true
    );

    const [rewardEntryId] = await findRewardEntryId(
      rewardDistributorId,
      stakeEntryId
    );
    transaction.add(
      initRewardEntry(provider.connection, provider.wallet, {
        stakeEntryId: stakeEntryId,
        rewardDistributor: rewardDistributorData.pubkey,
        rewardEntryId: rewardEntryId,
      })
    );

    transaction.add(
      await claimRewardsV1(
        provider.connection,
        emptyWallet(provider.wallet.publicKey),
        {
          stakePoolId: stakePoolId,
          stakeEntryId: stakeEntryId,
          rewardMintId: rewardMint.publicKey,
          rewardMintTokenAccountId: rewardMintTokenAccountId,
          remainingAccountsForKind: remainingAccountsForKind,
        }
      )
    );

    expect(async () => {
      await expectTXTable(
        new TransactionEnvelope(SolanaProvider.init(provider), [
          ...transaction.instructions,
        ]),
        "Fail claim rewards"
      ).to.be.rejectedWith(Error);
    });
  });

  it("Claim Rewards", async () => {
    await delay(4000);
    const provider = getProvider();
    const [stakeEntryId] = await findStakeEntryIdFromMint(
      provider.connection,
      provider.wallet.publicKey,
      stakePoolId,
      originalMint.publicKey
    );

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    const [rewardEntryId] = await findRewardEntryId(
      rewardDistributorId,
      stakeEntryId
    );

    const transaction = await claimRewards(
      provider.connection,
      emptyWallet(permissonlessUser.publicKey),
      {
        user: provider.wallet.publicKey,
        stakePoolId: stakePoolId,
        stakeEntryId: stakeEntryId,
      }
    );

    await expectTXTable(
      new TransactionEnvelope(
        SolanaProvider.init(provider),
        [...transaction.instructions],
        [permissonlessUser]
      ),
      "Claim Rewards"
    ).to.be.fulfilled;

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );
    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);

    const rewardEntryAfter = await getRewardEntry(
      provider.connection,
      rewardEntryId
    );
    expect(rewardEntryAfter.parsed.rewardSecondsReceived.toNumber()).to.gt(0);
  });

  it("Unstake", async () => {
    await delay(2000);
    const provider = getProvider();
    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...(
          await unstake(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMint.publicKey,
          })
        ).instructions,
      ]),
      "Unstake"
    ).to.be.fulfilled;

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      (
        await findStakeEntryIdFromMint(
          provider.connection,
          provider.wallet.publicKey,
          stakePoolId,
          originalMint.publicKey
        )
      )[0]
    );
    expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
      PublicKey.default.toString()
    );
    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.gt(0);

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );
    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);
    expect(checkUserOriginalTokenAccount.isFrozen).to.eq(false);

    const stakeEntryOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      stakeEntryData.pubkey,
      true
    );

    const userRewardMintTokenAccountId = await findAta(
      rewardMint.publicKey,
      provider.wallet.publicKey,
      true
    );

    const checkStakeEntryOriginalMintTokenAccount =
      await originalMint.getAccountInfo(stakeEntryOriginalMintTokenAccountId);
    expect(checkStakeEntryOriginalMintTokenAccount.amount.toNumber()).to.eq(0);

    const checkUserRewardTokenAccount = await rewardMint.getAccountInfo(
      userRewardMintTokenAccountId
    );
    expect(checkUserRewardTokenAccount.amount.toNumber()).greaterThan(1);
  });
});
