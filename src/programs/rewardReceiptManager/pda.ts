import { utils } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

import {
  REWARD_RECEIPT_MANAGER_ADDRESS,
  REWARD_RECEIPT_MANAGER_SEED,
  REWARD_RECEIPT_SEED,
} from ".";

/**
 * Finds the reward receipt manager id.
 * @returns
 */
export const findRewardReceiptManagerId = async (
  stakePoolId: PublicKey,
  name: string
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(REWARD_RECEIPT_MANAGER_SEED),
      stakePoolId.toBuffer(),
      utils.bytes.utf8.encode(name),
    ],
    REWARD_RECEIPT_MANAGER_ADDRESS
  );
};

/**
 * Finds the reward receipt id.
 * @returns
 */
export const findRewardReceiptId = async (
  rewardReceiptManager: PublicKey,
  stakeEntryId: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(REWARD_RECEIPT_SEED),
      rewardReceiptManager.toBuffer(),
      stakeEntryId.toBuffer(),
    ],
    REWARD_RECEIPT_MANAGER_ADDRESS
  );
};
