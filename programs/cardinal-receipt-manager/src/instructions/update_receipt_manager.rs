use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateReceiptManagerIx {
    pub authority: Pubkey,
    pub required_stake_seconds: u128,
    pub uses_stake_seconds: u128,
    pub payment_mint: Pubkey,
    pub payment_manager: Pubkey,
    pub max_claimed_receipts: Option<u128>,
}

#[derive(Accounts)]
#[instruction(ix: UpdateReceiptManagerIx)]
pub struct UpdateRewarReceiptManagerCtx<'info> {
    #[account(mut)]
    receipt_manager: Box<Account<'info, ReceiptManager>>,
    #[account(constraint = authority.key() == receipt_manager.authority @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateRewarReceiptManagerCtx>, ix: UpdateReceiptManagerIx) -> Result<()> {
    assert_allowed_payment_info(&ix.payment_mint.to_string())?;
    assert_allowed_payment_manager(&ix.payment_manager.to_string())?;

    if let Some(max_claimed_receipts) = ix.max_claimed_receipts {
        if ctx.accounts.receipt_manager.claimed_receipts_counter > max_claimed_receipts {
            return Err(error!(ErrorCode::InvalidMaxClaimedReceipts));
        }
    }

    let receipt_manager = &mut ctx.accounts.receipt_manager;
    receipt_manager.authority = ix.authority;
    receipt_manager.required_stake_seconds = ix.required_stake_seconds;
    receipt_manager.uses_stake_seconds = ix.uses_stake_seconds;
    receipt_manager.payment_mint = ix.payment_mint;
    receipt_manager.payment_manager = ix.payment_manager;
    receipt_manager.max_claimed_receipts = ix.max_claimed_receipts;

    Ok(())
}
