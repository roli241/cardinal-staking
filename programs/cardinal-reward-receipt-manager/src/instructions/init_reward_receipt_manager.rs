use cardinal_stake_pool::state::StakePool;

use {crate::state::*, anchor_lang::prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitRewardReceiptManagerIx {
    pub name: String,
    pub authority: Pubkey,
    pub max_reward_receipts: Option<u128>,
}

#[derive(Accounts)]
#[instruction(ix: InitRewardReceiptManagerIx)]
pub struct InitRewardReceiptManagerCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = REWARD_RECEIPT_MANAGER_SIZE,
        seeds = [REWARD_RECEIPT_MANAGER_SEED.as_bytes(), stake_pool.key().as_ref(), ix.name.as_ref()],
        bump,
    )]
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,
    stake_pool: Box<Account<'info, StakePool>>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitRewardReceiptManagerCtx>, ix: InitRewardReceiptManagerIx) -> Result<()> {
    let reward_receipt_manager = &mut ctx.accounts.reward_receipt_manager;
    reward_receipt_manager.bump = *ctx.bumps.get("reward_receipt_manager").unwrap();
    reward_receipt_manager.name = ix.name;
    reward_receipt_manager.stake_pool = ctx.accounts.stake_pool.key();
    reward_receipt_manager.authority = ix.authority;
    reward_receipt_manager.receipts_counter = 0;
    reward_receipt_manager.max_reward_receipts = ix.max_reward_receipts;

    Ok(())
}
