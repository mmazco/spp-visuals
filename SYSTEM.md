# Stellar Private Payments — System Definition

_**This file is the living source of truth for the visual.** The interactive atlas is built from the same data._

_Question status: **0 open · 0 resolved**._

## One paragraph

Stellar Private Payments (SPP) is a privacy pool: users deposit an asset into a shared pool contract, hold a private balance as cryptographic notes, and pay each other inside the pool. Deposits in and withdrawals out are public on the ledger; the link between them, and the counterparties and amounts of transfers inside, are kept private from the public. Every operation carries a zero-knowledge proof, and every pool is deployed with compliance controls: a key-based association set (block-list, allow-list, or both) and optional view keys for audit. Live on testnet, unaudited, developer preview.

## Decisions locked

| Axis | Decision | ADR |
|---|---|---|
| Privacy target | Counterparty privacy — who paid whom inside the pool — not just confidential amounts (that lane is Confidential Token) | — |
| Proof system | Groth16, verified onchain via the Protocol 25/26 cryptographic host functions | — |
| Compliance model | Key-based association sets, configurable per pool at deploy: block-list, allow-list, or both | — |
| Auditability | Optional global view keys for administrators, user view keys for note-scoped selective disclosure | — |
| Network | Testnet only for the preview; contracts unaudited, not approved for mainnet | — |

## Cost model

## Reading order (the atlas chapters)

1. **Public in** — Funds enter the pool in public: the ledger shows the amount and the depositor. _(adds W, P, L)_
2. **A note, not a name** — Inside the pool, your deposit becomes a commitment in a Merkle tree. _(adds T)_
3. **Prove it without showing it** — Every spend carries a zero-knowledge proof, checked by a gate on the chain itself. _(adds Z, V)_
4. **Paying inside the pool** — The main event: your notes are spent, new notes appear under the recipient's key. _(adds R, N)_
5. **Public out** — Withdrawing is the exit: prove your notes and move value back to the public ledger.
6. **Compliance is a design parameter** — Privacy and compliance are not opposing requirements — every pool ships with both dials. _(adds A, K)_
7. **The whole system** — Everything at once — pick a flow and watch ext_amount tell the story.

## Structures

### The public edges

#### W · Your wallet

**In one line.** Where you start: deposit in, pay inside, withdraw out.

**What it does.** Any app holding your keys — the hosted demo with Freighter, an app built on the SDK, or the spp CLI. Your private balance lives here as notes only you can spend.

**How it's built.** Web SDK ships as **prebuilt WASM on npm** (`stellar-private-payments@alpha`); signing is pluggable (`FreighterSigner` built in). Rust SDK and `spp` CLI cover native and terminal.

**Steps in execution.**

1. **Onboard** — Derive your pool keys and accept the preview disclaimer.
2. **Sync** — The SDK syncs pool history via a bootnode, past the 7-day RPC window.
3. **Spend** — Pick notes, build a proof, submit the transaction.

#### L · Public ledger

**In one line.** Records that the pool was used — never who paid whom or how much inside.

**What it does.** The Stellar ledger everyone can read. It shows funds entering the pool and funds leaving it. The one field that tells the story on a pool transaction is `ext_amount`.

**How it's built.** `ext_amount` positive = deposit (public amount in). `ext_amount` = 0 = private transfer, recipient appears **nowhere on the transaction**. Negative = withdrawal (public amount out). Watch it on stellar.expert.

**Steps in execution.**

1. **Deposit** — ext_amount +50000000 · +5 XLM, public.
2. **Transfer** — ext_amount 0 · amount and recipient private.
3. **Withdraw** — ext_amount −20000000 · −2 XLM, public.

#### R · Recipient

**In one line.** The other side of a payment — paid inside the pool, invisible to the public.

**What it does.** You can pay a Stellar G-address inside the pool; ecosystem builds have demonstrated testnet payments to C-addresses with smart accounts. The recipient sees the new notes; the public ledger does not.

**How it's built.** New notes are created **under the recipient’s key**; the SDK’s background sync discovers them. Public-key registry contract maps addresses to pool keys.

**Steps in execution.**

1. **Discover** — Sync finds notes addressed to your key.
2. **Hold or spend** — Keep a private balance, pay onward, or withdraw.

### Inside the pool

#### P · Pool contract

**In one line.** The shared pool where funds live and every operation lands.

