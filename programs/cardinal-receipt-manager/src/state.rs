use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use std::collections::HashMap;

pub fn assert_allowed_payment_info(mint: &str) -> Result<()> {
    let payment_mints = get_payment_mints();
    if !payment_mints.contains_key(mint) {
        return Err(error!(ErrorCode::InvalidPaymentMint));
    }
    Ok(())
}

pub fn assert_allowed_payment_manager(key: &str) -> Result<()> {
    let allowed_payment_managers: Vec<&str> = [
        "FwuXGrYYDvMTbQDikZwVi1Sj4uwdBfXepTa7oCYtXBM8", // cardinal pm (no split)
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

pub fn get_payment_mints() -> HashMap<&'static str, u64> {
    return HashMap::from([
        ("DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", 10_u64.pow(9)),
        ("So11111111111111111111111111111111111111112", 2_000_000),
    ]);
}

pub const RECEIPT_MANAGER_SEED: &str = "receipt-manager";
pub const RECEIPT_MANAGER_SIZE: usize = 8 + std::mem::size_of::<ReceiptManager>() + 64;
#[account]
pub struct ReceiptManager {
    pub bump: u8,
    pub stake_pool: Pubkey,
    pub authority: Pubkey,
    pub required_stake_seconds: u128,
    pub stake_seconds_to_use: u128,
    pub claimed_receipts_counter: u128,
    pub payment_mint: Pubkey,
    pub payment_manager: Pubkey,
    pub requires_whitelist: bool,
    pub name: String,
    pub max_claimed_receipts: Option<u128>,
}

pub const RECEIPT_ENTRY_SEED: &str = "receipt-entry";
pub const RECEIPT_ENTRY_SIZE: usize = 8 + std::mem::size_of::<ReceiptEntry>() + 64;
#[account]
pub struct ReceiptEntry {
    pub bump: u8,
    pub stake_entry: Pubkey,
    pub used_stake_seconds: u128,
}

pub const REWARD_RECEIPT_SEED: &str = "reward-receipt";
pub const REWARD_RECEIPT_SIZE: usize = 8 + std::mem::size_of::<RewardReceipt>() + 64;
#[account]
pub struct RewardReceipt {
    pub bump: u8,
    pub receipt_entry: Pubkey,
    pub receipt_manager: Pubkey,
    pub target: Pubkey,
}

pub const RECEIPT_AUTH_RECORD_SEED: &str = "receipt-auth-record";
pub const RECEIPT_AUTH_RECORD_SIZE: usize = 8 + std::mem::size_of::<ReceiptAuthRecord>() + 16;
#[account]
pub struct ReceiptAuthRecord {
    pub bump: u8,
    pub receipt_manager: Pubkey,
    pub receipt_entry: Pubkey,
    pub whitelisted: bool,
    pub blacklisted: bool,
}
