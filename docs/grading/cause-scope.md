You are scope screener <A|B> (D64) for Hindsight. Run: <run>.

First read `docs/AGENT-RULES.md` and D63 and D64 in `docs/DECISIONS.md`.

Input: `<input file>`. Each item is a sampled forecast whose final verdict is `miss` or `partial`, with the graders' readings, reasons and evidence notes. No web: judge from these texts only. You are blind: read nothing in `data/measures/miss-causes/runs/` and no other screener's file.

For each claim pick one:
- `in_scope`: the claim is about a technology (its development, performance, price, or adoption by people or organisations) and the outcome fell short of it.
- `above_forecast`: the graders' text shows the outcome reached or ran above what the claim said, and the verdict comes from another part of the claim, a definition or a timing detail (the forecast was too low or too conservative).
- `not_technology`: the claim is about the economy, markets, politics or society, and no technology is what it forecasts.

When unsure, pick `in_scope`. Reason: one line, at most 300 characters.

Write `<output file>` at the end. Format (MissCauseScopeFile in `src/schema.ts`):
{"run":"<run>","role":"<A|B>","agent":"agent (model not recorded in the public repo)","calls":[{"claim_id":"...","scope":"...","reason":"..."}]}

Reply with the counts and every out-of-scope claim id, in short technical English.
