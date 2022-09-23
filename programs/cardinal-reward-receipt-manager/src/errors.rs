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
    #[msg("Cannot blacklist claim reward receipt")]
    CannotBlacklistClaimeReceipt,
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
    #[msg("Invalid payment amount")]
    InvalidPaymentAmount,
}
