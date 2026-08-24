// Single source of truth for the Stellar Private Payments atlas.
// Build: node atlas/build.mjs  → writes ../SYSTEM.md and ../atlas.html
// Companion visual for the Developer Preview blog post (draft 2026-08-23).

export const META = {
  title: 'Stellar Private Payments',
  artifactUrl: 'https://claude.ai/code/artifact/18151c9d-5ae8-4425-8b96-a2ced55e1ac6',
  sourcePath: 'atlas/data.mjs',
  buildCmd: 'node atlas/build.mjs',
  stats: [
    { k: 'System', v: 'Stellar Private Payments Developer Preview (testnet)' },
    { k: 'Developed by', v: 'Nethermind' },
  ],
  intro: `_**This file is the living source of truth for the visual.** The interactive atlas is built from the same data._`,
  onePara: `Stellar Private Payments (SPP) is a privacy pool: users deposit an asset into a shared pool contract, hold a private balance as cryptographic notes, and pay each other inside the pool. Deposits in and withdrawals out are public on the ledger; the link between them, and the counterparties and amounts of transfers inside, are kept private from the public. Every operation carries a zero-knowledge proof, and every pool is deployed with compliance controls: a key-based association set (block-list, allow-list, or both) and optional view keys for audit. Live on testnet, unaudited, developer preview.`,
  costModel: [],
  deepDive: '',
  platformGives: 'Protocol 25 (X-Ray) and Protocol 26 (Yardstick) added cryptographic host functions to Stellar itself — BN254/BLS12-381 curve operations and Poseidon hashes — so ZK proofs verify efficiently onchain.',
  weOwn: 'Everything above the base layer is contracts and SDKs: the pool contract, the Groth16 verifier, ASP membership contracts, a public-key registry, plus TS/JS and Rust SDKs and the <code>spp</code> CLI.',
  filesystem: `stellar-private-payments/\n  contracts/        pool · verifier · ASP · key registry\n  circuits/         Circom circuits (Groth16 over BN254)\n  sdk/web/          TS/JS, prebuilt WASM (npm: stellar-private-payments@alpha)\n  sdk/native/       Rust SDK\n  cli/              spp — deposit/transfer/withdraw from the terminal`,
};

export const CHANGELOG = [
  { date: '2026-08-23 18:05', note: 'Precision pass, verified against the SPP repo source: commitments are <mark>Poseidon2</mark> hashes of amount, owner key, and blinding; nullifier wording tightened to match the transaction circuit; <code>circuits/</code> added to the repo sketch.' },
  { date: '2026-08-23 17:40', note: 'Reader-facing cleanup: question tracking removed, header retitled to Developer Preview, hover tooltip fix.' },
  { date: '2026-08-23 17:10', note: 'First published, built from the Developer Preview blog draft (last updated 2026-08-23).' },
];

export const DECISIONS = [
  { axis: 'Privacy target', decision: 'Counterparty privacy — who paid whom inside the pool — not just confidential amounts (that lane is Confidential Token)', adr: '—' },
  { axis: 'Proof system', decision: 'Groth16, verified onchain via the Protocol 25/26 cryptographic host functions', adr: '—' },
  { axis: 'Compliance model', decision: 'Key-based association sets, configurable per pool at deploy: block-list, allow-list, or both', adr: '—' },
  { axis: 'Auditability', decision: 'Optional global view keys for administrators, user view keys for note-scoped selective disclosure', adr: '—' },
  { axis: 'Network', decision: 'Testnet only for the preview; contracts unaudited, not approved for mainnet', adr: '—' },
];

export const GROUPS = [
  { id: 'edge', title: 'The public edges' },
  { id: 'pool', title: 'Inside the pool' },
  { id: 'proof', title: 'The proof machinery' },
  { id: 'comp', title: 'Compliance dials' },
];

