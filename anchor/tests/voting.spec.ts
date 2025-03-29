import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/voting'

import { startAnchor } from 'solana-bankrun'
import { BankrunProvider } from 'anchor-bankrun'

const IDL = require('../target/idl/voting.json');
const votingAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

describe('Voting', () => {

  let context;
  let provider;
  let votingProgram;

  beforeAll(async () => {
    context = await startAnchor('', [{name: 'voting', programId: votingAddress}], []); 
    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(
      IDL,
      provider,
    );
  });

  it('Initialize Poll', async () => {

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "Favorite movie",
      new anchor.BN(0),
      new anchor.BN(1843125340),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    )

    const pollAccount = await votingProgram.account.pollAccount.fetch(pollAddress);

    console.log(pollAccount);

    expect(pollAccount.pollId.toNumber()).toEqual(1);
    expect(pollAccount.description).toEqual("Favorite movie");
    expect(pollAccount.pollStart.toNumber()).toBeLessThan(pollAccount.pollEnd.toNumber());
  });

  it("Initialize candidate", async () => {
    const pollId = new anchor.BN(1);
    const candidateName = "Dune";

    // Derive the PDA for the poll (unchanged)
    const [pollAddress] = PublicKey.findProgramAddressSync(
        [pollId.toArrayLike(Buffer, "le", 8)],
        votingAddress
    );

    // Derive the PDA for the candidate (based on candidate_name.as_bytes())
    const [candidateAddress] = PublicKey.findProgramAddressSync(
        [pollId.toArrayLike(Buffer, "le", 8), Buffer.from(candidateName)],
        votingAddress
    );

    // Call the initializeCandidate instruction with proper accounts
    await votingProgram.methods
        .initializeCandidate(pollId, candidateName)
        .accounts({
          signer: provider.publicKey,
          pollAccount: pollAddress,
          candidate: candidateAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

    const candidate = await votingProgram.account.candidate.fetch(candidateAddress);
    console.log(candidate);

    expect(candidate.candidateName).toEqual(candidateName);
    expect(candidate.candidateVotes.toNumber()).toEqual(0);
  });

  it("Vote", async () => {
    const pollId = new anchor.BN(1);
    const candidateName = "Dune";

    // Derive the poll PDA
    const [pollAddress] = PublicKey.findProgramAddressSync(
        [pollId.toArrayLike(Buffer, 'le', 8)],
        votingAddress
    );

    // Derive the candidate PDA
    const [candidateAddress] = PublicKey.findProgramAddressSync(
        [pollId.toArrayLike(Buffer, 'le', 8), Buffer.from(candidateName)],
        votingAddress
    );

    // Cast the vote
    await votingProgram.methods
        .vote(pollId, candidateName)
        .accounts({
          signer: provider.publicKey,
          poll: pollAddress,
          candidate: candidateAddress,
        })
        .rpc();

    const candidate = await votingProgram.account.candidate.fetch(candidateAddress);
    console.log(candidate);

    expect(candidate.candidateVotes.toNumber()).toEqual(1);
  });
});
