pub mod errors;
pub mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("rrmevmpXMooxn8Qu6u7RWao93BZn4cKgfjtNMURSc2E");

#[program]
pub mod cardinal_reward_receipt_manager {
    use super::*;

    pub fn init_reward_receipt_manager(ctx: Context<InitRewardReceiptManagerCtx>, ix: InitRewardReceiptManagerIx) -> Result<()> {
        init_reward_receipt_manager::handler(ctx, ix)
    }

    pub fn create_reward_receipt(ctx: Context<CreateRewardReceiptCtx>) -> Result<()> {
        create_reward_receipt::handler(ctx)
    }

    pub fn update_reward_receipt_manager(ctx: Context<UpdateRewarReceiptManagerCtx>, ix: UpdateRewardReceiptManagerIx) -> Result<()> {
        update_reward_receipt_manager::handler(ctx, ix)
    }

    pub fn close_reward_receipt_manager(ctx: Context<CloseRewardReceiptManagerCtx>) -> Result<()> {
        close_reward_receipt_manager::handler(ctx)
    }

    pub fn close_reward_receipt(ctx: Context<CloseRewardReceiptCtx>) -> Result<()> {
        close_reward_receipt::handler(ctx)
    }

    pub fn disallow_mint(ctx: Context<DisallowMintCtx>) -> Result<()> {
        disallow_mint::handler(ctx)
    }
}