**What it does.** One contract holds everyone’s deposits. Your deposit becomes a note in the pool; transfers spend your notes and mint new ones for the recipient; withdrawals move value back to the public ledger.

**How it's built.** Stellar Smart Contract (Soroban), deployed on testnet with **embedded contract IDs** so the SDK works with minimal config. Testnet runs XLM and EURC pools. Checks every operation’s proof, association-set membership, and nullifiers before applying it.

**Steps in execution.**

1. **Accept** — Take a deposit, transfer, or withdrawal request.
2. **Verify** — Groth16 proof → verifier; membership → ASP; freshness → nullifier set.
3. **Apply** — Insert new commitments, record nullifiers, settle ext_amount.

#### T · Note tree

**In one line.** A Merkle tree of commitments — proof that value exists, without whose it is.

**What it does.** Every deposit and every in-pool payment becomes a commitment here: a cryptographic note proving value exists in the pool without revealing the owner or amount.

**How it's built.** Commitments are **Poseidon2 hashes** of amount, owner key, and a random blinding, kept in a Merkle tree; spending proves membership of the tree without pointing at a leaf. Poseidon2 runs as a protocol host function.

**Steps in execution.**

1. **Insert** — A new note’s commitment joins the tree.
2. **Prove** — A spender proves “my note is in this tree” in zero knowledge.

#### N · Nullifier set

**In one line.** The double-spend guard: each note can be spent exactly once.

**What it does.** When notes are spent, a nullifier is published onchain. The same note produces the same nullifier, so a second spend is rejected — without ever revealing which note it was.

**How it's built.** Nullifiers are derived from the note’s commitment and a signature under the owner’s key; the pool rejects any transaction whose nullifier **already appears in the set**.

**Steps in execution.**

1. **Publish** — Every spend emits its nullifiers.
2. **Reject** — A repeat nullifier fails the transaction.

### The proof machinery

#### Z · Prover

**In one line.** Runs on your side: turns “I own valid notes” into a proof that reveals nothing else.

**What it does.** Before any spend, your wallet builds a zero-knowledge proof saying “the notes I am spending are valid and I own them” — without saying which notes they are.

**How it's built.** Groth16 proving in the client — **WASM in the web SDK**, native in Rust; the CLI provisions circuits and proving keys on install.

**Steps in execution.**

1. **Select** — Pick notes covering the amount.
2. **Prove** — Generate the Groth16 proof and nullifiers.
3. **Submit** — Hand the proof to the pool contract.

#### V · Groth16 verifier

**In one line.** The onchain gate: no valid proof, no transaction.

**What it does.** A contract that checks each compact proof is valid without re-running the computation. Every deposit, transfer, and withdrawal passes through it.

**How it's built.** Groth16 verification over BN254 using the **Protocol 25/26 cryptographic host functions** — verification happens directly onchain, cheap enough to be practical.

**Steps in execution.**

1. **Receive** — Proof plus public inputs from the pool.
2. **Verify** — Pairing checks via host functions.
3. **Gate** — Valid → the operation proceeds; invalid → it fails.

### Compliance dials

#### A · Association set

**In one line.** Per-pool compliance gate: block-list, allow-list, or both — set at deploy.

**What it does.** Every pool transaction proves membership or non-membership in an association set, without revealing the user’s history. Deployers pick the mode per pool; the hosted demo runs block-list-only so anyone can try it.

**How it's built.** **Key-based** association sets (vs. the deposit-based Privacy Pools whitepaper model): association is at the key level, so deployers can KYC-gate entry and freeze every note owned by a flagged key. Membership and non-membership are separate contracts, designated per pool. Note-level deposit labeling and tracing, extending enforcement to funds already transferred inside the pool, is in design.

**Steps in execution.**

1. **Configure** — One flag at deploy: block-list, allow-list, or both.
2. **Prove** — Each deposit, transfer, and withdrawal proves set status.
3. **Enforce** — Flagged keys are excluded; their notes freezable.

#### K · View keys

**In one line.** Privacy from the public, visibility where it’s owed: audit and selective disclosure.

**What it does.** Global view keys optionally give a designated auditor visibility across all in-pool transactions, for monitoring and reporting obligations. User view keys let an individual prove note-level facts about one transaction to a party of their choosing.

