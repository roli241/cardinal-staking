use anchor_lang::prelude::*;

pub const DUST_MINT: &str = "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ";
pub const CLAIM_AMOUNT: u64 = 10_u64.pow(9);

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
