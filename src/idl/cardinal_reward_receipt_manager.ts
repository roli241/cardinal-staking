export type CardinalRewardReceiptManager = {
  version: "1.8.4";
  name: "cardinal_reward_receipt_manager";
  instructions: [
    {
      name: "initRewardReceiptManager";
      accounts: [
        {
          name: "rewardReceiptManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakePool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "ix";
          type: {
            defined: "InitRewardReceiptManagerIx";
          };
        }
      ];
    },
    {
      name: "createRewardReceipt";
      accounts: [
        {
          name: "rewardReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardReceiptManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntry";
          isMut: false;
          isSigner: false;
        },
        {
          name: "paymentManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeCollectorTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "paymentTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "claimer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "initializer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "cardinalPaymentManager";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "updateRewardReceiptManager";
      accounts: [
        {
          name: "rewardReceiptManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "ix";
          type: {
            defined: "UpdateRewardReceiptManagerIx";
          };
        }
      ];
    },
    {
      name: "closeRewardReceiptManager";
      accounts: [
        {
          name: "rewardReceiptManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "closeRewardReceipt";
      accounts: [
        {
          name: "rewardReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardReceiptManager";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "disallowMint";
      accounts: [
        {
          name: "rewardReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardReceiptManager";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakeEntry";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "rewardReceiptManager";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "stakePool";
            type: "publicKey";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "requiredRewardSeconds";
            type: "u128";
          },
          {
            name: "claimedReceiptsCounter";
            type: "u128";
          },
          {
            name: "paymentMint";
            type: "publicKey";
          },
          {
            name: "paymentManager";
            type: "publicKey";
          },
          {
            name: "name";
            type: "string";
          },
          {
            name: "maxClaimedReceipts";
            type: {
              option: "u128";
            };
          }
        ];
      };
    },
    {
      name: "rewardReceipt";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "stakeEntry";
            type: "publicKey";
          },
          {
            name: "rewardReceiptManager";
            type: "publicKey";
          },
          {
            name: "target";
            type: "publicKey";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "InitRewardReceiptManagerIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "requiredRewardSeconds";
            type: "u128";
          },
          {
            name: "paymentMint";
            type: "publicKey";
          },
          {
            name: "paymentManager";
            type: "publicKey";
          },
          {
            name: "maxClaimedReceipts";
            type: {
              option: "u128";
            };
          }
        ];
      };
    },
    {
      name: "UpdateRewardReceiptManagerIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "requiredRewardSeconds";
            type: "u128";
          },
          {
            name: "paymentMint";
            type: "publicKey";
          },
          {
            name: "paymentManager";
            type: "publicKey";
          },
          {
            name: "maxClaimedReceipts";
            type: {
              option: "u128";
            };
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidAuthority";
      msg: "Invalid authority";
    },
    {
      code: 6001;
      name: "MaxNumberOfReceiptsExceeded";
      msg: "Max number of receipts exceeded";
    },
    {
      code: 6002;
      name: "InvalidClaimer";
      msg: "Invalid claimer";
    },
    {
      code: 6003;
      name: "InvalidRewardReceiptManager";
      msg: "Invalid rewards receipt manager";
    },
    {
      code: 6004;
      name: "CannotBlacklistDisallowReceipt";
      msg: "Cannot disallow claim reward receipt";
    },
    {
      code: 6005;
      name: "RewardSecondsNotSatisfied";
      msg: "Reward seconds not satisifed";
    },
    {
      code: 6006;
      name: "InvalidPayerTokenAcount";
      msg: "Invalid payer token account";
    },
    {
      code: 6007;
      name: "InvalidPaymentTargetTokenAccount";
      msg: "Invalid payment target account";
    },
    {
      code: 6008;
      name: "InvalidPaymentMint";
      msg: "Invalid payment mint";
    },
    {
      code: 6009;
      name: "InvalidPaymentTarget";
      msg: "Invalid payment target";
    },
    {
      code: 6010;
      name: "InvalidPaymentManager";
      msg: "Invalid payment manager";
    },
    {
      code: 6011;
      name: "InvalidPaymentAmountForMint";
      msg: "Invalid payment amount for mint";
    },
    {
      code: 6012;
      name: "InvalidMaxClaimedReceipts";
      msg: "Invalid max claimed receipts";
    },
    {
      code: 6013;
      name: "InvalidPaymentTokenAccount";
      msg: "Invalid payment token account";
    },
    {
      code: 6014;
      name: "InvalidFeeCollectorTokenAccount";
      msg: "Invalid fee collector token account";
    },
    {
      code: 6015;
      name: "InvalidPaymentCollector";
      msg: "Invalid payment collector";
    },
    {
      code: 6016;
      name: "InvalidRewardReceipt";
      msg: "Invalid reward receipt";
    }
  ];
};

export const IDL: CardinalRewardReceiptManager = {
  version: "1.8.4",
  name: "cardinal_reward_receipt_manager",
  instructions: [
    {
      name: "initRewardReceiptManager",
      accounts: [
        {
          name: "rewardReceiptManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakePool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "ix",
          type: {
            defined: "InitRewardReceiptManagerIx",
          },
        },
      ],
    },
    {
      name: "createRewardReceipt",
      accounts: [
        {
          name: "rewardReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardReceiptManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntry",
          isMut: false,
          isSigner: false,
        },
        {
          name: "paymentManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeCollectorTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "paymentTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "claimer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "initializer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "cardinalPaymentManager",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "updateRewardReceiptManager",
      accounts: [
        {
          name: "rewardReceiptManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "ix",
          type: {
            defined: "UpdateRewardReceiptManagerIx",
          },
        },
      ],
    },
    {
      name: "closeRewardReceiptManager",
      accounts: [
        {
          name: "rewardReceiptManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "closeRewardReceipt",
      accounts: [
        {
          name: "rewardReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardReceiptManager",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "disallowMint",
      accounts: [
        {
          name: "rewardReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardReceiptManager",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeEntry",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "rewardReceiptManager",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "stakePool",
            type: "publicKey",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "requiredRewardSeconds",
            type: "u128",
          },
          {
            name: "claimedReceiptsCounter",
            type: "u128",
          },
          {
            name: "paymentMint",
            type: "publicKey",
          },
          {
            name: "paymentManager",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "maxClaimedReceipts",
            type: {
              option: "u128",
            },
          },
        ],
      },
    },
    {
      name: "rewardReceipt",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "stakeEntry",
            type: "publicKey",
          },
          {
            name: "rewardReceiptManager",
            type: "publicKey",
          },
          {
            name: "target",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitRewardReceiptManagerIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "requiredRewardSeconds",
            type: "u128",
          },
          {
            name: "paymentMint",
            type: "publicKey",
          },
          {
            name: "paymentManager",
            type: "publicKey",
          },
          {
            name: "maxClaimedReceipts",
            type: {
              option: "u128",
            },
          },
        ],
      },
    },
    {
      name: "UpdateRewardReceiptManagerIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "requiredRewardSeconds",
            type: "u128",
          },
          {
            name: "paymentMint",
            type: "publicKey",
          },
          {
            name: "paymentManager",
            type: "publicKey",
          },
          {
            name: "maxClaimedReceipts",
            type: {
              option: "u128",
            },
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidAuthority",
      msg: "Invalid authority",
    },
    {
      code: 6001,
      name: "MaxNumberOfReceiptsExceeded",
      msg: "Max number of receipts exceeded",
    },
    {
      code: 6002,
      name: "InvalidClaimer",
      msg: "Invalid claimer",
    },
    {
      code: 6003,
      name: "InvalidRewardReceiptManager",
      msg: "Invalid rewards receipt manager",
    },
    {
      code: 6004,
      name: "CannotBlacklistDisallowReceipt",
      msg: "Cannot disallow claim reward receipt",
    },
    {
      code: 6005,
      name: "RewardSecondsNotSatisfied",
      msg: "Reward seconds not satisifed",
    },
    {
      code: 6006,
      name: "InvalidPayerTokenAcount",
      msg: "Invalid payer token account",
    },
    {
      code: 6007,
      name: "InvalidPaymentTargetTokenAccount",
      msg: "Invalid payment target account",
    },
    {
      code: 6008,
      name: "InvalidPaymentMint",
      msg: "Invalid payment mint",
    },
    {
      code: 6009,
      name: "InvalidPaymentTarget",
      msg: "Invalid payment target",
    },
    {
      code: 6010,
      name: "InvalidPaymentManager",
      msg: "Invalid payment manager",
    },
    {
      code: 6011,
      name: "InvalidPaymentAmountForMint",
      msg: "Invalid payment amount for mint",
    },
    {
      code: 6012,
      name: "InvalidMaxClaimedReceipts",
      msg: "Invalid max claimed receipts",
    },
    {
      code: 6013,
      name: "InvalidPaymentTokenAccount",
      msg: "Invalid payment token account",
    },
    {
      code: 6014,
      name: "InvalidFeeCollectorTokenAccount",
      msg: "Invalid fee collector token account",
    },
    {
      code: 6015,
      name: "InvalidPaymentCollector",
      msg: "Invalid payment collector",
    },
    {
      code: 6016,
      name: "InvalidRewardReceipt",
      msg: "Invalid reward receipt",
    },
  ],
};
