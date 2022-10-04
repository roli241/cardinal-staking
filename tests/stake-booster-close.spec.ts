import { tryGetAccount } from "@cardinal/common";
import { expectTXTable } from "@saberhq/chai-solana";
import {
  SignerWallet,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import type * as splToken from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import { expect } from "chai";

import { createStakePool } from "../src";
import { getStakeBooster } from "../src/programs/stakePool/accounts";
import { findStakeBoosterId } from "../src/programs/stakePool/pda";
import {
  withCloseStakeBooster,
  withInitStakeBooster,
} from "../src/programs/stakePool/transaction";
import { createMasterEditionIxs, createMint } from "./utils";
import { getProvider } from "./workspace";

describe("Create stake pool", () => {
  let stakePoolId: PublicKey;
  let originalMint: splToken.Token;
  let paymentMint: splToken.Token;
  const originalMintAuthority = Keypair.generate();
  const STAKE_BOOSTER_PAYMENT_AMOUNT = new BN(2);
  const BOOST_SECONDS = new BN(10);

  before(async () => {
    const provider = getProvider();
    // original mint
    [, originalMint] = await createMint(
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
    [, paymentMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey,
      100,
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

    const [stakeBoosterId] = await findStakeBoosterId(stakePoolId);
    const stakeBooster = await getStakeBooster(
      provider.connection,
      stakeBoosterId
    );
    expect(stakeBooster.parsed.stakePool.toString()).to.eq(
      stakePoolId.toString()
    );
    expect(stakeBooster.parsed.identifier.toString()).to.eq(
      new BN(0).toString()
    );
    expect(stakeBooster.parsed.boostSeconds.toString()).to.eq(
      BOOST_SECONDS.toString()
    );
    expect(stakeBooster.parsed.paymentAmount.toString()).to.eq(
      STAKE_BOOSTER_PAYMENT_AMOUNT.toString()
    );
    expect(stakeBooster.parsed.paymentMint.toString()).to.eq(
      paymentMint.publicKey.toString()
    );
  });

  it("Close booster", async () => {
    const provider = getProvider();
    const [stakeBoosterId] = await findStakeBoosterId(stakePoolId);
    await expectTXTable(
      new TransactionEnvelope(
        SolanaProvider.init(provider),
        (
          await withCloseStakeBooster(
            new Transaction(),
            provider.connection,
            provider.wallet,
            {
              stakePoolId: stakePoolId,
            }
          )
        ).instructions
      ),
      "Create booster"
    ).to.be.fulfilled;

    const stakeBooster = await tryGetAccount(() =>
      getStakeBooster(provider.connection, stakeBoosterId)
    );
    expect(stakeBooster).to.eq(null);
  });
});
