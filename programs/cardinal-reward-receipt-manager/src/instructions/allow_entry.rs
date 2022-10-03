use cardinal_stake_pool::state::StakeEntry;

use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct DisallowMintCtx<'info> {
    #[account(
        init,
        payer = authority,
        space = REWARD_RECEIPT_SIZE,
        seeds = [REWARD_RECEIPT_SEED.as_bytes(), reward_receipt_manager.key().as_ref(), stake_entry.key().as_ref()],
        bump,
    )]
    reward_receipt: Box<Account<'info, RewardReceipt>>,
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,
    stake_entry: Box<Account<'info, StakeEntry>>,

    #[account(mut, constraint = reward_receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DisallowMintCtx>) -> Result<()> {
    let reward_receipt = &mut ctx.accounts.reward_receipt;
    reward_receipt.stake_entry = ctx.accounts.stake_entry.key();
    reward_receipt.reward_receipt_manager = ctx.accounts.reward_receipt_manager.key();
    reward_receipt.target = Pubkey::default();

    Ok(())
}