export const NODES = [
  { id: 'W', code: 'W', name: 'Your wallet', short: 'WALLET', group: 'edge', gx: 1, gy: 6.5, w: 2, d: 2, h: 44, kind: 'screen',
    one: 'Where you start: deposit in, pay inside, withdraw out.',
    what: 'Any app holding your keys — the hosted demo with Freighter, an app built on the SDK, or the spp CLI. Your private balance lives here as notes only you can spend.',
    how: 'Web SDK ships as <mark>prebuilt WASM on npm</mark> (<code>stellar-private-payments@alpha</code>); signing is pluggable (<code>FreighterSigner</code> built in). Rust SDK and <code>spp</code> CLI cover native and terminal.',
    steps: [['Onboard', 'Derive your pool keys and accept the preview disclaimer.'], ['Sync', 'The SDK syncs pool history via a bootnode, past the 7-day RPC window.'], ['Spend', 'Pick notes, build a proof, submit the transaction.']],
    cond: [] },
  { id: 'L', code: 'L', name: 'Public ledger', short: 'PUBLIC LEDGER', group: 'edge', gx: 6, gy: 9.5, w: 4, d: 3, h: 22, kind: 'slab',
    one: 'Records that the pool was used — never who paid whom or how much inside.',
    what: 'The Stellar ledger everyone can read. It shows funds entering the pool and funds leaving it. The one field that tells the story on a pool transaction is <code>ext_amount</code>.',
    how: '<code>ext_amount</code> positive = deposit (public amount in). <code>ext_amount</code> = 0 = private transfer, recipient appears <mark>nowhere on the transaction</mark>. Negative = withdrawal (public amount out). Watch it on stellar.expert.',
    steps: [['Deposit', 'ext_amount +50000000 · +5 XLM, public.'], ['Transfer', 'ext_amount 0 · amount and recipient private.'], ['Withdraw', 'ext_amount −20000000 · −2 XLM, public.']],
    cond: [] },
  { id: 'R', code: 'R', name: 'Recipient', short: 'RECIPIENT', group: 'edge', gx: 19, gy: 9, w: 2, d: 2, h: 44, kind: 'screen',
    one: 'The other side of a payment — paid inside the pool, invisible to the public.',
    what: 'You can pay a Stellar G-address inside the pool; ecosystem builds have demonstrated testnet payments to C-addresses with smart accounts. The recipient sees the new notes; the public ledger does not.',
    how: 'New notes are created <mark>under the recipient’s key</mark>; the SDK’s background sync discovers them. Public-key registry contract maps addresses to pool keys.',
    steps: [['Discover', 'Sync finds notes addressed to your key.'], ['Hold or spend', 'Keep a private balance, pay onward, or withdraw.']],
    cond: [] },
  { id: 'P', code: 'P', name: 'Pool contract', short: 'POOL', group: 'pool', gx: 8, gy: 4.5, w: 3, d: 3, h: 72, kind: 'tall',
    one: 'The shared pool where funds live and every operation lands.',
    what: 'One contract holds everyone’s deposits. Your deposit becomes a note in the pool; transfers spend your notes and mint new ones for the recipient; withdrawals move value back to the public ledger.',
    how: 'Stellar Smart Contract (Soroban), deployed on testnet with <mark>embedded contract IDs</mark> so the SDK works with minimal config. Testnet runs XLM and EURC pools. Checks every operation’s proof, association-set membership, and nullifiers before applying it.',
    steps: [['Accept', 'Take a deposit, transfer, or withdrawal request.'], ['Verify', 'Groth16 proof → verifier; membership → ASP; freshness → nullifier set.'], ['Apply', 'Insert new commitments, record nullifiers, settle ext_amount.']],
    cond: [] },
  { id: 'T', code: 'T', name: 'Note tree', short: 'NOTE TREE', group: 'pool', gx: 13, gy: 6.5, w: 2.5, d: 2.5, h: 26, kind: 'store',
    one: 'A Merkle tree of commitments — proof that value exists, without whose it is.',
    what: 'Every deposit and every in-pool payment becomes a commitment here: a cryptographic note proving value exists in the pool without revealing the owner or amount.',
    how: 'Commitments are <mark>Poseidon2 hashes</mark> of amount, owner key, and a random blinding, kept in a Merkle tree; spending proves membership of the tree without pointing at a leaf. Poseidon2 runs as a protocol host function.',
    steps: [['Insert', 'A new note’s commitment joins the tree.'], ['Prove', 'A spender proves “my note is in this tree” in zero knowledge.']],
    cond: [] },
  { id: 'N', code: 'N', name: 'Nullifier set', short: 'NULLIFIERS', group: 'pool', gx: 13, gy: 1, w: 2.5, d: 2.5, h: 26, kind: 'store',
    one: 'The double-spend guard: each note can be spent exactly once.',
    what: 'When notes are spent, a nullifier is published onchain. The same note produces the same nullifier, so a second spend is rejected — without ever revealing which note it was.',
    how: 'Nullifiers are derived from the note’s commitment and a signature under the owner’s key; the pool rejects any transaction whose nullifier <mark>already appears in the set</mark>.',
    steps: [['Publish', 'Every spend emits its nullifiers.'], ['Reject', 'A repeat nullifier fails the transaction.']],
    cond: [] },
  { id: 'Z', code: 'Z', name: 'Prover', short: 'PROVER', group: 'proof', gx: 5, gy: 4.5, w: 2, d: 2, h: 30, kind: 'cards',
    one: 'Runs on your side: turns “I own valid notes” into a proof that reveals nothing else.',
    what: 'Before any spend, your wallet builds a zero-knowledge proof saying “the notes I am spending are valid and I own them” — without saying which notes they are.',
    how: 'Groth16 proving in the client — <mark>WASM in the web SDK</mark>, native in Rust; the CLI provisions circuits and proving keys on install.',
    steps: [['Select', 'Pick notes covering the amount.'], ['Prove', 'Generate the Groth16 proof and nullifiers.'], ['Submit', 'Hand the proof to the pool contract.']],
    cond: [] },
  { id: 'V', code: 'V', name: 'Groth16 verifier', short: 'VERIFIER', group: 'proof', gx: 9, gy: 0.5, w: 2, d: 2, h: 40, kind: 'gate',
    one: 'The onchain gate: no valid proof, no transaction.',
    what: 'A contract that checks each compact proof is valid without re-running the computation. Every deposit, transfer, and withdrawal passes through it.',
    how: 'Groth16 verification over BN254 using the <mark>Protocol 25/26 cryptographic host functions</mark> — verification happens directly onchain, cheap enough to be practical.',
    steps: [['Receive', 'Proof plus public inputs from the pool.'], ['Verify', 'Pairing checks via host functions.'], ['Gate', 'Valid → the operation proceeds; invalid → it fails.']],
    cond: [] },
  { id: 'A', code: 'A', name: 'Association set', short: 'ASP', group: 'comp', gx: 4, gy: 0, w: 2, d: 2, h: 40, kind: 'gate',
    one: 'Per-pool compliance gate: block-list, allow-list, or both — set at deploy.',
    what: 'Every pool transaction proves membership or non-membership in an association set, without revealing the user’s history. Deployers pick the mode per pool; the hosted demo runs block-list-only so anyone can try it.',
    how: '<mark>Key-based</mark> association sets (vs. the deposit-based Privacy Pools whitepaper model): association is at the key level, so deployers can KYC-gate entry and freeze every note owned by a flagged key. Membership and non-membership are separate contracts, designated per pool. Note-level deposit labeling and tracing, extending enforcement to funds already transferred inside the pool, is in design.',
    steps: [['Configure', 'One flag at deploy: block-list, allow-list, or both.'], ['Prove', 'Each deposit, transfer, and withdrawal proves set status.'], ['Enforce', 'Flagged keys are excluded; their notes freezable.']],
    cond: [] },
  { id: 'K', code: 'K', name: 'View keys', short: 'VIEW KEYS', group: 'comp', gx: 17.5, gy: 4, w: 2, d: 2, h: 34, kind: 'box',
    one: 'Privacy from the public, visibility where it’s owed: audit and selective disclosure.',
    what: 'Global view keys optionally give a designated auditor visibility across all in-pool transactions, for monitoring and reporting obligations. User view keys let an individual prove note-level facts about one transaction to a party of their choosing.',
    how: 'The global key can live in an institutional wallet or a <mark>trusted execution environment</mark>, disclosing only relevant, scoped data. User disclosures are context-bound proofs of amount, commitment, or spent status — note-scoped today; an attestation of full history and source of funds is a near-term goal.',
    steps: [['Designate', 'A pool names its auditor account.'], ['Scope', 'Disclose one transaction’s facts, not your history.']],
    cond: [] },
];

