use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct WhitelistMintCtx<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = RECEIPT_AUTH_RECORD_SIZE,
        seeds = [RECEIPT_AUTH_RECORD_SEED.as_bytes(), receipt_manager.key().as_ref(), receipt_entry.key().as_ref()],
        bump,
    )]
    receipt_auth_record: Box<Account<'info, ReceiptAuthRecord>>,
    receipt_manager: Box<Account<'info, ReceiptManager>>,
    receipt_entry: Box<Account<'info, ReceiptEntry>>,

    #[account(mut, constraint = receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WhitelistMintCtx>) -> Result<()> {
    let receipt_auth_record = &mut ctx.accounts.receipt_auth_record;
    receipt_auth_record.bump = *ctx.bumps.get("receipt_auth_record").unwrap();
    if receipt_auth_record.blacklisted == true {
        return Err(error!(ErrorCode::NeedToResetAuthRecord));
    }
    receipt_auth_record.whitelisted = true;

    Ok(())
}
