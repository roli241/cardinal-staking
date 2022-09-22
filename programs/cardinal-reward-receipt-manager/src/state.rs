use anchor_lang::prelude::*;

pub const CLAIM_AMOUNT: u64 = 10_u64.pow(9);

pub fn assert_allowed_payment_amount(amount: u64, payment_mint: &Pubkey) -> Result<()> {
    if amount != CLAIM_AMOUNT {
        return Err(error!(ErrorCode::InvalidPaymentAmount));
    }
    Ok(())
}

pub fn assert_allowed_payment_mint(key: &Pubkey) -> Result<()> {
    let allowed_mint = [
        Pubkey::from_str("DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ").unwrap(), // DUST
    ];
    if (!allowed_mints.contains(key)) {
        return Err(error!(ErrorCode::InvalidPaymentMint));
    }
    Ok(())
}

pub fn assert_allowed_payment_target(key: &Pubkey) -> Result<()> {
    let allowed_payment_target = [Pubkey::from_str("DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ").unwrap()];
    if (!allowed_payment_target.contains(key)) {
        return Err(error!(ErrorCode::InvalidPaymentTarget));
    }
    Ok(())
}

pub const REWARD_RECEIPT_MANAGER_SEED: &str = "reward-receipt-manager";
pub const REWARD_RECEIPT_MANAGER_SIZE: usize = 8 + std::mem::size_of::<RewardReceiptManager>() + 64;
#[account]
pub struct RewardReceiptManager {
    pub bump: u8,
    pub name: String,
    pub stake_pool: Pubkey,
    pub authority: Pubkey,
    pub required_reward_seconds: u128,
    pub claimed_receipts_counter: u128,
    pub payment_amount: u64,
    pub payment_mint: Pubkey,
    pub payment_target: Pubkey,
    pub max_claimed_receipts: Option<u128>,
}

pub const REWARD_RECEIPT_SEED: &str = "reward-receipt";
pub const REWARD_RECEIPT_SIZE: usize = 8 + std::mem::size_of::<RewardReceipt>() + 64;
#[account]
pub struct RewardReceipt {
    pub bump: u8,
    pub stake_entry: Pubkey,
    pub reward_receipt_manager: Pubkey,
    pub target: Pubkey,
}
