import { findAta, tryGetAccount, withWrapSol } from "@cardinal/common";
import { getPaymentManager } from "@cardinal/token-manager/dist/cjs/programs/paymentManager/accounts";
import { init } from "@cardinal/token-manager/dist/cjs/programs/paymentManager/instruction";
import { findPaymentManagerAddress } from "@cardinal/token-manager/dist/cjs/programs/paymentManager/pda";
import { BN } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import {
  SignerWallet,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import * as splToken from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { expect } from "chai";

import {
  createStakeEntry,
  createStakePool,
  rewardReceiptManager,
  stake,
} from "../src";
import { DEFAULT_PAYMENT_COLLECTOR } from "../src/programs/rewardReceiptManager";
import {
  getRewardReceipt,
  getRewardReceiptManager,
} from "../src/programs/rewardReceiptManager/accounts";
import { findRewardReceiptManagerId } from "../src/programs/rewardReceiptManager/pda";
import { withCreateRewardReceipt } from "../src/programs/rewardReceiptManager/transaction";
import { ReceiptType } from "../src/programs/stakePool";
import { getStakeEntry } from "../src/programs/stakePool/accounts";
import { findStakeEntryId } from "../src/programs/stakePool/pda";
import { findStakeEntryIdFromMint } from "../src/programs/stakePool/utils";
import { createMasterEditionIxs, createMint, delay } from "./utils";
import { getProvider } from "./workspace";

describe("Create reward receipt", () => {
  let originalMintTokenAccountId: PublicKey;
  let originalMint: splToken.Token;
  let stakePoolId: PublicKey;

  const originalMintAuthority = Keypair.generate();

  const rewardReceiptManagerName = `mgr-${Math.random()}`;
  const requiredRewardSeconds = new BN(5);

  const MAKER_FEE = 0;
  const TAKER_FEE = 0;
  const paymentManagerName = `cardinal-no-split`;
  const feeCollector = Keypair.generate();
  const paymentMint = new PublicKey(
    "So11111111111111111111111111111111111111112"
  );

  before(async () => {
    const provider = getProvider();
    // original mint
    [originalMintTokenAccountId, originalMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey,
      1,
      originalMintAuthority.publicKey
    );

    const transactionAirdrop = new Transaction();
    await withWrapSol(
      transactionAirdrop,
      provider.connection,
      provider.wallet,
      LAMPORTS_PER_SOL
    );

    const txEnvelopeAidrop = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      transactionAirdrop.instructions
    );
    await expectTXTable(txEnvelopeAidrop, "before", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const transaction = new Transaction();
    // master edition
    transaction.instructions.push(
      ...(await createMasterEditionIxs(
        originalMint.publicKey,
        originalMintAuthority.publicKey
      ))
    );
    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: new SignerWallet(originalMintAuthority),
        opts: provider.opts,
      }),
      transaction.instructions
    );
    await expectTXTable(txEnvelope, "before", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;
  });

  it("Create payment manager", async () => {
    const provider = getProvider();
    const transaction = new Transaction();

    const [ix, paymentManagerId] = await init(
      provider.connection,
      provider.wallet,
      paymentManagerName,
      {
        feeCollector: feeCollector.publicKey,
        makerFeeBasisPoints: MAKER_FEE,
        takerFeeBasisPoints: TAKER_FEE,
      }
    );

    const checkIfPaymentManagerExists = await tryGetAccount(() =>
      getPaymentManager(provider.connection, paymentManagerId)
    );
    if (!checkIfPaymentManagerExists) {
      transaction.add(ix);
      const txEnvelope = new TransactionEnvelope(
        SolanaProvider.init({
          connection: provider.connection,
          wallet: provider.wallet,
          opts: provider.opts,
        }),
        [...transaction.instructions]
      );
      await expectTXTable(txEnvelope, "Create Payment Manager", {
        verbosity: "error",
        formatLogs: true,
      }).to.be.fulfilled;
    }

    const paymentManagerData = await getPaymentManager(
      provider.connection,
      paymentManagerId
    );
    expect(paymentManagerData.parsed.name).to.eq(paymentManagerName);
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

  it("Create Reward Receipt Manager", async () => {
    const provider = getProvider();
    const transaction = new Transaction();
    const [, rewardReceiptManagerId] =
      await rewardReceiptManager.transaction.withInitRewardReceiptManager(
        transaction,
        provider.connection,
        provider.wallet,
        {
          name: rewardReceiptManagerName,
          stakePoolId: stakePoolId,
          authority: provider.wallet.publicKey,
          requiredRewardSeconds: requiredRewardSeconds,
          paymentMint: paymentMint,
          paymentManagerName: paymentManagerName,
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

    const rewardReceiptManagerData = await getRewardReceiptManager(
      provider.connection,
      rewardReceiptManagerId
    );
    const [payamentManagerId] = await findPaymentManagerAddress(
      paymentManagerName
    );
    expect(rewardReceiptManagerData.parsed.paymentManager.toString()).to.eq(
      payamentManagerId.toString()
    );
    expect(rewardReceiptManagerData.parsed.authority.toString()).to.eq(
      provider.wallet.publicKey.toString()
    );
    expect(rewardReceiptManagerData.parsed.paymentMint.toString()).to.eq(
      paymentMint.toString()
    );
    expect(rewardReceiptManagerData.parsed.stakePool.toString()).to.eq(
      stakePoolId.toString()
    );
    expect(
      rewardReceiptManagerData.parsed.requiredRewardSeconds.toString()
    ).to.eq(requiredRewardSeconds.toString());
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

  it("Fail Create Reward Receipt, duration not satisfied", async () => {
    const provider = getProvider();
    const [stakeEntryId] = await findStakeEntryId(
      provider.wallet.publicKey,
      stakePoolId,
      originalMint.publicKey,
      false
    );

    const transaction = new Transaction();
    await withCreateRewardReceipt(
      transaction,
      provider.connection,
      provider.wallet,
      {
        rewardReceiptManagerName: rewardReceiptManagerName,
        stakePoolId: stakePoolId,
        stakeEntryId: stakeEntryId,
        claimer: provider.wallet.publicKey,
        payer: provider.wallet.publicKey,
      }
    );
    expect(async () => {
      await expectTXTable(
        new TransactionEnvelope(SolanaProvider.init(provider), [
          ...transaction.instructions,
        ]),
        "Fail Create Reward Receipt, duration not satisfied"
      ).to.be.rejectedWith(Error);
    });
  });

  it("Create Reward Receipt", async () => {
    await delay(6000);
    const provider = getProvider();
    const [stakeEntryId] = await findStakeEntryId(
      provider.wallet.publicKey,
      stakePoolId,
      originalMint.publicKey,
      false
    );
    const checkMint = new splToken.Token(
      provider.connection,
      paymentMint,
      splToken.TOKEN_PROGRAM_ID,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      null
    );
    const paymentTokenAccountId = await findAta(
      paymentMint,
      DEFAULT_PAYMENT_COLLECTOR,
      true
    );
    let beforeBalance = 0;
    try {
      beforeBalance = (
        await checkMint.getAccountInfo(paymentTokenAccountId)
      ).amount.toNumber();
    } catch (e) {
      beforeBalance = 0;
    }

    const transaction = new Transaction();
    const [, rewardReceiptId] = await withCreateRewardReceipt(
      transaction,
      provider.connection,
      provider.wallet,
      {
        rewardReceiptManagerName: rewardReceiptManagerName,
        stakePoolId: stakePoolId,
        stakeEntryId: stakeEntryId,
        claimer: provider.wallet.publicKey,
        payer: provider.wallet.publicKey,
      }
    );
    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...transaction.instructions,
      ]),
      "Create Reward Receipt"
    ).to.be.fulfilled;

    const [rewardReceiptManagerId] = await findRewardReceiptManagerId(
      stakePoolId,
      rewardReceiptManagerName
    );

    const checkRewardReceiptData = await tryGetAccount(() =>
      getRewardReceipt(provider.connection, rewardReceiptId)
    );
    expect(checkRewardReceiptData).to.not.be.null;
    expect(checkRewardReceiptData?.parsed.target.toString()).to.eq(
      provider.wallet.publicKey.toString()
    );
    expect(checkRewardReceiptData?.parsed.stakeEntry.toString()).to.eq(
      stakeEntryId.toString()
    );
    expect(
      checkRewardReceiptData?.parsed.rewardReceiptManager.toString()
    ).to.eq(rewardReceiptManagerId.toString());

    const paymentTokenAccountData = await checkMint.getAccountInfo(
      paymentTokenAccountId
    );
    expect(paymentTokenAccountData.amount.toString()).to.eq(
      (beforeBalance + 2 * 10 ** 6).toString()
    );
  });
});