**How it's built.** The global key can live in an institutional wallet or a **trusted execution environment**, disclosing only relevant, scoped data. User disclosures are context-bound proofs of amount, commitment, or spent status — note-scoped today; an attestation of full history and source of funds is a near-term goal.

**Steps in execution.**

1. **Designate** — A pool names its auditor account.
2. **Scope** — Disclose one transaction’s facts, not your history.

## Flows (representative packets)

Payload shapes are what the design implies, not measured traffic.

### Deposit — public in

| # | From → To | Packet | Representative payload |
|---|---|---|---|
| 1 | W → P | deposit | `{"ext_amount":"+50000000","note":"+5 XLM, public"}` |
| 2 | P → V | proof | `{"system":"groth16","valid":true}` |
| 3 | P → T | commitment | `{"leaf":"poseidon2(note)"}` |
| 4 | P → L | ledger entry | `{"ext_amount":"+5 XLM","visible":"amount + depositor"}` |

### Private transfer — ext_amount 0

| # | From → To | Packet | Representative payload |
|---|---|---|---|
| 1 | W → Z | spend request | `{"pay":"recipient, in-pool"}` |
| 2 | Z → P | transfer + proof | `{"ext_amount":0,"proof":"groth16"}` |
| 3 | P → V | verify | `{"valid":true}` |
| 4 | P → N | nullifiers | `{"spent_notes":"unlinkable"}` |
| 5 | P → T | new note | `{"owner":"recipient's key"}` |
| 6 | P → R | note discovered | `{"via":"background sync"}` |
| 7 | P → L | ledger entry | `{"ext_amount":0,"visible":"pool was used — nothing else"}` |

### Withdraw — public out

| # | From → To | Packet | Representative payload |
|---|---|---|---|
| 1 | W → Z | exit request | `{"amount":"2 XLM"}` |
| 2 | Z → P | withdraw + proof | `{"ext_amount":"-20000000","proof":"groth16"}` |
| 3 | P → V | verify | `{"valid":true}` |
| 4 | P → N | nullifiers | `{"double_spend":"blocked"}` |
| 5 | P → L | ledger entry | `{"ext_amount":"-2 XLM","visible":"amount + destination","hidden_from_public":"which deposit it came from"}` |

### Compliance — every operation

| # | From → To | Packet | Representative payload |
|---|---|---|---|
| 1 | W → Z | any operation | `{"kind":"deposit \| transfer \| withdraw"}` |
| 2 | Z → A | set proof | `{"proves":"membership / non-membership","reveals":"no history"}` |
| 3 | A → P | admitted | `{"mode":"block-list · allow-list · both"}` |
| 4 | P → K | scoped view | `{"audience":"designated auditor only"}` |

## Changelog

- **2026-08-23 18:05** — Precision pass, verified against the SPP repo source: commitments are **Poseidon2** hashes of amount, owner key, and blinding; nullifier wording tightened to match the transaction circuit; `circuits/` added to the repo sketch.
- **2026-08-23 17:40** — Reader-facing cleanup: question tracking removed, header retitled to Developer Preview, hover tooltip fix.
- **2026-08-23 17:10** — First published, built from the Developer Preview blog draft (last updated 2026-08-23).

## Questions — index

Reference by ID. ✓ resolved (with date) · otherwise open.


## What the platform gives vs what we own

**Platform gives:** Protocol 25 (X-Ray) and Protocol 26 (Yardstick) added cryptographic host functions to Stellar itself — BN254/BLS12-381 curve operations and Poseidon hashes — so ZK proofs verify efficiently onchain.

**We own:** Everything above the base layer is contracts and SDKs: the pool contract, the Groth16 verifier, ASP membership contracts, a public-key registry, plus TS/JS and Rust SDKs and the <code>spp</code> CLI.

## Planned filesystem

```
stellar-private-payments/
  contracts/        pool · verifier · ASP · key registry
  circuits/         Circom circuits (Groth16 over BN254)
  sdk/web/          TS/JS, prebuilt WASM (npm: stellar-private-payments@alpha)
  sdk/native/       Rust SDK
  cli/              spp — deposit/transfer/withdraw from the terminal
```

## How this file is maintained

Generated from `atlas/data.mjs` by `node atlas/build.mjs`, which also builds the interactive atlas (`atlas.html`, published at https://claude.ai/code/artifact/18151c9d-5ae8-4425-8b96-a2ced55e1ac6). Edit the data file, rebuild, republish — never edit this file by hand.
