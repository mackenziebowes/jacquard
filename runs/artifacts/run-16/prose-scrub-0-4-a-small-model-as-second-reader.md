# Plan: prose-scrub 0.4: a small model as the second reader

World: **a page of text drawn as filled bars** (one bar per line, ragged lengths, black-cut lines on a solid sheet), read by two machines. The **gate** is a solid comb with fixed teeth (a word list: catches only exact shapes). The **judge** is a small solid lamp on a stalk (Haiku) that lights lines. Shared pieces in `world.tsx`: `Frame`, `Page`, `Gate`, `Judge`, colour/type constants. Type sizes: reuse the eeat `labels` sizes (13/11.5, compact 15/13). Ink + muted + one accent per figure; no outlines; labels beside objects, never on filled shapes; no charts or axes.
Note: `.jacquard/library.md` lists figures and a world file for this post that are not in the repo (only `OpeningDiff.tsx` exists). All are rebuilt here; correct the library entry afterwards.
Skipped: the table section (the table is the evidence), "Using it" (a code block), sources. Superficial analysis (per-sentence) has no figure of its own: the hero's judge lights a line "for a person" and OpeningDiff shows "Okay." being flagged.

## Hero: two readers
- file: client/components/explainers/prose-scrub-0-4-a-small-model-as-second-reader/TwoReaders.tsx
- section: (after the intro)
- kind: what happened
- claim: A word list catches shapes, a small model can read what the list can't see, and only a person decides what to do with it.
- mechanism: the gate only fails lines that match its teeth, so lines of the right shape drop out and the rest slide through; the judge reads what slid through and flags two for a person.
- metaphor: a page of bars slides under the comb-gate (matching lines fall out as gaps), then under the judge lamp, which lights two remaining lines in accent; a small hand-off tag "for a person" beside them.
- animation: 0-1.5 s page slides in; 1.5-3 s gate lowers, three lines fall out and the rest close up; 3-4.5 s judge swings over and lights two lines in accent; the tag fades in. Ends still.
- numbers: two habits (significance, superficial analysis) as the only text if any; otherwise illustrative.

## A bet about headings
- file: client/components/explainers/prose-scrub-0-4-a-small-model-as-second-reader/HeadingBet.tsx
- section: A bet about headings (after para 2, the numbers)
- kind: what happened
- claim: I bet Haiku would rank every heading 1.0 on importance; I lost (three runs, means 0.47, 0.52, 0.50), but all three runs quoted the same seven lines. "Those seven were the real finding. The rewrite cut them."
- mechanism: the bet is that everything glows; the three sweeps show a dim page with the same seven lines lit every time.
- metaphor: a page with heading bars and body-line bars. First every heading bar is at full ink, loud (the bet), then dims to muted, no glow. Then the judge lamp sweeps the page three times (three small lamp marks); each time the same seven body lines light in accent. The headings stay dim.
- animation: 0-1.2 s all headings at full ink (the bet); 1.2-1.8 s they dim to muted; 1.8-5 s three sweeps, each lighting the same seven lines (accent builds in each time); last 0.7 s the seven lines drop out of the page (the rewrite cut them), page closes up. Labels: "the bet: every heading loud", "three runs, same seven lines", "0.47 / 0.52 / 0.50".
- numbers: 0.47, 0.52, 0.50, seven lines, three runs. No per-heading heights.

## What to ask a small model
- file: client/components/explainers/prose-scrub-0-4-a-small-model-as-second-reader/SaysVsShows.tsx
- section: What to ask a small model (after para 2)
- kind: what happened
- claim: Significance needed a reader: score separately how important a paragraph says its subject is and how much evidence it gives, and flag it when the first is much higher.
- mechanism: two pans of a balance, "says it matters" against "evidence"; a paragraph is dropped on and the first pan sinks far below the second.
- metaphor: the judge lamp stands over a solid beam balance on a post and its light reads the paragraph-sheet onto the pans; a paragraph-sheet; a pan of loud shapes (stack of big discs) vs a pan holding a few small blocks; a flag in accent on the tilt.
- animation: 0-1.5 s balance level and empty; 1.5-3.5 s a sheet reads in, the "says" pan fills with discs and sinks (use physics `tilt`/`level`); 3.5-4.5 s flag rises in accent.
- numbers: illustrative.

## Five runs, averaged
- file: client/components/explainers/prose-scrub-0-4-a-small-model-as-second-reader/FiveRuns.tsx
- section: Five runs, averaged (after para 2, 158 of 330)
- kind: what happened
- claim: "if a Haiku Claude disagrees with parallel Haikus, that is signal and not noise, so averaging is the correct move. Probably." They agreed on 158 of 330 scores, and almost every disagreement was one step on Haiku's grid, one run at 0.25 where four said 0.3; no run was the odd one out. "Too little data to explain anything."
- mechanism: five lamps read one flagged line; four land on one step, one a step dimmer; averaged, the line gets one value.
- metaphor: five judge lamps in a row over one page line; below, two physical rungs, 0.3 and 0.25, and five marks: four land on the upper rung, one on the lower. The odd lamp is muted, not wrong, drawn tentatively. The one accent is the averaged value that settles between the rungs.
- animation: 0-1.5 s five lamps lower over the line; 1.5-3 s marks drop onto the ladder (four settle together, one a step below); 3-4.2 s the average marker (accent) slides in and settles between the rungs; label "158 of 330: all five agree, the rest mostly one step apart" fades in last.
- numbers: five runs, 0.25, 0.3, 158 of 330.

## A field named claim
- file: client/components/explainers/prose-scrub-0-4-a-small-model-as-second-reader/ClaimField.tsx
- section: A field named claim (after the paragraph)
- kind: what happened
- claim: Four of five runs returned no scores because the field was called claim and Haiku wrote a sentence; renamed importance_score, evidence_score, empty_score with a strict schema, all five came back complete.
- mechanism: the name of a slot tells the model what goes in it.
- metaphor: five slots in a row (five runs), a name label above them (beside, not on shapes); with "claim" four slots take sentence-bars; with "importance_score" all five take number blocks.
- animation: 0-2 s label "claim" appears, four slots fill with sentence-bars (muted), one with a number block; 2-2.8 s label swaps to "importance_score"; 2.8-4.5 s all five slots refill with number blocks, accent on the complete row.
- numbers: 4 of 5, five runs.

## Where clean reads worse (kept, restyled)
- file: client/components/explainers/prose-scrub-0-4-a-small-model-as-second-reader/OpeningDiff.tsx
- section: Where clean reads worse (after para 1, where it already sits)
- kind: what happened (the gate's cuts and the judge's flag, and that the opening read worse for it)
- claim: "Clean isn't always easier to read." The cut words were there on purpose.
- mechanism: word-level diff of the small-business post's opening; each struck word is named by what cut it.
- metaphor: the existing text diff, recoloured: ink for kept text, muted for struck words, tomato only for the cuts nobody asked for ("But"); the cutting rule named as a muted sub-line, no four-colour legend (orange is reserved for the OG post).
- animation: struck words strike through in reading order, staggered over ~3.5 s; sub-lines fade in with them; ends still.
- numbers: as in the post.
- also: rewrite the `alt` and `caption` for the new colour scheme in the data file and the md twin.
