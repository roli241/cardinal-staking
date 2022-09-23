use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Token, TokenAccount},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BoostStakeEntryIx {
    seconds_to_boost: u64,
}

#[derive(Accounts)]
pub struct BoostStakeEntryCtx<'info> {
    #[account(mut)]
    stake_booster: Box<Account<'info, StakeBooster>>,
    #[account(mut, constraint = stake_booster.stake_pool == stake_pool.key() @ ErrorCode::InvalidStakePool)]
    stake_pool: Box<Account<'info, StakePool>>,
    #[account(mut, constraint = stake_entry.pool == stake_pool.key() @ ErrorCode::InvalidStakeEntry)]
    stake_entry: Box<Account<'info, StakeEntry>>,

    #[account(mut, constraint =
        payer_token_account.owner == payer.key()
        && payer_token_account.mint == stake_booster.payment_mint
        @ ErrorCode::InvalidBoostPayerTokenAccount
    )]
    payer_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint =
        payment_recipient_token_account.owner == stake_booster.payment_recipient
        && payer_token_account.mint == stake_booster.payment_mint
        @ ErrorCode::InvalidBoostPaymentRecipientTokenAccount
    )]
    payment_recipient_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    payer: Signer<'info>,

    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<BoostStakeEntryCtx>, ix: BoostStakeEntryIx) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    if stake_entry.cooldown_start_seconds.is_none() {
        return Err(error!(ErrorCode::CannotBoostDuringCooldown));
    }

    stake_entry.total_stake_seconds = stake_entry
        .total_stake_seconds
        .saturating_add(u128::try_from(ix.seconds_to_boost).expect("Number conversion error"))
        .checked_mul(u128::try_from(stake_entry.amount).expect("Number conversion error"))
        .expect("Add error");
    stake_entry.last_staked_at = Clock::get().unwrap().unix_timestamp;

    if stake_entry
        .total_stake_seconds
        .gt(&u128::try_from(Clock::get().unwrap().unix_timestamp.checked_sub(ctx.accounts.stake_booster.start_time_seconds).expect("Sub error")).expect("Number conversion error"))
    {
        return Err(error!(ErrorCode::CannotBoostDuringCooldown));
    }

    let payment_amount = ix
        .seconds_to_boost
        .checked_mul(ctx.accounts.stake_booster.payment_amount)
        .expect("Multiplication error")
        .checked_div(u64::try_from(ctx.accounts.stake_booster.boost_seconds).expect("Number conversion error"))
        .expect("Division error");
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.payer_token_account.to_account_info(),
        to: ctx.accounts.payment_recipient_token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_context, payment_amount)?;

    Ok(())
}
