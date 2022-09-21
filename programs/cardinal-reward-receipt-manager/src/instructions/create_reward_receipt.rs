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
        seeds = [REWARD_RECEIPT_SEED.as_bytes(), reward_receipt_manager.key().as_ref(), reward_receipt_manager.receipts_counter.to_le_bytes().as_ref()],
        bump,
    )]
    reward_receipt: Box<Account<'info, RewardReceipt>>,
    #[account(mut)]
    reward_receipt_manager: Box<Account<'info, RewardReceiptManager>>,

    #[account(mut)]
    payer: Signer<'info>,
    #[account(mut, constraint = reward_receipt_manager.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateRewardReceiptCtx>, ix: CreateRewardReceiptIx) -> Result<()> {
    let reward_receipt = &mut ctx.accounts.reward_receipt;
    reward_receipt.bump = *ctx.bumps.get("reward_receipt").unwrap();
    reward_receipt.reward_receipt_manager = ctx.accounts.reward_receipt_manager.key();
    reward_receipt.target = ix.target;

    let reward_receipt_manager = &mut ctx.accounts.reward_receipt_manager;
    if let Some(max_reward_receipts) = reward_receipt_manager.max_reward_receipts {
        if max_reward_receipts == reward_receipt_manager.receipts_counter {
            return Err(error!(ErrorCode::MaxNumberOfReceiptsExceeded));
        }
    }
    // increment counter
    ctx.accounts.reward_receipt_manager.receipts_counter = ctx.accounts.reward_receipt_manager.receipts_counter.checked_add(1).expect("Add error");

    Ok(())
}
