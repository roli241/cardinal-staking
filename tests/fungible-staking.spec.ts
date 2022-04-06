import { BN } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import { SolanaProvider, TransactionEnvelope } from "@saberhq/solana-contrib";
import type * as splToken from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";
import { expect } from "chai";

import { rewardDistributor } from "../src";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";
import { getRewardDistributor } from "../src/programs/rewardDistributor/accounts";
import { findRewardDistributorId } from "../src/programs/rewardDistributor/pda";
import { getStakePool } from "../src/programs/stakePool/accounts";
import { findStakePoolId } from "../src/programs/stakePool/pda";
import { withInitStakePool } from "../src/programs/stakePool/transaction";
import { createMint } from "./utils";
import { getProvider } from "./workspace";

/**
 * Scenario:
 *
 * Stake amount x for t time and unstake that amount
 * Immediately after, stake amount y (where y>>>x) and claim rewards
 * Make sure rewards received are coomputed correctly
 */

describe("Create stake pool", () => {
  let poolIdentifier: BN;
  let stakePoolId: PublicKey;
  // let originalMintTokenAccountId: PublicKey;
  let originalMint: splToken.Token;
  let rewardMint: splToken.Token;

  const maxSupply = 100;
  const stakingAmount = 10;
  const originalMintAuthority = Keypair.generate();
  const rewardMintAuthority = Keypair.generate();

  before(async () => {
    const provider = getProvider();
    // original mint
    [, originalMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey,
      stakingAmount,
      originalMintAuthority.publicKey
    );

    // reward mint
    [, rewardMint] = await createMint(
      provider.connection,
      rewardMintAuthority,
      provider.wallet.publicKey,
      maxSupply,
      rewardMintAuthority.publicKey
    );
  });

  it("Create Pool", async () => {
    const provider = getProvider();
    const transaction = new Transaction();

    [, , poolIdentifier] = await withInitStakePool(
      transaction,
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

    [stakePoolId] = await findStakePoolId(poolIdentifier);
    const stakePoolData = await getStakePool(provider.connection, stakePoolId);

    expect(stakePoolData.parsed.identifier.toNumber()).to.eq(
      poolIdentifier.toNumber()
    );
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

  it("Init Reward Entry", async () => {
    const provider = getProvider();
    const transaction = new Transaction();
    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    await rewardDistributor.transaction.withInitRewardEntry(
      transaction,
      provider.connection,
      provider.wallet,
      {
        mintId: originalMint.publicKey,
        rewardDistributorId: rewardDistributorId,
      }
    );

    const txEnvelope = new TransactionEnvelope(SolanaProvider.init(provider), [
      ...transaction.instructions,
    ]);

    await expectTXTable(txEnvelope, "Init reward entry", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const rewardDistributorData = await getRewardDistributor(
      provider.connection,
      rewardDistributorId
    );

    expect(rewardDistributorData.parsed.rewardMint.toString()).to.eq(
      rewardMint.publicKey.toString()
    );
  });

  // it("Init fungible stake entry", async () => {
  //   const provider = getProvider();

  //   const [transaction] = await initStakeEntry(
  //     provider.connection,
  //     provider.wallet,
  //     {
  //       stakePoolId: stakePoolId,
  //       originalMintId: originalMint.publicKey,
  //     }
  //   );

  //   await expectTXTable(
  //     new TransactionEnvelope(SolanaProvider.init(provider), [
  //       ...transaction.instructions,
  //     ]),
  //     "Init fungible stake entry"
  //   ).to.be.fulfilled;

  //   const stakeEntryData = await getStakeEntry(
  //     provider.connection,
  //     (
  //       await findFtStakeEntryId(stakePoolId, provider.wallet.publicKey)
  //     )[0]
  //   );

  //   expect(stakeEntryData.parsed.originalMint.toString()).to.eq(
  //     originalMint.publicKey.toString()
  //   );
  //   expect(stakeEntryData.parsed.pool.toString()).to.eq(stakePoolId.toString());
  //   expect(stakeEntryData.parsed.stakeMint).to.eq(null);
  // });

  // it("Init stake mint", async () => {
  //   const provider = getProvider();

  //   const [transaction, stakeMintKeypair] = await initStakeMint(
  //     provider.connection,
  //     provider.wallet,
  //     {
  //       stakePoolId: stakePoolId,
  //       originalMintId: originalMint.publicKey,
  //       amount: new BN(stakingAmount),
  //     }
  //   );

  //   await expectTXTable(
  //     new TransactionEnvelope(SolanaProvider.init(provider), [
  //       ...transaction.instructions,
  //     ]),
  //     "Init stake mint"
  //   ).to.be.fulfilled;

  //   const checkMint = new splToken.Token(
  //     provider.connection,
  //     stakeMintKeypair.publicKey,
  //     splToken.TOKEN_PROGRAM_ID,
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     null
  //   );

  //   checkMint.getMintInfo()
  // });

  // it("Stake", async () => {
  //   const provider = getProvider();

  //   await expectTXTable(
  //     new TransactionEnvelope(SolanaProvider.init(provider), [
  //       ...(
  //         await stake(provider.connection, provider.wallet, {
  //           stakePoolId: stakePoolId,
  //           originalMintId: originalMint.publicKey,
  //           userOriginalMintTokenAccountId: originalMintTokenAccountId,
  //           receiptType: ReceiptType.Receipt,
  //           amount: new BN(stakingAmount),
  //         })
  //       ).instructions,
  //     ]),
  //     "Stake"
  //   ).to.be.fulfilled;

  // const stakeEntryData = await getStakeEntry(
  //   provider.connection,
  //   (
  //     await findStakeEntryId(stakePoolId, originalMint.publicKey)
  //   )[0]
  // );

  // const userOriginalMintTokenAccountId = await findAta(
  //   originalMint.publicKey,
  //   provider.wallet.publicKey,
  //   true
  // );

  // expect(stakeEntryData.parsed.amount.toNumber()).to.eq(10);
  // expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.be.greaterThan(0);
  // expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
  //   provider.wallet.publicKey.toString()
  // );

  // const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
  //   userOriginalMintTokenAccountId
  // );
  // expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);
  // expect(checkUserOriginalTokenAccount.isFrozen).to.eq(true);
  // });

  // it("Unstake", async () => {
  //   const provider = getProvider();
  //   await expectTXTable(
  //     new TransactionEnvelope(SolanaProvider.init(provider), [
  //       ...(
  //         await unstake(provider.connection, provider.wallet, {
  //           stakePoolId: stakePoolId,
  //           originalMintId: originalMint.publicKey,
  //         })
  //       ).instructions,
  //     ]),
  //     "Unstake"
  //   ).to.be.fulfilled;

  //   const stakeEntryData = await getStakeEntry(
  //     provider.connection,
  //     (
  //       await findStakeEntryId(stakePoolId, originalMint.publicKey)
  //     )[0]
  //   );
  //   expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
  //     PublicKey.default.toString()
  //   );
  //   expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.gt(0);

  //   const userOriginalMintTokenAccountId = await findAta(
  //     originalMint.publicKey,
  //     provider.wallet.publicKey,
  //     true
  //   );
  //   const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
  //     userOriginalMintTokenAccountId
  //   );
  //   expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);
  //   expect(checkUserOriginalTokenAccount.isFrozen).to.eq(false);
  // });
});
