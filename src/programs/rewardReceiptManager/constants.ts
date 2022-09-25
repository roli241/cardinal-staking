import type { AnchorTypes } from "@saberhq/anchor-contrib";
import { PublicKey } from "@solana/web3.js";

import * as REWARD_RECEIPT_MANAGER_TYPES from "../../idl/cardinal_reward_receipt_manager";

export const REWARD_RECEIPT_MANAGER_ADDRESS = new PublicKey(
  "rrmevmpXMooxn8Qu6u7RWao93BZn4cKgfjtNMURSc2E"
);

export const DEFAULT_PAYMENT_COLLECTOR = new PublicKey(
  "cpmaMZyBQiPxpeuxNsQhW7N8z1o9yaNdLgiPhWGUEiX"
);

export const REWARD_RECEIPT_MANAGER_SEED = "reward-receipt-manager";
export const REWARD_RECEIPT_SEED = "reward-receipt";

export type REWARD_RECEIPT_MANAGER_PROGRAM =
  REWARD_RECEIPT_MANAGER_TYPES.CardinalRewardReceiptManager;

export const REWARD_RECEIPT_MANAGER_IDL = REWARD_RECEIPT_MANAGER_TYPES.IDL;

export type RewardDistributorTypes =
  AnchorTypes<REWARD_RECEIPT_MANAGER_PROGRAM>;

type Accounts = RewardDistributorTypes["Accounts"];
export type RewardReceiptManagerData = Accounts["rewardReceiptManager"];
export type RewardReceiptData = Accounts["rewardReceipt"];
