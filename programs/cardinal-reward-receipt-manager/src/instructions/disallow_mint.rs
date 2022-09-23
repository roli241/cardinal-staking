use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct DisallowMintCtx<'info> {
    #[account(mut)]
    reward_receipt: Box<Account<'info, RewardReceipt>>,
    #[account(mut, constraint = reward_receipt_manager.key() == reward_receipt.reward_receipt_manager @ ErrorCode::InvalidRewardReceiptManager)]
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,
    #[account(mut, constraint = reward_receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
}

pub fn handler(ctx: Context<DisallowMintCtx>) -> Result<()> {
    let reward_receipt = &mut ctx.accounts.reward_receipt;
    if reward_receipt.target != Pubkey::default() {
        return Err(error!(ErrorCode::CannotBlacklistClaimeReceipt));
    }
    reward_receipt.target = Pubkey::default();

    Ok(())
}
