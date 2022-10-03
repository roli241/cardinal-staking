import {
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { getPaymentManager } from "@cardinal/token-manager/dist/cjs/programs/paymentManager/accounts";
import { findPaymentManagerAddress } from "@cardinal/token-manager/dist/cjs/programs/paymentManager/pda";
import type { BN, web3 } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";

import { updateTotalStakeSeconds } from "../stakePool/instruction";
import { findStakeEntryId } from "../stakePool/pda";
import { getreceiptManager } from "./accounts";
import { DEFAULT_PAYMENT_COLLECTOR } from "./constants";
import {
  closeReceiptManager,
  closeRewardReceipt,
  createRewardReceipt,
  disallowMint,
  initreceiptManager,
  updateReceiptManager,
} from "./instruction";
import {
  findReceiptEntryId,
  findReceiptManagerId,
  findRewardReceiptId,
} from "./pda";

export const withInitReceiptManager = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    name: string;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredStakeSeconds: BN;
    usesStakeSeconds: BN;
    paymentMint: PublicKey;
    paymentManagerName: string;
    maxClaimedReceipts?: BN;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const [receiptManagerId] = await findReceiptManagerId(
    params.stakePoolId,
    params.name
  );
  const [paymentManagerId] = await findPaymentManagerAddress(
    params.paymentManagerName
  );
  const checkPaymentManager = await tryGetAccount(() =>
    getPaymentManager(connection, paymentManagerId)
  );
  if (!checkPaymentManager) {
    throw `Payment manager with name ${params.paymentManagerName} not found`;
  }

  transaction.add(
    initreceiptManager(connection, wallet, {
      receiptManager: receiptManagerId,
      stakePoolId: params.stakePoolId,
      name: params.name,
      authority: params.authority,
      requiredStakeSeconds: params.requiredStakeSeconds,
      usesStakeSeconds: params.usesStakeSeconds,
      paymentMint: params.paymentMint,
      paymentManager: paymentManagerId,
      maxClaimedReceipts: params.maxClaimedReceipts,
    })
  );
  return [transaction, receiptManagerId];
};

export const withupdateReceiptManager = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    name: string;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredStakeSeconds: BN;
    usesStakeSeconds: BN;
    paymentMint: PublicKey;
    paymentManagerName: string;
    maxClaimedReceipts?: BN;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const [receiptManagerId] = await findReceiptManagerId(
    params.stakePoolId,
    params.name
  );
  const [paymentManagerId] = await findPaymentManagerAddress(
    params.paymentManagerName
  );
  const checkPaymentManager = await tryGetAccount(() =>
    getPaymentManager(connection, paymentManagerId)
  );
  if (!checkPaymentManager) {
    throw `Payment manager with name ${params.name} not found`;
  }

  transaction.add(
    updateReceiptManager(connection, wallet, {
      receiptManager: receiptManagerId,
      stakePoolId: params.stakePoolId,
      authority: params.authority,
      requiredStakeSeconds: params.requiredStakeSeconds,
      usesStakeSeconds: params.usesStakeSeconds,
      paymentMint: params.paymentMint,
      paymentManager: paymentManagerId,
      maxClaimedReceipts: params.maxClaimedReceipts,
    })
  );
  return [transaction, receiptManagerId];
};

export const withCreateRewardReceipt = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManagerName: string;
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    claimer: PublicKey;
    payer: PublicKey;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const [receiptManagerId] = await findReceiptManagerId(
    params.stakePoolId,
    params.receiptManagerName
  );
  const checkreceiptManager = await tryGetAccount(() =>
    getreceiptManager(connection, receiptManagerId)
  );
  if (!checkreceiptManager) {
    throw `No reward receipt manager found with name ${
      params.receiptManagerName
    } for pool ${params.stakePoolId.toString()}`;
  }
  const [receiptEntryId] = await findReceiptEntryId(params.stakeEntryId);

  const [rewardReceiptId] = await findRewardReceiptId(
    receiptManagerId,
    receiptEntryId
  );

  const checkPaymentManager = await tryGetAccount(() =>
    getPaymentManager(connection, checkreceiptManager.parsed.paymentManager)
  );
  if (!checkPaymentManager) {
    throw `Could not find payment manager with address ${checkreceiptManager.parsed.paymentManager.toString()}`;
  }

  const feeCollectorTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    checkreceiptManager.parsed.paymentMint,
    checkPaymentManager.parsed.feeCollector,
    wallet.publicKey
  );
  const paymentTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    checkreceiptManager.parsed.paymentMint,
    DEFAULT_PAYMENT_COLLECTOR,
    wallet.publicKey
  );
  const payerTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    checkreceiptManager.parsed.paymentMint,
    params.payer,
    wallet.publicKey
  );

  transaction.add(
    updateTotalStakeSeconds(connection, wallet, {
      stakEntryId: params.stakeEntryId,
      lastStaker: params.claimer,
    })
  );

  transaction.add(
    createRewardReceipt(connection, wallet, {
      receiptManager: receiptManagerId,
      rewardReceipt: rewardReceiptId,
      stakeEntry: params.stakeEntryId,
      receiptEntry: receiptEntryId,
      paymentManager: checkreceiptManager.parsed.paymentManager,
      feeCollectorTokenAccount: feeCollectorTokenAccountId,
      paymentTokenAccount: paymentTokenAccountId,
      payerTokenAccount: payerTokenAccountId,
      payer: params.payer,
      claimer: params.claimer,
      initializer: wallet.publicKey,
    })
  );
  return [transaction, rewardReceiptId];
};

export const withcloseReceiptManager = (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
  }
): Transaction => {
  transaction.add(
    closeReceiptManager(connection, wallet, {
      receiptManager: params.receiptManagerId,
    })
  );
  return transaction;
};

export const withCloseRewardReceipt = (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
  }
): Transaction => {
  transaction.add(
    closeRewardReceipt(connection, wallet, {
      receiptManager: params.receiptManagerId,
      rewardReceipt: params.rewardReceiptId,
    })
  );
  return transaction;
};

export const withDisallowMint = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
    mintId: PublicKey;
  }
): Promise<Transaction> => {
  const checkreceiptManager = await tryGetAccount(() =>
    getreceiptManager(connection, params.receiptManagerId)
  );
  if (!checkreceiptManager) {
    throw `No reward receipt manager found ${params.receiptManagerId.toString()}`;
  }
  const [stakeEntryId] = await findStakeEntryId(
    wallet.publicKey,
    checkreceiptManager.parsed.stakePool,
    params.mintId,
    false
  );
  const [receiptEntryId] = await findReceiptEntryId(stakeEntryId);
  transaction.add(
    disallowMint(connection, wallet, {
      receiptManager: params.receiptManagerId,
      rewardReceipt: params.rewardReceiptId,
      receiptEntry: receiptEntryId,
    })
  );
  return transaction;
};
