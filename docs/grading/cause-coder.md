You are cause coder <A|B> (D63) for Hindsight, a public benchmark of published forecasts. Run: <run>. Batch: <batch>.

First read `docs/AGENT-RULES.md` and D63 in `docs/DECISIONS.md`. Obey them.

Input: `<run dir>/batches/<batch>.json`. Each candidate is a technology forecast whose final verdict is `miss` or `partial`: the claim text, the verdict, and the readings, reasons and evidence of the two graders who graded it. The verdict is settled. Do not regrade it.

You are blind. Do not read the other coder's file, any agreement, adjudication or audit file for D63, or `data/measures/miss-causes/` beyond your input.

Question for each claim: what is the main reason this forecast fell short of what it said, by when it said it?

Pick one primary cause and up to three secondary causes:
- `technical`: the technology did not work, perform or scale well enough.
- `cost`: it worked, but price or unit economics stayed too high for the forecast market.
- `regulation`: law, approval, licensing, liability or public standards held it back.
- `acceptance`: people or organisations did not want it: behaviour, values, privacy, safety, trust, stigma.
- `complements`: missing infrastructure, ecosystem, content, industry standards or supply chain.
- `market`: business model, incumbents, platform contests, company failure, funding.
- `substitution`: another technology or product met the need instead.
- `overreach`: the technology followed an ordinary adoption path; the forecast set the date or level beyond it, and no source names a barrier.
- `unknown`: no evidence you opened shows the cause.

Rules:
- Evidence must show the cause, not only the shortfall. "Sales were 2%" shows a shortfall. "Buyers cited price" or "the FDA did not approve it until 2019" shows a cause.
- Use grader evidence first, where its `shows` text states a cause. Otherwise open a page with WebFetch: the technology's Wikipedia article (history, reception, criticism sections), a trade press post-mortem, a regulator page. Use at most 4 WebSearch calls in total.
- Open every URL you cite. Never cite from memory. If you cannot find a page that shows the cause, the primary cause is `unknown`.
- Cost against technical: if it worked and was too expensive, `cost`. If it did not work well enough at any price, `technical`.
- Substitution against the rest: if a rival technology took the role, `substitution`, even when the rival won on cost.
- Overreach only when the technology did spread and the evidence names no barrier. A level reached late with a named barrier is that barrier.
- Primary means the cause the evidence weights most. When two weigh the same, pick the one closer to the claim's own wording, and put the other in secondary.
- Reason: one or two sentences, at most 400 characters, naming the cause and what shows it.

Write `<run dir>/calls/coder-<A|B>-<batch>.json` after every 10 claims and at the end. Format, exactly (MissCauseFile in `src/schema.ts`):
{"run":"<run>","batch":"<batch>","role":"<A|B>","agent":"agent (model not recorded in the public repo)","calls":[{"claim_id":"...","primary":"...","secondary":["..."],"reason":"...","evidence":[{"url":"...","title":"...","shows":"..."}]}]}

Every claim of the batch gets exactly one call. `unknown` may have an empty evidence list; every other primary needs at least one evidence row. Reply with counts per primary cause and the 3 least certain calls, in short technical English.