export const FLOWS = [
  { id: 'deposit', name: 'Deposit — public in', hops: [
    ['W', 'P', 'deposit', { ext_amount: '+50000000', note: '+5 XLM, public' }, 'yx'],
    ['P', 'V', 'proof', { system: 'groth16', valid: true }, 'xy'],
    ['P', 'T', 'commitment', { leaf: 'poseidon2(note)' }, 'xy'],
    ['P', 'L', 'ledger entry', { ext_amount: '+5 XLM', visible: 'amount + depositor' }, 'yx'],
  ] },
  { id: 'transfer', name: 'Private transfer — ext_amount 0', hops: [
    ['W', 'Z', 'spend request', { pay: 'recipient, in-pool' }, 'xy'],
    ['Z', 'P', 'transfer + proof', { ext_amount: 0, proof: 'groth16' }, 'xy'],
    ['P', 'V', 'verify', { valid: true }, 'xy'],
    ['P', 'N', 'nullifiers', { spent_notes: 'unlinkable' }, 'xy'],
    ['P', 'T', 'new note', { owner: "recipient's key" }, 'yx'],
    ['P', 'R', 'note discovered', { via: 'background sync' }, 'yx'],
    ['P', 'L', 'ledger entry', { ext_amount: 0, visible: 'pool was used — nothing else' }, 'xy'],
  ] },
  { id: 'withdraw', name: 'Withdraw — public out', hops: [
    ['W', 'Z', 'exit request', { amount: '2 XLM' }, 'xy'],
    ['Z', 'P', 'withdraw + proof', { ext_amount: '-20000000', proof: 'groth16' }, 'xy'],
    ['P', 'V', 'verify', { valid: true }, 'xy'],
    ['P', 'N', 'nullifiers', { double_spend: 'blocked' }, 'xy'],
    ['P', 'L', 'ledger entry', { ext_amount: '-2 XLM', visible: 'amount + destination', hidden_from_public: 'which deposit it came from' }, 'yx'],
  ] },
  { id: 'comply', name: 'Compliance — every operation', hops: [
    ['W', 'Z', 'any operation', { kind: 'deposit | transfer | withdraw' }, 'xy'],
    ['Z', 'A', 'set proof', { proves: 'membership / non-membership', reveals: 'no history' }, 'xy'],
    ['A', 'P', 'admitted', { mode: 'block-list · allow-list · both' }, 'yx'],
    ['P', 'K', 'scoped view', { audience: 'designated auditor only' }, 'xy'],
  ] },
];

