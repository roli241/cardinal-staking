use cardinal_stake_pool::state::StakePool;

use {crate::state::*, anchor_lang::prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitRewardReceiptManagerIx {
    pub name: String,
    pub authority: Pubkey,
    pub payment_amount: u64,
    pub payment_mint: Pubkey,
    pub payment_target: Pubkey,
    pub max_claimed_receipts: Option<u128>,
}

#[derive(Accounts)]
#[instruction(ix: InitRewardReceiptManagerIx)]
pub struct InitRewardReceiptManagerCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = REWARD_RECEIPT_MANAGER_SIZE,
        seeds = [REWARD_RECEIPT_MANAGER_SEED.as_bytes(), stake_pool.key().as_ref(), ix.name.as_ref()],
        bump,
    )]
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,
    stake_pool: Box<Account<'info, StakePool>>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitRewardReceiptManagerCtx>, ix: InitRewardReceiptManagerIx) -> Result<()> {
    let reward_receipt_manager = &mut ctx.accounts.reward_receipt_manager;
    assert_allowed_mint(ix.payment_mint)?;
    assert_allowed_payment_target(&ix.payment_target)?;
    assert_allowed_payment_target(&ix.payment_target)?;
    reward_receipt_manager.bump = *ctx.bumps.get("reward_receipt_manager").unwrap();
    reward_receipt_manager.name = ix.name;
    reward_receipt_manager.stake_pool = ctx.accounts.stake_pool.key();
    reward_receipt_manager.authority = ix.authority;
    reward_receipt_manager.payment_amount = ix.payment_amount;
    reward_receipt_manager.payment_mint = ix.payment_mint;
    reward_receipt_manager.payment_target = ix.payment_target;
    reward_receipt_manager.claimed_receipts_counter = 0;
    reward_receipt_manager.max_claimed_receipts = ix.max_claimed_receipts;

    Ok(())
}
