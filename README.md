# 🗳️ Solana Anchor Voting Program

A simple voting program built with [Anchor](https://www.anchor-lang.com/) for the Solana blockchain. This program allows users to create polls, register candidates, and cast votes securely on-chain.

## 📦 Features

- Initialize new polls with descriptions and time limits.
- Add candidates to existing polls.
- Vote for registered candidates.
- Uses PDAs (Program Derived Addresses) for account uniqueness and security.

---

## 📁 Project Structure

- `PollAccount`: Stores poll metadata like ID, description, start and end times, and number of candidates.
- `Candidate`: Stores candidate name and vote count.
- `initialize_poll`: Creates a new poll.
- `initialize_candidate`: Adds a new candidate to a poll.
- `vote`: Increments the vote count for a candidate.

---

## 🔧 Instructions

### 📌 Prerequisites

- [Rust](https://www.rust-lang.org/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)

### 🛠 Build

```bash
anchor build
```

#### 🛠️ Troubleshooting

If encounting the following error:

```text
lock file version 4 requires -Znext-lockfile-bump
```

It can be resolved it by running the build with the following command:

```bash
cargo +nightly build -Znext-lockfile-bump
```

Or, with using Anchor:

```bash
anchor build -- -- -Znext-lockfile-bump
```

To run tests with the same workaround:

```bash
anchor test --skip-local-validator --skip-deploy -- -- -Znext-lockfile-bump
```

> 💡 Tip: It's generally recommended to update Anchor to the latest version (e.g., 0.31) to avoid such issues entirely:
>
> ```bash
> cargo install --git https://github.com/coral-xyz/anchor anchor-cli --force
> ```
>
> Reference:
> ```text
> https://github.com/coral-xyz/anchor/issues/3392
> ```






