use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateRewardReceiptManagerIx {
    pub authority: Pubkey,
    pub required_reward_seconds: u128,
    pub payment_mint: Pubkey,
    pub payment_manager: Pubkey,
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
    assert_allowed_payment_info(&ix.payment_mint.to_string())?;
    assert_allowed_payment_manager(&ix.payment_manager.to_string())?;

    if let Some(max_claimed_receipts) = ix.max_claimed_receipts {
        if ctx.accounts.reward_receipt_manager.claimed_receipts_counter > max_claimed_receipts {
            return Err(error!(ErrorCode::InvalidMaxClaimedReceipts));
        }
    }

    let reward_receipt_manager = &mut ctx.accounts.reward_receipt_manager;
    reward_receipt_manager.authority = ix.authority;
    reward_receipt_manager.required_reward_seconds = ix.required_reward_seconds;
    reward_receipt_manager.payment_mint = ix.payment_mint;
    reward_receipt_manager.payment_manager = ix.payment_manager;
    reward_receipt_manager.max_claimed_receipts = ix.max_claimed_receipts;

    Ok(())
}
