export type CardinalReceiptManager = {
  version: "1.8.4";
  name: "cardinal_receipt_manager";
  instructions: [
    {
      name: "initReceiptManager";
      accounts: [
        {
          name: "receiptManager";
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
            defined: "InitReceiptManagerIx";
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
          name: "receiptManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntry";
          isMut: false;
          isSigner: false;
        },
        {
          name: "receiptEntry";
          isMut: true;
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
      name: "updateReceiptManager";
      accounts: [
        {
          name: "receiptManager";
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
            defined: "UpdateReceiptManagerIx";
          };
        }
      ];
    },
    {
      name: "closeReceiptManager";
      accounts: [
        {
          name: "receiptManager";
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
      name: "initReceiptEntry";
      accounts: [
        {
          name: "receiptEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntry";
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
          name: "receiptManager";
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
      name: "disallowEntry";
      accounts: [
        {
          name: "rewardReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receiptManager";
          isMut: false;
          isSigner: false;
        },
        {
          name: "receiptEntry";
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
      name: "receiptManager";
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
            name: "requiredStakeSeconds";
            type: "u128";
          },
          {
            name: "usesStakeSeconds";
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
            name: "receiptEntry";
            type: "publicKey";
          },
          {
            name: "receiptManager";
            type: "publicKey";
          },
          {
            name: "target";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "receiptEntry";
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
            name: "usedStakeSeconds";
            type: "u128";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "InitReceiptManagerIx";
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
            name: "requiredStakeSeconds";
            type: "u128";
          },
          {
            name: "usesStakeSeconds";
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
      name: "UpdateReceiptManagerIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "requiredStakeSeconds";
            type: "u128";
          },
          {
            name: "usesStakeSeconds";
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
      name: "InvaliReceiptManager";
      msg: "Invalid receipt manager";
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
    },
    {
      code: 6017;
      name: "InvalidReceiptEntry";
      msg: "Invalid receipt entry";
    },
    {
      code: 6018;
      name: "InsufficientAvailableStakeSeconds";
      msg: "Insufficient available stake seconds to use";
    }
  ];
};

export const IDL: CardinalReceiptManager = {
  version: "1.8.4",
  name: "cardinal_receipt_manager",
  instructions: [
    {
      name: "initReceiptManager",
      accounts: [
        {
          name: "receiptManager",
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
            defined: "InitReceiptManagerIx",
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
          name: "receiptManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntry",
          isMut: false,
          isSigner: false,
        },
        {
          name: "receiptEntry",
          isMut: true,
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
      name: "updateReceiptManager",
      accounts: [
        {
          name: "receiptManager",
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
            defined: "UpdateReceiptManagerIx",
          },
        },
      ],
    },
    {
      name: "closeReceiptManager",
      accounts: [
        {
          name: "receiptManager",
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
      name: "initReceiptEntry",
      accounts: [
        {
          name: "receiptEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntry",
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
          name: "receiptManager",
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
      name: "disallowEntry",
      accounts: [
        {
          name: "rewardReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receiptManager",
          isMut: false,
          isSigner: false,
        },
        {
          name: "receiptEntry",
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
      name: "receiptManager",
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
            name: "requiredStakeSeconds",
            type: "u128",
          },
          {
            name: "usesStakeSeconds",
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
            name: "receiptEntry",
            type: "publicKey",
          },
          {
            name: "receiptManager",
            type: "publicKey",
          },
          {
            name: "target",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "receiptEntry",
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
            name: "usedStakeSeconds",
            type: "u128",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitReceiptManagerIx",
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
            name: "requiredStakeSeconds",
            type: "u128",
          },
          {
            name: "usesStakeSeconds",
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
      name: "UpdateReceiptManagerIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "requiredStakeSeconds",
            type: "u128",
          },
          {
            name: "usesStakeSeconds",
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
      name: "InvaliReceiptManager",
      msg: "Invalid receipt manager",
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
    {
      code: 6017,
      name: "InvalidReceiptEntry",
      msg: "Invalid receipt entry",
    },
    {
      code: 6018,
      name: "InsufficientAvailableStakeSeconds",
      msg: "Insufficient available stake seconds to use",
    },
  ],
};
