use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use std::collections::HashMap;

pub fn assert_allowed_payment_info(mint: &str, payment_amount: u64) -> Result<()> {
    let payment_mints: HashMap<&str, u64> = HashMap::from([
        ("DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", 10_u64.pow(9)),
        ("DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", 2_000_000),
    ]);
    if !payment_mints.contains_key(mint) {
        return Err(error!(ErrorCode::InvalidPaymentMint));
    }
    let amount = payment_mints[mint];
    if amount != payment_amount {
        return Err(error!(ErrorCode::InvalidPaymentAmountForMint));
    }
    Ok(())
}

pub fn assert_allowed_payment_manager(key: &str) -> Result<()> {
    let allowed_payment_managers: Vec<&str> = [
        "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", // cardinal pm (no split)
        "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", // degods pm (x-y split)
    ]
    .to_vec();
    if !allowed_payment_managers.contains(&key) {
        return Err(error!(ErrorCode::InvalidPaymentManager));
    }
    Ok(())
}

pub fn assert_allowed_payment_collector(key: &str) -> Result<()> {
    let allowed_payment_collectors: Vec<&str> = ["cpmaMZyBQiPxpeuxNsQhW7N8z1o9yaNdLgiPhWGUEiX"].to_vec();
    if !allowed_payment_collectors.contains(&key) {
        return Err(error!(ErrorCode::InvalidPaymentCollector));
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
    pub payment_manager: Pubkey,
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
