use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct UpdateTotalStakeSecondsV2Ctx<'info> {
    #[account(mut)]
    stake_entry: Account<'info, StakeEntry>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    last_staker: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<UpdateTotalStakeSecondsV2Ctx>) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    if stake_entry.kind == StakeEntryKind::V1 as u8 {
        return Err(error!(ErrorCode::InvalidStakeEntryKind));
    }

    if stake_entry.cooldown_start_seconds.is_none() {
        stake_entry.total_stake_seconds = stake_entry.total_stake_seconds.saturating_add(
            (u128::try_from(stake_entry.cooldown_start_seconds.unwrap_or(Clock::get().unwrap().unix_timestamp))
                .unwrap()
                .saturating_sub(u128::try_from(stake_entry.last_staked_at).unwrap()))
            .checked_mul(u128::try_from(stake_entry.amount).unwrap())
            .unwrap(),
        );
        stake_entry.last_staked_at = Clock::get().unwrap().unix_timestamp;
    }
    Ok(())
}
