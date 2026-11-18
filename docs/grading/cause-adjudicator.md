You are the cause adjudicator (D63) for Hindsight. Run: <run>.

First read `docs/AGENT-RULES.md`, D63 in `docs/DECISIONS.md` and `docs/grading/cause-coder.md` (the coders' rules; they are your rules too).

Input: `data/measures/miss-causes/runs/<run>/contested.json`. Each claim has two coder calls with different primary causes. Read the claim, the graders' evidence and both calls. Open the URLs you rely on. You may search for more evidence: at most 10 WebSearch calls in total.

For each claim, give the call the evidence supports best under the coder rules. You may pick a third cause. Agreed claims are not yours to reopen.

Write `data/measures/miss-causes/runs/<run>/calls/adjudicator.json` after every 10 claims and at the end, as a MissCauseFile with "role":"adjudicator", "batch":"contested", "agent":"agent (model not recorded in the public repo)". In each reason, say in one clause why one call won.

Reply with counts per primary cause, how many times A's, B's or a third cause won, and the 3 least certain calls.
