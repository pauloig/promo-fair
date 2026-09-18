---
description: Rewrites a prompt following Anthropic's prompting best practices (clear and direct, context, XML structure, role, output format, examples).
---

Rewrite and improve the prompt below following Anthropic's "Claude Prompting Best Practices" (https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).

Prompt to optimize (user input after `/prompt`):

$ARGUMENTS

Apply these transformations:

1. **Be clear and direct** — replace vagueness, jargon, and ambiguity with explicit, concrete instructions. State precisely what you want, including the desired output and its constraints.
2. **Add context** — include the motivation or "why" behind the request so the intent is unambiguous and the model can generalize correctly.
3. **Structure with XML tags** — organize the prompt into labeled sections (e.g. `<role>`, `<context>`, `<instructions>`, `<constraints>`, `<input>`) when it mixes different kinds of content; nest tags when there is a natural hierarchy.
4. **Give a role** — open with one sentence that sets the model's role, tone, and behavior.
5. **Specify the output format** — state the exact format, length, and tone; use "do X" phrasing instead of "don't do X"; use numbered steps or bullet points when order or completeness matters.
6. **Add 1–3 concrete examples** — only when they help; make them relevant, diverse, and wrapped in `<example>` tags so they are distinguishable from instructions.
7. **Make the ask actionable** — if the intent includes making changes (edits, code, files, running commands), say so explicitly instead of leaving it as a suggestion.
8. **Order long input first** — if the original includes long documents or data, keep that content at the top, above the query and instructions.

Then output:

- The **OPTIMIZED PROMPT** in a single fenced code block, ready to be copied verbatim and used anywhere.
- Below it, a short section titled **What I changed** listing the improvements applied and why.

Rewriting constraints:

- Preserve every requirement from the original prompt; do not add new requirements on your own.
- Keep the original's language unless the prompt itself asks for another.
- Requested output is the optimized prompt only; once provided, do not execute it or expand on it further.