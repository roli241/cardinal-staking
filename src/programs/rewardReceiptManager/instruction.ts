import { PAYMENT_MANAGER_ADDRESS } from "@cardinal/token-manager/dist/cjs/programs/paymentManager";
import type { BN } from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import { TOKEN_PROGRAM_ID } from "@saberhq/token-utils";
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";

import type { REWARD_RECEIPT_MANAGER_PROGRAM } from "./constants";
import {
  REWARD_RECEIPT_MANAGER_ADDRESS,
  REWARD_RECEIPT_MANAGER_IDL,
} from "./constants";

export const initRewardReceiptManager = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManager: PublicKey;
    stakePoolId: PublicKey;
    name: string;
    authority: PublicKey;
    requiredRewardSeconds: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    paymentManager: PublicKey;
    maxClaimedReceipts?: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardReceiptManagerProgram =
    new Program<REWARD_RECEIPT_MANAGER_PROGRAM>(
      REWARD_RECEIPT_MANAGER_IDL,
      REWARD_RECEIPT_MANAGER_ADDRESS,
      provider
    );
  return rewardReceiptManagerProgram.instruction.initRewardReceiptManager(
    {
      name: params.name,
      authority: params.authority,
      requiredRewardSeconds: params.requiredRewardSeconds,
      paymentAmount: params.paymentAmount,
      paymentMint: params.paymentMint,
      paymentManager: params.paymentManager,
      maxClaimedReceipts: params.maxClaimedReceipts ?? null,
    },
    {
      accounts: {
        rewardReceiptManager: params.rewardReceiptManager,
        stakePool: params.stakePoolId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const updateRewardReceiptManager = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManager: PublicKey;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredRewardSeconds: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    paymentManager: PublicKey;
    maxClaimedReceipts?: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardReceiptManagerProgram =
    new Program<REWARD_RECEIPT_MANAGER_PROGRAM>(
      REWARD_RECEIPT_MANAGER_IDL,
      REWARD_RECEIPT_MANAGER_ADDRESS,
      provider
    );
  return rewardReceiptManagerProgram.instruction.updateRewardReceiptManager(
    {
      authority: params.authority,
      requiredRewardSeconds: params.requiredRewardSeconds,
      paymentAmount: params.paymentAmount,
      paymentMint: params.paymentMint,
      paymentManager: params.paymentManager,
      maxClaimedReceipts: params.maxClaimedReceipts ?? null,
    },
    {
      accounts: {
        rewardReceiptManager: params.rewardReceiptManager,
        authority: wallet.publicKey,
      },
    }
  );
};

export const createRewardReceipt = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManager: PublicKey;
    rewardReceipt: PublicKey;
    stakeEntry: PublicKey;
    paymentManager: PublicKey;
    feeCollectorTokenAccount: PublicKey;
    paymentTokenAccount: PublicKey;
    payerTokenAccount: PublicKey;
    payer: PublicKey;
    claimer: PublicKey;
    initializer: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardReceiptManagerProgram =
    new Program<REWARD_RECEIPT_MANAGER_PROGRAM>(
      REWARD_RECEIPT_MANAGER_IDL,
      REWARD_RECEIPT_MANAGER_ADDRESS,
      provider
    );
  return rewardReceiptManagerProgram.instruction.createRewardReceipt({
    accounts: {
      rewardReceipt: params.rewardReceipt,
      rewardReceiptManager: params.rewardReceiptManager,
      stakeEntry: params.stakeEntry,
      paymentManager: params.paymentManager,
      feeCollectorTokenAccount: params.feeCollectorTokenAccount,
      paymentTokenAccount: params.paymentTokenAccount,
      payerTokenAccount: params.payerTokenAccount,
      payer: params.payer,
      claimer: params.claimer,
      initializer: params.initializer,
      cardinalPaymentManager: PAYMENT_MANAGER_ADDRESS,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
  });
};

export const closeRewardReceiptManager = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManager: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardReceiptManagerProgram =
    new Program<REWARD_RECEIPT_MANAGER_PROGRAM>(
      REWARD_RECEIPT_MANAGER_IDL,
      REWARD_RECEIPT_MANAGER_ADDRESS,
      provider
    );
  return rewardReceiptManagerProgram.instruction.closeRewardReceiptManager({
    accounts: {
      rewardReceiptManager: params.rewardReceiptManager,
      authority: wallet.publicKey,
    },
  });
};

export const closeRewardReceipt = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManager: PublicKey;
    rewardReceipt: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardReceiptManagerProgram =
    new Program<REWARD_RECEIPT_MANAGER_PROGRAM>(
      REWARD_RECEIPT_MANAGER_IDL,
      REWARD_RECEIPT_MANAGER_ADDRESS,
      provider
    );
  return rewardReceiptManagerProgram.instruction.closeRewardReceipt({
    accounts: {
      rewardReceipt: params.rewardReceipt,
      rewardReceiptManager: params.rewardReceiptManager,
      authority: wallet.publicKey,
    },
  });
};

export const disallowMint = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardReceiptManager: PublicKey;
    rewardReceipt: PublicKey;
    stakeEntry: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardReceiptManagerProgram =
    new Program<REWARD_RECEIPT_MANAGER_PROGRAM>(
      REWARD_RECEIPT_MANAGER_IDL,
      REWARD_RECEIPT_MANAGER_ADDRESS,
      provider
    );
  return rewardReceiptManagerProgram.instruction.disallowMint({
    accounts: {
      rewardReceipt: params.rewardReceipt,
      rewardReceiptManager: params.rewardReceiptManager,
      stakeEntry: params.stakeEntry,
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};
