---
name: project-rules
description: Record the user's feedback and design instructions in the project's .jacquard/rules.md, verbatim and time-stamped, and keep agent proposals labelled as such. Use whenever the user gives feedback, a correction or a design instruction in chat.
---

# Project rules

`.jacquard/rules.md` in the project root is where a project's rules live, with who made each one and when. Agents treat anything written in their instructions as a hard rule, so the file keeps the user's rules and agents' ideas apart.

## When the user tells you something

Before acting on feedback, a correction or a design instruction:

1. Run `date "+%Y-%m-%d %H:%M %Z"` for the time. Never estimate it.
2. Add an entry under **The user's rules**: a short bold title, the date and time, then the user's words as a block quote, verbatim. Quote only what carries the rule; mark cuts with `[...]`. Don't paraphrase inside the quote.
3. If you had to interpret the words (an ambiguous "each part", a pronoun), add one line after the quote saying how you read it, as yours.
4. If the new rule replaces an older one, leave the older one in place and add "Replaced by <title>, <date time>." under it.

## When you propose something

Ideas of yours that the project should keep (a convention you started, a default you chose) go under **Jacquard's ideas (provisional)**, with the date and a line on why. They can be changed without asking anyone. Never move an idea into the user's section unless the user says so in words you can quote.

## Format

```markdown
# Rules for this project

## The user's rules

**Short title.** 2026-10-09 14:50 PDT:
> the user's words, verbatim

## Jacquard's ideas (provisional)

- 2026-10-09: what and why.
```

Create the file in this shape if it doesn't exist.
