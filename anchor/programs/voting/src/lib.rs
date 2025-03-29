#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

const ANCHOR_DIS_SIZE: usize = 8; 


pub fn hash_candidate_name(name: &str) -> [u8; 32] {
  hash(name.as_bytes()).to_bytes()
}

#[program]
pub mod voting {
  use super::*;

  pub fn initialize_poll(ctx: Context<InitializePoll>,
                        poll_id: u64,
                        description: String,
                        poll_start: u64,
                        poll_end: u64) -> Result<()> {
    let poll_account = &mut ctx.accounts.poll_account;
    poll_account.poll_id = poll_id;
    poll_account.poll_start = poll_start;
    poll_account.poll_end = poll_end;
    poll_account.description = description;
    poll_account.candidate_amount = 0;

    Ok(())
  }

  pub fn initialize_candidate(ctx: Context<InitializeCandidate>,
                              poll_id: u64,
                              candidate_name: String,
                            ) -> Result<()> {

    let candidate = &mut ctx.accounts.candidate;
    let poll = &mut ctx.accounts.poll_account;
    candidate.candidate_name = candidate_name;
    candidate.candidate_votes = 0;
    poll.candidate_amount += 1;

    Ok(())
  }

  pub fn vote(ctx: Context<Vote>,
              poll_id: u64,
              candidate_name: String, ) -> Result<()> {
    let candidate = &mut ctx.accounts.candidate;
    candidate.candidate_votes += 1;
    Ok(())
  }
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
  #[max_len(32)]
  pub candidate_name: String,
  pub candidate_votes: u64,
}


#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct InitializeCandidate<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll_account: Account<'info, PollAccount>,

  #[account(init_if_needed,
            payer = signer,
            space = 8 + Candidate::INIT_SPACE,
            seeds = [
                      poll_id.to_le_bytes().as_ref(), 
                      candidate_name.as_bytes(),
                    ],
            bump
  )]
  pub candidate: Account<'info, Candidate>,
  pub system_program: Program<'info, System>, 
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct Vote<'info> {
  pub signer: Signer<'info>,

  #[account(
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll: Account<'info, PollAccount>,

  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref(),
            candidate_name.as_bytes()],
    bump
  )]
  pub candidate: Account<'info, Candidate>
}

// This struct defines the data stored in a PollAccount on-chain
#[account]
#[derive(InitSpace)] // Automatically calculates the required account space at compile time
pub struct PollAccount {
  pub poll_id: u64,
  #[max_len(280)]
  pub description: String,
  pub poll_start: u64,
  pub poll_end: u64,
  pub candidate_amount: u64,
}

// This struct defines all the accounts needed for the `initialize_poll` instruction.
#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
  #[account(mut)] // The signer must be mutable because they're paying for account creation
  pub signer: Signer<'info>, // The user who pays for and signs the transaction

  #[account(
            init_if_needed, // This tells Anchor to create the account
            payer = signer, // signer pays for the account creation
            space = 8 + PollAccount::INIT_SPACE, // Total account size (8-byte discriminator + struct size)
            seeds = [poll_id.to_le_bytes().as_ref()], // PDA seed based on poll ID
            bump // Required for using PDAs (Program Derived Addresses)
  )]
  pub poll_account: Account<'info, PollAccount>, // The account that stores poll data
  pub system_program: Program<'info, System> // System program is required to create accounts
}
