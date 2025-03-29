import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/voting'

import { startAnchor } from 'solana-bankrun'
import { BankrunProvider } from 'anchor-bankrun'
import * as crypto from 'crypto'

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

  });
});
