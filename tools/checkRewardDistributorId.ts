import { BN, utils } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

import {
  REWARD_DISTRIBUTOR_ADDRESS,
  REWARD_DISTRIBUTOR_SEED,
} from "../src/programs/rewardDistributor";

const check = async (stakePoolId: PublicKey, identifier: BN) => {
  const [id] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED),
      stakePoolId.toBuffer(),
      identifier.toArrayLike(Buffer, "le", 8),
    ],
    REWARD_DISTRIBUTOR_ADDRESS
  );

  const [id2] = await PublicKey.findProgramAddress(
    [utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED), stakePoolId.toBuffer()],
    REWARD_DISTRIBUTOR_ADDRESS
  );

  const [id3] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED),
      stakePoolId.toBuffer(),
      utils.bytes.utf8.encode(""),
    ],
    REWARD_DISTRIBUTOR_ADDRESS
  );

  const [id4] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED),
      stakePoolId.toBuffer(),
      Buffer.from([]),
    ],
    REWARD_DISTRIBUTOR_ADDRESS
  );

  console.log(id.toString(), id2.toString(), id3.toString(), id4.toString());
};

check(
  new PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"),
  new BN(0)
).catch((e) => console.log(e));
