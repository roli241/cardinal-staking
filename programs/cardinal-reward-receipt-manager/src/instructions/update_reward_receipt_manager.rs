use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateRewardReceiptManagerIx {
    pub authority: Pubkey,
    pub payment_amount: u64,
    pub payment_mint: Pubkey,
    pub payment_target: Pubkey,
    pub max_claimed_receipts: Option<u128>,
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
    assert_allowed_mint(ix.payment_mint);
    assert_allowed_payment_target(&ix.payment_target);
    reward_receipt_manager.authority = ix.authority;
    reward_receipt_manager.payment_amount = ix.payment_amount;
    reward_receipt_manager.payment_mint = ix.payment_mint;
    reward_receipt_manager.payment_target = ix.payment_target;
    reward_receipt_manager.max_claimed_receipts = ix.max_claimed_receipts;

    Ok(())
}
