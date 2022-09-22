use cardinal_stake_pool::state::StakeEntry;

use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateRewardReceiptIx {
    pub name: String,
    pub target: Pubkey,
}

#[derive(Accounts)]
pub struct CreateRewardReceiptCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = REWARD_RECEIPT_SIZE,
        seeds = [REWARD_RECEIPT_SEED.as_bytes(), reward_receipt_manager.key().as_ref(), stake_entry.key().as_ref()],
        bump,
    )]
    reward_receipt: Box<Account<'info, RewardReceipt>>,
    #[account(mut)]
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,
    stake_entry: Box<Account<'info, StakeEntry>>,

    #[account(mut)]
    payer: Signer<'info>,
    #[account(mut, constraint = stake_entry.last_staker == claimer.key() @ ErrorCode::InvalidClaimer)]
    claimer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateRewardReceiptCtx>, ix: CreateRewardReceiptIx) -> Result<()> {
    let reward_receipt = &mut ctx.accounts.reward_receipt;
    reward_receipt.bump = *ctx.bumps.get("reward_receipt").unwrap();
    reward_receipt.stake_entry = ctx.accounts.stake_entry.key();
    reward_receipt.reward_receipt_manager = ctx.accounts.reward_receipt_manager.key();
    reward_receipt.target = ix.target;
    // increment counter
    ctx.accounts.reward_receipt_manager.claimed_receipts_counter = ctx.accounts.reward_receipt_manager.claimed_receipts_counter.checked_add(1).expect("Add error");

    if ctx.accounts.stake_entry.total_stake_seconds < ctx.accounts.reward_receipt_manager.required_reward_seconds {
        return Err(error!(ErrorCode::RewardSecondsNotSatisfied));
    }

    let reward_receipt_manager = &mut ctx.accounts.reward_receipt_manager;
    if let Some(max_reward_receipts) = reward_receipt_manager.max_claimed_receipts {
        if max_reward_receipts == reward_receipt_manager.claimed_receipts_counter {
            return Err(error!(ErrorCode::MaxNumberOfReceiptsExceeded));
        }
    }

    // let cpi_accounts = token::Transfer {
    //     from: reward_distributor_token_account.to_account_info(),
    //     to: ctx.accounts.user_reward_mint_token_account.to_account_info(),
    //     authority: reward_distributor.to_account_info(),
    // };
    // let cpi_program = ctx.accounts.token_program.to_account_info();
    // let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(reward_distributor_signer);
    // // todo this could be an issue and get stuck, might need 2 transfers
    // token::transfer(cpi_context, reward_amount_to_receive.try_into().expect("Too many rewards to receive"))?;

    Ok(())
}
