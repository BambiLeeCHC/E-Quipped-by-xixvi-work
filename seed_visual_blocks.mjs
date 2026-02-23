/**
 * seed_visual_blocks.mjs
 * Adds step_flow, flashcard_grid, stat_grid, and concept_diagram blocks
 * to existing lessons. Safe to re-run (deletes old visual blocks first).
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const conn = await mysql.createConnection(DB_URL);

// ── Fetch lesson map ──────────────────────────────────────────────────────────
const [lessonRows] = await conn.execute(
  `SELECT l.id, l.title, m.\`order\` as moduleOrder, l.\`order\` as lessonOrder
   FROM lessons l JOIN modules m ON l.moduleId = m.id
   ORDER BY m.\`order\`, l.\`order\``
);

const lessonMap = {};
for (const r of lessonRows) {
  if (!lessonMap[r.moduleOrder]) lessonMap[r.moduleOrder] = {};
  lessonMap[r.moduleOrder][r.lessonOrder] = r.id;
}

function lid(mod, lesson) {
  const id = lessonMap[mod]?.[lesson];
  if (!id) throw new Error(`No lesson found for module ${mod} lesson ${lesson}`);
  return id;
}

// ── Remove previously seeded visual blocks so we can re-seed cleanly ─────────
const VISUAL_TYPES = ["step_flow", "flashcard_grid", "stat_grid", "concept_diagram", "quote"];
await conn.execute(
  `DELETE FROM content_blocks WHERE type IN (${VISUAL_TYPES.map(() => "?").join(",")})`,
  VISUAL_TYPES
);
console.log("Cleared old visual blocks.");

// ── Helper ────────────────────────────────────────────────────────────────────
const newBlocks = [];

function addVisualBlocks(lessonId, blocks) {
  blocks.forEach((b) => newBlocks.push({ lessonId, ...b }));
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 1, LESSON 1 — Introduction to AI Writing
// ══════════════════════════════════════════════════════════════════════════════
addVisualBlocks(lid(1, 1), [
  // Stat grid — inserted at order 3 (after the first text block)
  {
    type: "stat_grid",
    order: 3,
    content: JSON.stringify({
      title: "The AI Writing Opportunity",
      stats: [
        { value: "28%", label: "of workweek spent writing", color: "oklch(0.72 0.22 330)" },
        { value: "10×", label: "faster first drafts with AI", color: "oklch(0.82 0.18 155)" },
        { value: "73%", label: "of professionals use AI tools", color: "oklch(0.78 0.18 230)" },
        { value: "40%", label: "reduction in revision cycles", color: "oklch(0.82 0.18 80)" },
      ],
    }),
  },
  // Concept diagram — the CRATE framework, inserted at order 7
  {
    type: "concept_diagram",
    order: 7,
    content: JSON.stringify({
      title: "The CRATE Framework",
      center: "CRATE Prompt",
      nodes: [
        "C — Context",
        "R — Role",
        "A — Audience",
        "T — Tone",
        "E — Expectation",
      ],
    }),
  },
  // Flashcard grid — key terms, inserted at order 9
  {
    type: "flashcard_grid",
    order: 9,
    content: JSON.stringify({
      title: "Key Terms — Click to Flip",
      cards: [
        { term: "Prompt", definition: "The instruction or input you give to an AI model. The quality of your prompt directly determines the quality of the output." },
        { term: "Context", definition: "Background information that helps the AI understand the situation — who you are, what the document is for, and any constraints." },
        { term: "Role Assignment", definition: "Telling the AI to adopt a specific persona (e.g., 'You are a senior business analyst') to improve output quality." },
        { term: "Tone", definition: "The emotional register and style of writing — formal, casual, persuasive, empathetic, etc." },
      ],
    }),
  },
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 1, LESSON 2 — Writing Long-Form Business Documents
// ══════════════════════════════════════════════════════════════════════════════
addVisualBlocks(lid(1, 2), [
  // Step flow — the chunking strategy
  {
    type: "step_flow",
    order: 4,
    content: JSON.stringify({
      title: "The Chunking Strategy — Step by Step",
      steps: [
        { title: "Outline First", body: "Ask AI to generate a document outline based on your brief. Review and adjust before writing any sections." },
        { title: "Section by Section", body: "Prompt AI to write each section individually, providing the full outline as context for each call." },
        { title: "Stitch & Refine", body: "Combine sections, then prompt AI to improve transitions, consistency, and flow across the whole document." },
        { title: "Final Polish", body: "Ask AI to review the complete document for tone, clarity, and professional presentation." },
        { title: "Human Review", body: "Always read the final output yourself. Replace all placeholders with real data before sending to clients." },
      ],
    }),
  },
  // Flashcard grid — document types
  {
    type: "flashcard_grid",
    order: 6,
    content: JSON.stringify({
      title: "Business Document Types",
      cards: [
        { term: "Executive Summary", definition: "A concise overview of a longer document, written for senior decision-makers. Typically 150–300 words. The most-read section of any proposal." },
        { term: "Business Proposal", definition: "A structured document that presents a solution to a client's problem, including methodology, timeline, and budget." },
        { term: "White Paper", definition: "An authoritative, in-depth report on a specific topic, used to educate readers and support decision-making." },
        { term: "Project Brief", definition: "A short document that defines the scope, objectives, deliverables, and timeline of a project." },
      ],
    }),
  },
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 2, LESSON 1 — Introduction to AI Data Analysis (if it exists)
// ══════════════════════════════════════════════════════════════════════════════
if (lessonMap[2]?.[1]) {
  addVisualBlocks(lid(2, 1), [
    {
      type: "stat_grid",
      order: 3,
      content: JSON.stringify({
        title: "Data Analysis with AI — The Numbers",
        stats: [
          { value: "5×", label: "faster insight generation", color: "oklch(0.78 0.18 230)" },
          { value: "90%", label: "of analysts use AI tools", color: "oklch(0.72 0.22 330)" },
          { value: "60%", label: "fewer manual errors", color: "oklch(0.82 0.18 155)" },
          { value: "3 hrs", label: "saved per analysis session", color: "oklch(0.82 0.18 80)" },
        ],
      }),
    },
    {
      type: "step_flow",
      order: 5,
      content: JSON.stringify({
        title: "AI-Assisted Analysis Workflow",
        steps: [
          { title: "Define the Question", body: "Clearly state what business question you need to answer before touching any data." },
          { title: "Prepare the Data", body: "Ask AI to help clean, normalise, and structure your dataset for analysis." },
          { title: "Explore Patterns", body: "Use AI to identify trends, outliers, and correlations you might have missed manually." },
          { title: "Interpret Results", body: "Prompt AI to explain findings in plain language suitable for your audience." },
          { title: "Visualise & Present", body: "Ask AI to suggest the best chart types and draft the narrative for your presentation." },
        ],
      }),
    },
    {
      type: "flashcard_grid",
      order: 7,
      content: JSON.stringify({
        title: "Data Analysis Key Concepts",
        cards: [
          { term: "Descriptive Analytics", definition: "Summarises what happened in the past using historical data — averages, totals, trends." },
          { term: "Predictive Analytics", definition: "Uses statistical models and AI to forecast what is likely to happen in the future." },
          { term: "Prescriptive Analytics", definition: "Recommends actions to take based on predictive models — the most advanced form of analytics." },
          { term: "Data Cleaning", definition: "The process of identifying and correcting errors, inconsistencies, and missing values in a dataset." },
        ],
      }),
    },
  ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 3, LESSON 1 — Introduction to AI Strategy (if it exists)
// ══════════════════════════════════════════════════════════════════════════════
if (lessonMap[3]?.[1]) {
  addVisualBlocks(lid(3, 1), [
    {
      type: "concept_diagram",
      order: 4,
      content: JSON.stringify({
        title: "AI Strategy Framework",
        center: "AI Strategy",
        nodes: [
          "Use Case Identification",
          "Data Readiness",
          "Tool Selection",
          "Change Management",
          "ROI Measurement",
          "Governance & Ethics",
        ],
      }),
    },
    {
      type: "quote",
      order: 6,
      content: JSON.stringify({
        text: "The companies that will win with AI are not those that adopt it first, but those that integrate it most thoughtfully into their core business processes.",
        author: "McKinsey Global Institute, 2024",
      }),
    },
  ]);
}

// ── Insert all new blocks ─────────────────────────────────────────────────────
if (newBlocks.length > 0) {
  const placeholders = newBlocks.map(() => "(?, ?, ?, ?)").join(", ");
  const values = newBlocks.flatMap((b) => [b.lessonId, b.type, b.order, b.content]);
  await conn.execute(
    `INSERT INTO content_blocks (lessonId, type, \`order\`, content) VALUES ${placeholders}`,
    values
  );
  console.log(`Inserted ${newBlocks.length} visual blocks.`);
} else {
  console.log("No blocks to insert.");
}

await conn.end();
console.log("Done.");
