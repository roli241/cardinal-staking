use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Max number of receipts exceeded")]
    MaxNumberOfReceiptsExceeded,
    #[msg("Invalid claimer")]
    InvalidClaimer,
    #[msg("Invalid rewards receipt manager")]
    InvalidRewardReceiptManager,
    #[msg("Cannot disallow claim reward receipt")]
    CannotBlacklistDisallowReceipt,
    #[msg("Reward seconds not satisifed")]
    RewardSecondsNotSatisfied,
    #[msg("Invalid payer token account")]
    InvalidPayerTokenAcount,
    #[msg("Invalid payment target account")]
    InvalidPaymentTargetTokenAccount,
    #[msg("Invalid payment mint")]
    InvalidPaymentMint,
    #[msg("Invalid payment target")]
    InvalidPaymentTarget,
    #[msg("Invalid payment manager")]
    InvalidPaymentManager,
    #[msg("Invalid payment amount for mint")]
    InvalidPaymentAmountForMint,
    #[msg("Invalid max claimed receipts")]
    InvalidMaxClaimedReceipts,
    #[msg("Invalid payment token account")]
    InvalidPaymentTokenAccount,
    #[msg("Invalid fee collector token account")]
    InvalidFeeCollectorTokenAccount,
    #[msg("Invalid payment collector")]
    InvalidPaymentCollector,
    #[msg("Invalid reward receipt")]
    InvalidRewardReceipt,
    #[msg("Invalid receipt entry")]
    InvalidReceiptEntry,
    #[msg("Insufficient available stake seconds to use")]
    InsufficientAvailableStakeSeconds,
}
