use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ReassignStakeEntryIx {
    new_staker: Pubkey,
}

#[derive(Accounts)]
#[instruction(ix: ReassignStakeEntryIx)]
pub struct ReassignStakeEntryCtx<'info> {
    #[account(mut)]
    stake_entry: Box<Account<'info, StakeEntry>>,
    #[account(mut, constraint = stake_entry.last_staker == current_staker.key() @ ErrorCode::InvalidLastStaker)]
    current_staker: Signer<'info>,
}

pub fn handler(ctx: Context<ReassignStakeEntryCtx>, ix: ReassignStakeEntryIx) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;

    // update last staker
    stake_entry.last_staker = ix.new_staker;

    Ok(())
}
