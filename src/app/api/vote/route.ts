import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "@/../anchor/target/types/voting";
import { BN, Program } from "@coral-xyz/anchor";

const IDL = require('@/../anchor/target/idl/voting.json');

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetaData: ActionGetResponse = {
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/The_War_of_the_Worlds_by_Henrique_Alvim_Corr%C3%AAa%2C_original_graphic_15.jpg/500px-The_War_of_the_Worlds_by_Henrique_Alvim_Corr%C3%AAa%2C_original_graphic_15.jpg",
    title: "Favorite movie",
    description: "Dune vs Arrival",
    label: "Vote",
    links: {
      actions: [
        {
          href: "/api/vote?candidate=dune",
          label: "Dune"
        },
        {
          href: "/api/vote?candidate=arrival",
          label: "Arrival"
        }
      ]
    }
  };
  return Response.json(actionMetaData, {headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "dune" && candidate != "arrival") {
    return new Response("Invalid candidate", {status: 400, headers: ACTIONS_CORS_HEADERS})
  }

  const connection = new Connection("http:://127.0.0.1:8899", "confirmed");
  const program: Program<Voting> = new Program(IDL, {connection});

  const body: ActionPostRequest = request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch(error) {
    return new Response("Invalid account", {status: 400, headers: ACTIONS_CORS_HEADERS})
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
      feePayer: voter,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction
    }
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
