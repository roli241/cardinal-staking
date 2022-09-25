import type { AccountData } from "@cardinal/common";
import { tryGetAccount } from "@cardinal/common";
import {
  AnchorProvider,
  BorshAccountsCoder,
  Program,
  utils,
} from "@project-serum/anchor";
import { SignerWallet } from "@saberhq/solana-contrib";
import type { Connection } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";

import { REWARD_DISTRIBUTOR_ADDRESS } from "../rewardDistributor";
import type {
  REWARD_RECEIPT_MANAGER_PROGRAM,
  RewardReceiptData,
  RewardReceiptManagerData,
} from "./constants";
import {
  REWARD_RECEIPT_MANAGER_ADDRESS,
  REWARD_RECEIPT_MANAGER_IDL,
} from "./constants";

const getProgram = (connection: Connection) => {
  const provider = new AnchorProvider(
    connection,
    new SignerWallet(Keypair.generate()),
    {}
  );
  return new Program<REWARD_RECEIPT_MANAGER_PROGRAM>(
    REWARD_RECEIPT_MANAGER_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
};

//////// REWARD RECEIPT MANAGER ////////
export const getRewardReceiptManager = async (
  connection: Connection,
  rewardReceiptManagerId: PublicKey
): Promise<AccountData<RewardReceiptManagerData>> => {
  const rewardReceiptManagerProgram = getProgram(connection);

  const parsed =
    (await rewardReceiptManagerProgram.account.rewardReceiptManager.fetch(
      rewardReceiptManagerId
    )) as RewardReceiptManagerData;
  return {
    parsed,
    pubkey: rewardReceiptManagerId,
  };
};

export const getAllRewardReceiptManagers = async (
  connection: Connection
): Promise<AccountData<RewardReceiptManagerData>[]> =>
  getAllOfType<RewardReceiptManagerData>(connection, "rewardReceiptManager");

export const getRewardReceiptManagersForPool = async (
  connection: Connection,
  stakePoolId: PublicKey
): Promise<AccountData<RewardReceiptData>[]> => {
  const programAccounts = await connection.getProgramAccounts(
    REWARD_DISTRIBUTOR_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: utils.bytes.bs58.encode(
              BorshAccountsCoder.accountDiscriminator("rewardReceiptManager")
            ),
          },
        },
        {
          memcmp: {
            offset: 9,
            bytes: stakePoolId.toBase58(),
          },
        },
      ],
    }
  );
  const rewardReceiptManagerDatas: AccountData<RewardReceiptData>[] = [];
  const coder = new BorshAccountsCoder(REWARD_RECEIPT_MANAGER_IDL);
  programAccounts.forEach((account) => {
    try {
      const rewardReceiptManagerData: RewardReceiptData = coder.decode(
        "rewardReceiptManager",
        account.account.data
      );
      if (rewardReceiptManagerData) {
        rewardReceiptManagerDatas.push({
          ...account,
          parsed: rewardReceiptManagerData,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
  return rewardReceiptManagerDatas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};

//////// REWARD RECEIPT ////////
export const getRewardReceipt = async (
  connection: Connection,
  rewardReceiptId: PublicKey
): Promise<AccountData<RewardReceiptData>> => {
  const rewardReceiptManagerProgram = getProgram(connection);

  const parsed = (await rewardReceiptManagerProgram.account.rewardReceipt.fetch(
    rewardReceiptId
  )) as RewardReceiptData;
  return {
    parsed,
    pubkey: rewardReceiptId,
  };
};

export const getAllRewardReceipts = async (
  connection: Connection
): Promise<AccountData<RewardReceiptManagerData>[]> =>
  getAllOfType<RewardReceiptManagerData>(connection, "rewardReceipt");

export const getRewardReceiptsForManager = async (
  connection: Connection,
  rewardDistributorId: PublicKey
): Promise<AccountData<RewardReceiptData>[]> => {
  const programAccounts = await connection.getProgramAccounts(
    REWARD_DISTRIBUTOR_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: utils.bytes.bs58.encode(
              BorshAccountsCoder.accountDiscriminator("rewardReceipt")
            ),
          },
        },
        {
          memcmp: {
            offset: 41,
            bytes: rewardDistributorId.toBase58(),
          },
        },
      ],
    }
  );
  const rewardReceiptDatas: AccountData<RewardReceiptData>[] = [];
  const coder = new BorshAccountsCoder(REWARD_RECEIPT_MANAGER_IDL);
  programAccounts.forEach((account) => {
    try {
      const rewardReceiptData: RewardReceiptData = coder.decode(
        "rewardReceipt",
        account.account.data
      );
      if (rewardReceiptData) {
        rewardReceiptDatas.push({
          ...account,
          parsed: rewardReceiptData,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
  return rewardReceiptDatas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};

export const getClaimableRewardReceiptsForManager = async (
  connection: Connection,
  rewardReceiptManagerId: PublicKey
): Promise<AccountData<RewardReceiptData>[]> => {
  const checkRewardReceiptManagerData = await tryGetAccount(() =>
    getRewardReceiptManager(connection, rewardReceiptManagerId)
  );
  if (!checkRewardReceiptManagerData) {
    throw `No reward receipt manager found for ${rewardReceiptManagerId.toString()}`;
  }
  const rewardReceipts = await getRewardReceiptsForManager(
    connection,
    rewardReceiptManagerId
  );
  return rewardReceipts.filter(
    (receipt) =>
      receipt.parsed.target.toString() !== PublicKey.default.toString()
  );
};

//////// utils ////////
export const getAllOfType = async <T>(
  connection: Connection,
  key: string
): Promise<AccountData<T>[]> => {
  const programAccounts = await connection.getProgramAccounts(
    REWARD_RECEIPT_MANAGER_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: utils.bytes.bs58.encode(
              BorshAccountsCoder.accountDiscriminator(key)
            ),
          },
        },
      ],
    }
  );

  const datas: AccountData<T>[] = [];
  const coder = new BorshAccountsCoder(REWARD_RECEIPT_MANAGER_IDL);
  programAccounts.forEach((account) => {
    try {
      const data: T = coder.decode(key, account.account.data);
      if (data) {
        datas.push({
          ...account,
          parsed: data,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });

  return datas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};
