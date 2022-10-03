use cardinal_stake_pool::state::StakeEntry;

use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct DisallowEntryCtx<'info> {
    #[account(
        init,
        payer = authority,
        space = REWARD_RECEIPT_SIZE,
        seeds = [REWARD_RECEIPT_SEED.as_bytes(), receipt_manager.key().as_ref(), receipt_entry.key().as_ref()],
        bump,
    )]
    reward_receipt: Box<Account<'info, RewardReceipt>>,
    receipt_manager: Box<Account<'info, ReceiptManager>>,
    receipt_entry: Box<Account<'info, StakeEntry>>,

    #[account(mut, constraint = receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DisallowEntryCtx>) -> Result<()> {
    let reward_receipt = &mut ctx.accounts.reward_receipt;
    reward_receipt.receipt_entry = ctx.accounts.receipt_entry.key();
    reward_receipt.receipt_manager = ctx.accounts.receipt_manager.key();
    reward_receipt.target = Pubkey::default();

    Ok(())
}
