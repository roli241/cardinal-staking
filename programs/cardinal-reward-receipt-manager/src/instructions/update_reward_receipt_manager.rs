use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateRewardReceiptManagerIx {
    pub authority: Pubkey,
    pub max_reward_receipts: Option<u128>,
}

#[derive(Accounts)]
#[instruction(ix: UpdateRewardReceiptManagerIx)]
pub struct UpdateRewarReceiptManagerCtx<'info> {
    #[account(mut)]
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,
    #[account(constraint = authority.key() == reward_receipt_manager.authority @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateRewarReceiptManagerCtx>, ix: UpdateRewardReceiptManagerIx) -> Result<()> {
    let reward_receipt_manager = &mut ctx.accounts.reward_receipt_manager;
    reward_receipt_manager.authority = ix.authority;
    reward_receipt_manager.max_reward_receipts = ix.max_reward_receipts;

    Ok(())
}
