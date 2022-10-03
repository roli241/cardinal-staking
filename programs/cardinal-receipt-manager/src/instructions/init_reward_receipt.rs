use {crate::state::*, anchor_lang::prelude::*, cardinal_stake_pool::state::StakeEntry};

#[derive(Accounts)]
pub struct InitRewardReceiptCtx<'info> {
    #[account(
        init,
        payer = initializer,
        space = REWARD_RECEIPT_SIZE,
        seeds = [REWARD_RECEIPT_SEED.as_bytes(), receipt_manager.key().as_ref(), stake_entry.key().as_ref()],
        bump,
    )]
    reward_receipt: Box<Account<'info, ReceiptEntry>>,
    stake_entry: Box<Account<'info, StakeEntry>>,
    receipt_manager: Box<Account<'info, ReceiptManager>>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitRewardReceiptCtx>) -> Result<()> {
    let reward_receipt = &mut ctx.accounts.reward_receipt;
    reward_receipt.bump = *ctx.bumps.get("reward_receipt").unwrap();
    reward_receipt.stake_entry = ctx.accounts.stake_entry.key();
    reward_receipt.used_stake_seconds = 0;

    reward_receipt.allowed = true;
    if (ctx.accounts.receipt_manager.requires_authorization) {
        reward_receipt.allowed = false;
    }
    Ok(())
}
