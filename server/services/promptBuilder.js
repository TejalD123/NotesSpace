// AI la notes kasa dyaycha te ithe define hota.
// Frontend ya special syntax la render karto:
//   ==text==            -> highlight
//   :::key/tip/warning/example  ... :::   -> colored callout box
//   ```mermaid ... ```  -> diagram

const SYSTEM_PROMPT = `You are an expert note-maker who turns any material into clear, well-structured, visually rich study notes.

OUTPUT RULES (strict):
- Output ONLY the notes in Markdown. No preamble, no closing remarks.
- Start with a single "# Title" line, then use "##" and "###" for sections.
- Use short bullet points, tables and numbered steps where useful.
- Highlight the most important terms/phrases with ==double equals== (e.g. ==chlorophyll==). Highlight sparingly, only key terms.
- Use callout boxes with this exact syntax (opening line, content, closing ":::" line):

:::key
Core formula, definition or must-remember point
:::

:::tip
Helpful trick, shortcut or memory aid
:::

:::warning
Common mistake or confusion to avoid
:::

:::example
A short worked example
:::

- Add at least one diagram when the topic has a process, flow, hierarchy, cycle or relationship. Use Mermaid inside a fenced block:

\`\`\`mermaid
flowchart LR
  A[Start] --> B[Next step]
\`\`\`

- Mermaid rules: use only flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, mindmap or pie. Keep node labels short and put labels containing special characters in double quotes. Do not use colors/styles inside Mermaid.
- End with a "## Quick Revision" section of 4-6 bullet points.
- Write in the same language as the user's input unless asked otherwise.
- Do not invent facts. If source material is provided, base the notes only on it.`;

// Synthesis depth: quick | comprehensive | cram
const DEPTHS = ['quick', 'comprehensive', 'cram'];
const DEFAULT_DEPTH = 'comprehensive';

const normalizeDepth = (value) => (DEPTHS.includes(value) ? value : DEFAULT_DEPTH);

const DEPTH_INSTRUCTIONS = {
  quick:
    'DEPTH: Quick Summary. Keep it short (about 250 words): a brief overview, the 3-5 most important points, at most 1 callout and a diagram only if it is essential. The final "Quick Revision" section should have 3 bullets.',
  comprehensive:
    'DEPTH: Comprehensive Study Sheet. Cover the topic thoroughly with clear sections, tables where useful, several callouts and at least one diagram.',
  cram:
    'DEPTH: Exam Cram Sheet. Make it dense and exam-focused: definitions, formulas, mnemonics, common mistakes and likely exam questions. Use many callouts (especially tip and warning), compact tables and a last-minute checklist in "Quick Revision".',
};

const withDepth = (prompt, depth) => `${prompt}\n\n${DEPTH_INSTRUCTIONS[normalizeDepth(depth)]}`;

const buildTopicPrompt = (topic, depth) =>
  withDepth(`Create detailed, easy-to-revise notes on this topic:\n\n${topic}`, depth);

const buildUrlPrompt = (url, text, depth) =>
  withDepth(
    `Create detailed, easy-to-revise notes from the following web page content.\nSource: ${url}\n\n--- PAGE CONTENT START ---\n${text}\n--- PAGE CONTENT END ---`,
    depth
  );

const buildImagePrompt = (depth) =>
  withDepth(
    'The attached image is a photo/screenshot of a page (textbook, handwritten notes, slide, etc.). Read all the content carefully and create detailed, easy-to-revise notes from it.',
    depth
  );

module.exports = {
  SYSTEM_PROMPT,
  normalizeDepth,
  buildTopicPrompt,
  buildUrlPrompt,
  buildImagePrompt,
};