export const CH = [
  { id: 'in', title: 'Public in', reveal: ['W', 'P', 'L'],
    lede: `Funds enter the pool in public: the ledger shows the amount and the depositor.`,
    story: `<p>Stellar Private Payments is a pool — <mark>the place where funds live and transactions happen</mark>. You deposit from your wallet, and the public ledger records it plainly: <code>ext_amount +50000000</code>, five XLM in. Nothing about entering the pool is private.</p>`,
    flow: [['W', 'P', 'deposit', { ext_amount: '+50000000' }], ['P', 'L', 'ledger entry', { ext_amount: '+5 XLM', visible: 'amount + depositor' }]] },
  { id: 'note', title: 'A note, not a name', reveal: ['T'],
    lede: `Inside the pool, your deposit becomes a commitment in a Merkle tree.`,
    story: `<p>The pool doesn’t keep an account for you. Your deposit becomes a <mark>cryptographic note</mark> — a commitment proving value exists in the pool without revealing whose it is. The tree grows with every deposit and every in-pool payment.</p>`,
    flow: [['W', 'P', 'deposit', { ext_amount: '+50000000' }], ['P', 'T', 'commitment', { leaf: 'poseidon2(note)' }], ['P', 'L', 'ledger entry', { ext_amount: '+5 XLM' }]] },
  { id: 'prove', title: 'Prove it without showing it', reveal: ['Z', 'V'],
    lede: `Every spend carries a zero-knowledge proof, checked by a gate on the chain itself.`,
    story: `<p>To spend notes, your wallet proves <em>“the notes I am spending are valid and I own them”</em> — <mark>without revealing which notes they are</mark>. The proof is built on your side and verified onchain by a Groth16 verifier, using cryptographic host functions Stellar added in Protocols 25 and 26.</p>`,
    flow: [['W', 'Z', 'spend request', { notes: 'yours' }], ['Z', 'P', 'proof', { system: 'groth16' }], ['P', 'V', 'verify', { valid: true }]] },
  { id: 'pay', title: 'Paying inside the pool', reveal: ['R', 'N'],
    lede: `The main event: your notes are spent, new notes appear under the recipient's key.`,
    story: `<p>A payment inside the pool posts <code>ext_amount 0</code> to the ledger — the amount moves entirely inside encrypted commitments and the recipient appears <mark>nowhere on the transaction</mark>. A nullifier is published so the same note can never be spent twice. You can hold a private balance indefinitely and pay many counterparties before ever leaving.</p>`,
    flow: [['W', 'Z', 'pay 2 XLM in-pool', { to: 'recipient' }], ['Z', 'P', 'transfer + proof', { ext_amount: 0 }], ['P', 'V', 'verify', { valid: true }], ['P', 'N', 'nullifiers', { spent: 'unlinkable' }], ['P', 'T', 'new note', { owner: "recipient's key" }], ['P', 'R', 'note discovered', { via: 'sync' }]] },
  { id: 'out', title: 'Public out', reveal: [],
    lede: `Withdrawing is the exit: prove your notes and move value back to the public ledger.`,
    story: `<p>The withdrawal is public again — <code>ext_amount −20000000</code>, two XLM out to an address. <mark>Public in, private middle, public out</mark>: an observer sees funds enter and leave, with nothing onchain tying a given entry to a given exit. The more deposits share the pool, the stronger that holds — pools love a crowd.</p>`,
    flow: [['W', 'Z', 'exit request', { amount: '2 XLM' }], ['Z', 'P', 'withdraw + proof', { ext_amount: '-20000000' }], ['P', 'V', 'verify', { valid: true }], ['P', 'N', 'nullifiers', { double_spend: 'blocked' }], ['P', 'L', 'ledger entry', { ext_amount: '-2 XLM', visible: 'amount + destination' }]] },
  { id: 'comply', title: 'Compliance is a design parameter', reveal: ['A', 'K'],
    lede: `Privacy and compliance are not opposing requirements — every pool ships with both dials.`,
    story: `<p>Every pool transaction proves membership or non-membership in an <mark>association set</mark> — block-list, allow-list, or both, chosen per pool at deploy — without revealing the user’s history. View keys add visibility where it’s owed: global keys for a designated auditor, user keys for selective disclosure of a single transaction.</p>`,
    flow: [['W', 'Z', 'any operation', { kind: 'deposit | transfer | withdraw' }], ['Z', 'A', 'set proof', { reveals: 'no history' }], ['A', 'P', 'admitted', { mode: 'block-list' }], ['P', 'K', 'scoped view', { audience: 'auditor only' }]] },
  { id: 'all', title: 'The whole system', reveal: [],
    lede: `Everything at once — pick a flow and watch ext_amount tell the story.`,
    story: `<p>Choose a flow (bottom left): deposit in public, pay in private, withdraw in public, or the compliance path every operation takes. <mark>Live on testnet today</mark> — hosted demo, TS/JS and Rust SDKs, and the <code>spp</code> CLI. Unaudited developer preview; testnet only.</p>`,
    flow: null },
];

