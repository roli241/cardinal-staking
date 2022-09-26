use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct CloseRewardReceiptCtx<'info> {
    #[account(mut, close = authority, constraint = reward_receipt.reward_receipt_manager == reward_receipt_manager.key() @ ErrorCode::InvalidRewardReceipt)]
    reward_receipt: Box<Account<'info, RewardReceipt>>,
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,
    #[account(mut, constraint = reward_receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
}

pub fn handler(_ctx: Context<CloseRewardReceiptCtx>) -> Result<()> {
    Ok(())
}
