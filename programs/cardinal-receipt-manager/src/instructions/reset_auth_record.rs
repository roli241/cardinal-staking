use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct ResetAuthRecord<'info> {
    #[account(mut)]
    receipt_auth_record: Box<Account<'info, ReceiptAuthRecord>>,
    #[account(mut, constraint = receipt_manager.key() == receipt_auth_record.receipt_manager @ ErrorCode::InvalidReceiptManager)]
    receipt_manager: Box<Account<'info, ReceiptManager>>,

    #[account(mut, constraint = receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
}

pub fn handler(ctx: Context<ResetAuthRecord>) -> Result<()> {
    let receipt_auth_record = &mut ctx.accounts.receipt_auth_record;
    receipt_auth_record.whitelisted = false;
    receipt_auth_record.blacklisted = false;

    Ok(())
}
