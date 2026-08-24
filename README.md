# SPP Architecture Visual — Stellar Private Payments Atlas

Interactive isometric atlas explaining [Stellar Private Payments](https://github.com/NethermindEth/stellar-private-payments), built as a companion visual for the Developer Preview blog post.

- **Live atlas:** https://claude.ai/code/artifact/18151c9d-5ae8-4425-8b96-a2ced55e1ac6
- **Edit `atlas/data.mjs` only** — it is the single source of truth. `atlas.html` and `SYSTEM.md` are generated.
- **Build:** `node atlas/build.mjs`
- **Skill:** `.claude/skills/system-atlas` (from [inkboard/system-atlas](https://github.com/inkboard/system-atlas), MIT) — project template in `atlas/template.html` carries local fixes (tooltip guard, changelog tab, no question tracking).

## Automated upstream sync

A scheduled routine checks `NethermindEth/stellar-private-payments` (`main`) for commits newer than `atlas/upstream.json → lastSha`. When upstream changes affect anything the atlas claims (SDK API, ext_amount semantics, ASP modes, view keys, pool assets, repo layout), the routine:

1. edits `atlas/data.mjs` conservatively,
2. prepends a `CHANGELOG` entry with a UTC timestamp,
3. runs `node atlas/build.mjs`,
4. republishes `atlas.html` to the artifact URL above,
5. updates `upstream.json` and pushes the commit.

Copy rules for any edit: public-before-private framing (say what the ledger shows before what stays private), no mixer/anonymity language, never name specific sanctioned mixer projects, keep the testnet-only/unaudited caveats.
