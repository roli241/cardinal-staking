import { findAta } from "@cardinal/common";
import { expectTXTable } from "@saberhq/chai-solana";
import {
  SignerWallet,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import type * as splToken from "@solana/spl-token";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import { expect } from "chai";

import { createStakePool, stake, unstake } from "../src";
import { ReceiptType } from "../src/programs/stakePool";
import { getStakeEntry } from "../src/programs/stakePool/accounts";
import { updateTotalStakeSeconds } from "../src/programs/stakePool/instruction";
import {
  withBoostStakeEntry,
  withInitStakeBooster,
} from "../src/programs/stakePool/transaction";
import { findStakeEntryIdFromMint } from "../src/programs/stakePool/utils";
import { createMasterEditionIxs, createMint } from "./utils";
import { getProvider } from "./workspace";

describe("Stake booster boost", () => {
  let stakePoolId: PublicKey;
  let originalMintTokenAccountId: PublicKey;
  let originalMint: splToken.Token;
  const originalMintAuthority = Keypair.generate();

  let paymentMintTokenAccount: PublicKey;
  let paymentMint: splToken.Token;
  const STAKE_BOOSTER_PAYMENT_AMOUNT = new BN(2);
  const BOOST_SECONDS = new BN(10);
  const SECONDS_TO_BOOST = new BN(30);
  const PAYMENT_SUPPLY = new BN(100);

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

    // payment mint
    [paymentMintTokenAccount, paymentMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey,
      PAYMENT_SUPPLY.toNumber(),
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

  it("Create booster", async () => {
    const provider = getProvider();
    await expectTXTable(
      new TransactionEnvelope(
        SolanaProvider.init(provider),
        (
          await withInitStakeBooster(
            new Transaction(),
            provider.connection,
            provider.wallet,
            {
              stakePoolId: stakePoolId,
              paymentAmount: STAKE_BOOSTER_PAYMENT_AMOUNT,
              paymentMint: paymentMint.publicKey,
              boostSeconds: BOOST_SECONDS,
              startTimeSeconds: Date.now() / 1000,
            }
          )
        ).instructions
      ),
      "Create booster"
    ).to.be.fulfilled;
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

  it("Update", async () => {
    const provider = getProvider();
    const stakeEntryId = (
      await findStakeEntryIdFromMint(
        provider.connection,
        provider.wallet.publicKey,
        stakePoolId,
        originalMint.publicKey
      )
    )[0];
    const oldStakeEntryData = await getStakeEntry(
      provider.connection,
      stakeEntryId
    );
    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        updateTotalStakeSeconds(provider.connection, provider.wallet, {
          stakEntryId: stakeEntryId,
          lastStaker: provider.wallet.publicKey,
        }),
      ]),
      "Update"
    ).to.be.fulfilled;

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      stakeEntryId
    );
    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.gt(
      oldStakeEntryData.parsed.lastStakedAt.toNumber()
    );
    expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
      provider.wallet.publicKey.toString()
    );
    expect(stakeEntryData.parsed.totalStakeSeconds.toNumber()).to.gt(
      oldStakeEntryData.parsed.totalStakeSeconds.toNumber()
    );

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );
    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);
    expect(checkUserOriginalTokenAccount.isFrozen).to.eq(true);
  });

  it("Unstake", async () => {
    const provider = getProvider();
    const stakeEntryId = (
      await findStakeEntryIdFromMint(
        provider.connection,
        provider.wallet.publicKey,
        stakePoolId,
        originalMint.publicKey
      )
    )[0];
    const oldStakeEntryData = await getStakeEntry(
      provider.connection,
      stakeEntryId
    );

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
    expect(stakeEntryData.parsed.totalStakeSeconds.toNumber()).to.gt(
      oldStakeEntryData.parsed.totalStakeSeconds.toNumber()
    );
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
  });

  it("Boost", async () => {
    const provider = getProvider();
    const stakeEntryId = (
      await findStakeEntryIdFromMint(
        provider.connection,
        provider.wallet.publicKey,
        stakePoolId,
        originalMint.publicKey
      )
    )[0];
    const oldStakeEntryData = await getStakeEntry(
      provider.connection,
      stakeEntryId
    );
    await expectTXTable(
      new TransactionEnvelope(
        SolanaProvider.init(provider),
        (
          await withBoostStakeEntry(
            new Transaction(),
            provider.connection,
            provider.wallet,
            {
              stakePoolId: stakePoolId,
              stakeEntryId: stakeEntryId,
              payerTokenAccount: paymentMintTokenAccount,
              paymentRecipientTokenAccount: paymentMintTokenAccount,
              secondsToBoost: SECONDS_TO_BOOST,
            }
          )
        ).instructions
      ),
      "Boost"
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
    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.eq(
      stakeEntryData.parsed.lastStakedAt
    );
    expect(stakeEntryData.parsed.totalStakeSeconds.toNumber()).to.eq(
      oldStakeEntryData.parsed.totalStakeSeconds.add(BOOST_SECONDS).toNumber()
    );
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

    const checkPaymentMintTokenAccount = await paymentMint.getAccountInfo(
      paymentMintTokenAccount
    );
    expect(checkPaymentMintTokenAccount.amount.toNumber()).to.eq(
      PAYMENT_SUPPLY.sub(
        SECONDS_TO_BOOST.mul(STAKE_BOOSTER_PAYMENT_AMOUNT).div(BOOST_SECONDS)
      ).toNumber()
    );
  });
});
