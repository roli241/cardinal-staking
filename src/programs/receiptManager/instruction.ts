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

import type { RECEIPT_MANAGER_PROGRAM } from "./constants";
import { RECEIPT_MANAGER_ADDRESS, RECEIPT_MANAGER_IDL } from "./constants";

export const initreceiptManager = (
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManager: PublicKey;
    stakePoolId: PublicKey;
    name: string;
    authority: PublicKey;
    requiredStakeSeconds: BN;
    usesStakeSeconds: BN;
    paymentMint: PublicKey;
    paymentManager: PublicKey;
    maxClaimedReceipts?: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const receiptManagerProgram = new Program<RECEIPT_MANAGER_PROGRAM>(
    RECEIPT_MANAGER_IDL,
    RECEIPT_MANAGER_ADDRESS,
    provider
  );
  return receiptManagerProgram.instruction.initReceiptManager(
    {
      name: params.name,
      authority: params.authority,
      requiredStakeSeconds: params.requiredStakeSeconds,
      usesStakeSeconds: params.usesStakeSeconds,
      paymentMint: params.paymentMint,
      paymentManager: params.paymentManager,
      maxClaimedReceipts: params.maxClaimedReceipts ?? null,
    },
    {
      accounts: {
        receiptManager: params.receiptManager,
        stakePool: params.stakePoolId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const updateReceiptManager = (
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManager: PublicKey;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredStakeSeconds: BN;
    usesStakeSeconds: BN;
    paymentMint: PublicKey;
    paymentManager: PublicKey;
    maxClaimedReceipts?: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const receiptManagerProgram = new Program<RECEIPT_MANAGER_PROGRAM>(
    RECEIPT_MANAGER_IDL,
    RECEIPT_MANAGER_ADDRESS,
    provider
  );
  return receiptManagerProgram.instruction.updateReceiptManager(
    {
      authority: params.authority,
      requiredStakeSeconds: params.requiredStakeSeconds,
      usesStakeSeconds: params.usesStakeSeconds,
      paymentMint: params.paymentMint,
      paymentManager: params.paymentManager,
      maxClaimedReceipts: params.maxClaimedReceipts ?? null,
    },
    {
      accounts: {
        receiptManager: params.receiptManager,
        authority: wallet.publicKey,
      },
    }
  );
};

export const createRewardReceipt = (
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManager: PublicKey;
    rewardReceipt: PublicKey;
    stakeEntry: PublicKey;
    receiptEntry: PublicKey;
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
  const receiptManagerProgram = new Program<RECEIPT_MANAGER_PROGRAM>(
    RECEIPT_MANAGER_IDL,
    RECEIPT_MANAGER_ADDRESS,
    provider
  );
  return receiptManagerProgram.instruction.createRewardReceipt({
    accounts: {
      rewardReceipt: params.rewardReceipt,
      receiptManager: params.receiptManager,
      stakeEntry: params.stakeEntry,
      receiptEntry: params.receiptEntry,
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

export const closeReceiptManager = (
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManager: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const receiptManagerProgram = new Program<RECEIPT_MANAGER_PROGRAM>(
    RECEIPT_MANAGER_IDL,
    RECEIPT_MANAGER_ADDRESS,
    provider
  );
  return receiptManagerProgram.instruction.closeReceiptManager({
    accounts: {
      receiptManager: params.receiptManager,
      authority: wallet.publicKey,
    },
  });
};

export const closeRewardReceipt = (
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManager: PublicKey;
    rewardReceipt: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const receiptManagerProgram = new Program<RECEIPT_MANAGER_PROGRAM>(
    RECEIPT_MANAGER_IDL,
    RECEIPT_MANAGER_ADDRESS,
    provider
  );
  return receiptManagerProgram.instruction.closeRewardReceipt({
    accounts: {
      rewardReceipt: params.rewardReceipt,
      receiptManager: params.receiptManager,
      authority: wallet.publicKey,
    },
  });
};

export const disallowMint = (
  connection: Connection,
  wallet: Wallet,
  params: {
    receiptManager: PublicKey;
    rewardReceipt: PublicKey;
    receiptEntry: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const receiptManagerProgram = new Program<RECEIPT_MANAGER_PROGRAM>(
    RECEIPT_MANAGER_IDL,
    RECEIPT_MANAGER_ADDRESS,
    provider
  );
  return receiptManagerProgram.instruction.disallowEntry({
    accounts: {
      rewardReceipt: params.rewardReceipt,
      receiptManager: params.receiptManager,
      receiptEntry: params.receiptEntry,
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};
