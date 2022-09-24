import {
  findAta,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import { RewardDistributorKind } from "./constants";

export const withRemainingAccountsForKind = async (
  transaction: Transaction,
  connection: Connection,
  user: PublicKey,
  rewardDistributorId: PublicKey,
  kind: RewardDistributorKind,
  rewardMint: PublicKey,
  payer = user,
  isClaimRewards?: boolean
): Promise<AccountMeta[]> => {
  switch (kind) {
    case RewardDistributorKind.Mint: {
      return [];
    }
    case RewardDistributorKind.Treasury: {
      const rewardDistributorRewardMintTokenAccountId =
        await withFindOrInitAssociatedTokenAccount(
          transaction,
          connection,
          rewardMint,
          rewardDistributorId,
          payer,
          true
        );
      const userRewardMintTokenAccountId = await findAta(
        rewardMint,
        user,
        true
      );
      return [
        {
          pubkey: rewardDistributorRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
      ].concat(
        !isClaimRewards
          ? [
              {
                pubkey: userRewardMintTokenAccountId,
                isSigner: false,
                isWritable: true,
              },
            ]
          : []
      );
    }
    default:
      return [];
  }
};
