export type CardinalRewardReceiptManager = {
  version: "1.8.1";
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
          name: "payer";
          isMut: true;
          isSigner: true;
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
      args: [
        {
          name: "ix";
          type: {
            defined: "CreateRewardReceiptIx";
          };
        }
      ];
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
          name: "rewardReceiptReceipt";
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
            name: "name";
            type: "string";
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
            name: "receiptsCounter";
            type: "u128";
          },
          {
            name: "maxRewardReceipts";
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
      name: "CreateRewardReceiptIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "target";
            type: "publicKey";
          }
        ];
      };
    },
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
            name: "maxRewardReceipts";
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
            name: "maxRewardReceipts";
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
    }
  ];
};

export const IDL: CardinalRewardReceiptManager = {
  version: "1.8.1",
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
          name: "payer",
          isMut: true,
          isSigner: true,
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
      args: [
        {
          name: "ix",
          type: {
            defined: "CreateRewardReceiptIx",
          },
        },
      ],
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
          name: "rewardReceiptReceipt",
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
            name: "name",
            type: "string",
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
            name: "receiptsCounter",
            type: "u128",
          },
          {
            name: "maxRewardReceipts",
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
      name: "CreateRewardReceiptIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "target",
            type: "publicKey",
          },
        ],
      },
    },
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
            name: "maxRewardReceipts",
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
            name: "maxRewardReceipts",
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
  ],
};