export const HOW_HTML = `<div class="eyebrow">Stellar Private Payments · developer preview</div><h1 class="t">How it's built</h1><div class="sub">a privacy pool on public rails, by Nethermind</div>
<p>A Stellar Smart Contract (Soroban) pool holds the funds; a Groth16 verifier gates every operation, running on the <mark>cryptographic host functions</mark> (BN254, Poseidon) added to Stellar in Protocols 25 (X-Ray) and 26 (Yardstick). Privacy lives in the layers above the base ledger — never in the base.</p>
<h3 class="sec">Layering</h3>
<p><b>Application</b> — the SPP pool contract (and, in the other lane, Confidential Token).<br><b>Verifier</b> — onchain Groth16 verifier: accepts a compact proof, confirms validity without re-running the computation.<br><b>Host functions</b> — protocol-level curve ops and Poseidon hashes.<br><b>Base ledger</b> — fully public, always.</p>
<h3 class="sec">Repo</h3><pre>stellar-private-payments/
  contracts/   pool · verifier · ASP · key registry
  circuits/    Circom circuits (Groth16 over BN254)
  sdk/web/     TS/JS, prebuilt WASM (npm)
  sdk/native/  Rust
  cli/         spp</pre>
<h3 class="sec">Try it</h3><p>Hosted demo + Freighter on testnet, <code>npm i stellar-private-payments@alpha</code>, or the one-line <code>spp</code> CLI install. Watch <code>ext_amount</code> on stellar.expert.</p>`;
