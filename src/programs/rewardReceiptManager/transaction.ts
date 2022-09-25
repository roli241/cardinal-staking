import {
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { getPaymentManager } from "@cardinal/token-manager/dist/cjs/programs/paymentManager/accounts";
import { findPaymentManagerAddress } from "@cardinal/token-manager/dist/cjs/programs/paymentManager/pda";
import type { BN, web3 } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";

import { findStakeEntryId } from "../stakePool/pda";
import { getRewardReceiptManager } from "./accounts";
import { DEFAULT_PAYMENT_COLLECTOR } from "./constants";
import {
  closeRewardReceipt,
  closeRewardReceiptManager,
  createRewardReceipt,
  disallowMint,
  initRewardReceiptManager,
  updateRewardReceiptManager,
} from "./instruction";
import { findRewardReceiptId, findRewardReceiptManagerId } from "./pda";

export const withInitRewardReceiptManager = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    name: string;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredRewardSeconds: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    paymentManagerName: PublicKey;
    maxClaimedReceipts?: BN;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const [rewardReceiptManagerId] = await findRewardReceiptManagerId(
    params.stakePoolId,
    params.name
  );
  const [paymentManagerId] = await findPaymentManagerAddress(params.name);
  const checkPaymentManager = await tryGetAccount(() =>
    getPaymentManager(connection, paymentManagerId)
  );
  if (!checkPaymentManager) {
    throw `Payment manager with name ${params.name} not found`;
  }

  transaction.add(
    initRewardReceiptManager(connection, wallet, {
      rewardReceiptManager: rewardReceiptManagerId,
      stakePoolId: params.stakePoolId,
      name: params.name,
      authority: params.authority,
      requiredRewardSeconds: params.requiredRewardSeconds,
      paymentAmount: params.paymentAmount,
      paymentMint: params.paymentMint,
      paymentManager: paymentManagerId,
      maxClaimedReceipts: params.maxClaimedReceipts,
    })
  );
  return [transaction, rewardReceiptManagerId];
};

export const withUpdateRewardReceiptManager = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    name: string;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredRewardSeconds: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    paymentManagerName: string;
    maxClaimedReceipts?: BN;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const [rewardReceiptManagerId] = await findRewardReceiptManagerId(
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
    updateRewardReceiptManager(connection, wallet, {
      rewardReceiptManager: rewardReceiptManagerId,
      stakePoolId: params.stakePoolId,
      authority: params.authority,
      requiredRewardSeconds: params.requiredRewardSeconds,
      paymentAmount: params.paymentAmount,
      paymentMint: params.paymentMint,
      paymentManager: paymentManagerId,
      maxClaimedReceipts: params.maxClaimedReceipts,
    })
  );
  return [transaction, rewardReceiptManagerId];
};

export const withCreateRewardReceipt = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManagerName: string;
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    claimer: PublicKey;
    payer: PublicKey;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const [rewardReceiptManagerId] = await findRewardReceiptManagerId(
    params.stakePoolId,
    params.rewardReceiptManagerName
  );
  const checkRewardReceiptManager = await tryGetAccount(() =>
    getRewardReceiptManager(connection, rewardReceiptManagerId)
  );
  if (!checkRewardReceiptManager) {
    throw `No reward receipt manager found with name ${
      params.rewardReceiptManagerName
    } for pool ${params.stakePoolId.toString()}`;
  }
  const [rewardReceiptId] = await findRewardReceiptId(
    rewardReceiptManagerId,
    params.stakeEntryId
  );

  const checkPaymentManager = await tryGetAccount(() =>
    getPaymentManager(
      connection,
      checkRewardReceiptManager.parsed.paymentManager
    )
  );
  if (!checkPaymentManager) {
    throw `Could not find payment manager with address ${checkRewardReceiptManager.parsed.paymentManager.toString()}`;
  }

  const feeCollectorTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    checkRewardReceiptManager.parsed.paymentMint,
    checkPaymentManager.parsed.feeCollector,
    wallet.publicKey
  );
  const paymentTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    checkRewardReceiptManager.parsed.paymentMint,
    DEFAULT_PAYMENT_COLLECTOR,
    wallet.publicKey
  );
  const payerTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    checkRewardReceiptManager.parsed.paymentMint,
    params.payer,
    wallet.publicKey
  );

  transaction.add(
    createRewardReceipt(connection, wallet, {
      rewardReceiptManager: rewardReceiptManagerId,
      rewardReceipt: rewardReceiptId,
      stakeEntry: params.stakeEntryId,
      paymentManager: checkRewardReceiptManager.parsed.paymentManager,
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

export const withCloseRewardReceiptManager = (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
  }
): Transaction => {
  transaction.add(
    closeRewardReceiptManager(connection, wallet, {
      rewardReceiptManager: params.rewardReceiptManagerId,
    })
  );
  return transaction;
};

export const withCloseRewardReceipt = (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
  }
): Transaction => {
  transaction.add(
    closeRewardReceipt(connection, wallet, {
      rewardReceiptManager: params.rewardReceiptManagerId,
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
    rewardReceiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
    mintId: PublicKey;
  }
): Promise<Transaction> => {
  const checkRewardReceiptManager = await tryGetAccount(() =>
    getRewardReceiptManager(connection, params.rewardReceiptManagerId)
  );
  if (!checkRewardReceiptManager) {
    throw `No reward receipt manager found ${params.rewardReceiptManagerId.toString()}`;
  }
  const [stakeEntryId] = await findStakeEntryId(
    wallet.publicKey,
    checkRewardReceiptManager.parsed.stakePool,
    params.mintId,
    false
  );
  transaction.add(
    disallowMint(connection, wallet, {
      rewardReceiptManager: params.rewardReceiptManagerId,
      rewardReceipt: params.rewardReceiptId,
      stakeEntry: stakeEntryId,
    })
  );
  return transaction;
};
