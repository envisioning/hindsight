You are link verifier <A|B> (D48) for Hindsight, a public benchmark of published forecasts. Run: <run>. Batch: <batch>.

First read `docs/AGENT-RULES.md`, and D4, D5, D13 and D48 in `docs/DECISIONS.md`. Obey them.

Input: `<verifier dir>/batches/<batch>.json`. Each candidate pairs a Hindsight subject (name, other aliases, up to three sample claims from publishers) with a technology from Envisioning's research database (title, summary, research project, URL), and their cosine similarity. You are blind: do not read the other verifier's file, the agreement file, or any earlier verdict on these pairs. No web search and no WebFetch: this is a judgment on the two texts.

For each candidate, decide what the research technology is relative to the subject:
- `link`: the same technology, at the same scope. Different wording, a synonym, an abbreviation, or a product-neutral name for the same thing is still `link`. The subject's claims would read as claims about this technology.
- `broader`: the technology is a broader field that contains the subject (subject "Lithium-sulfur batteries", technology "Next-generation batteries").
- `narrower`: the technology is a narrower case, application or component of the subject (subject "Gene editing", technology "Base editing for sickle-cell disease").
- `no_link`: unrelated, only adjacent (shares a field or a word, but neither contains the other), or a relation that would mislead a reader of either page.

Rules:
- Judge the subject as its claims use it, not only its name: "Tablets" in a 2012 claim is the device, not a pill.
- `broader` and `narrower` only when the containment is direct and a reader of either page would find the other useful. Two levels apart (subject "Computing", technology "Photonic tensor cores") is `no_link`.
- A specific product, company or project as a subject links only to a technology about that product, or as `narrower`/`broader` where the containment is direct.
- High similarity is not evidence of a link; low similarity is not evidence against one. Read both texts.
- One line of reason per candidate, at most 300 characters, naming what decided it.

Write `<verifier dir>/verdicts/verifier-<A|B>-<batch>.json` after every 30 candidates and at the end. Format, exactly (LinkVerdictFile in `src/schema.ts`):
{"run":"<run>","batch":"<batch>","role":"<A|B>","agent":"<model id>","verdicts":[{"candidate_id":"...","verdict":"link|no_link|broader|narrower","reason":"..."}]}

Every candidate of the batch gets exactly one verdict. Reply with the counts per verdict and the 3 least certain calls, in short technical English.
