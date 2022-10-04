use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
#[instruction(auth: bool)]
pub struct SetRewardReceiptAuthCtx<'info> {
    #[account(constraint = receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    receipt_manager: Box<Account<'info, ReceiptManager>>,
    #[account(constraint = reward_receipt.receipt_manager == receipt_manager.key() @ ErrorCode::InvalidReceiptManager)]
    reward_receipt: Box<Account<'info, RewardReceipt>>,

    #[account(mut)]
    authority: Signer<'info>,
}

pub fn handler(ctx: Context<SetRewardReceiptAuthCtx>, auth: bool) -> Result<()> {
    ctx.accounts.reward_receipt.allowed = auth;
    Ok(())
}
