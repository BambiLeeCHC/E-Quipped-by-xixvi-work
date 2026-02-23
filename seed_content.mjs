import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DB_URL);

// ─── Fetch existing lessons ────────────────────────────────────────────────
const [lessonRows] = await conn.execute(
  `SELECT l.id, l.title, l.moduleId, l.\`order\` as lessonOrder, m.title as moduleName, m.\`order\` as moduleOrder
   FROM lessons l JOIN modules m ON l.moduleId = m.id
   ORDER BY m.\`order\`, l.\`order\``
);

console.log("Found lessons:", lessonRows.length);
lessonRows.forEach(r => console.log(`  [${r.id}] M${r.moduleOrder}L${r.lessonOrder} ${r.moduleName} > ${r.title}`));

// ─── Build lesson map: moduleOrder -> lessonOrder -> id ───────────────────
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

// ─── Content blocks helper ────────────────────────────────────────────────
const contentBlocks = [];
const quizQuestions = [];

function addBlocks(lessonId, blocks) {
  blocks.forEach((b, i) => {
    contentBlocks.push({ lessonId, order: i + 1, type: b.type, content: b.content });
  });
}

function addQuiz(lessonId, questions) {
  questions.forEach((q, i) => {
    quizQuestions.push({
      lessonId,
      order: i + 1,
      question: q.question,
      options: JSON.stringify(q.options),
      correctIndex: q.correctIndex,
      explanation: q.explanation || ""
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 1: AI Writing Assistant for Business
// ══════════════════════════════════════════════════════════════════════════════

// M1 L1 — Introduction to AI Writing (FREE / unlocked for all)
addBlocks(lid(1,1), [
  { type: "text", content: { html: `<h2>Welcome to AI Writing for Business</h2><p>Artificial intelligence has fundamentally changed how professionals create written content. Whether you're drafting emails, writing reports, or crafting proposals, AI writing tools can dramatically reduce the time you spend on routine writing tasks while improving quality and consistency.</p><p>In this module, you'll learn how to harness AI as a writing partner — not a replacement — to produce better business documents faster than ever before.</p>` } },
  { type: "callout", content: { variant: "info", title: "What You'll Learn", body: "By the end of this module, you'll be able to use AI to draft, refine, and polish any business document in a fraction of the time it would take manually." } },
  { type: "text", content: { html: `<h3>Why AI Writing Matters in Business</h3><p>Studies show that knowledge workers spend an average of <strong>28% of their workweek</strong> writing emails, reports, and other documents. AI writing tools can reclaim much of that time, letting you focus on higher-value strategic work.</p><ul><li><strong>Speed:</strong> Draft a 500-word report in under 2 minutes</li><li><strong>Consistency:</strong> Maintain brand voice across all communications</li><li><strong>Quality:</strong> Reduce grammatical errors and improve clarity</li><li><strong>Confidence:</strong> Write in any style or tone on demand</li></ul>` } },
  { type: "text", content: { html: `<h3>The Prompt Engineering Foundation</h3><p>The key to effective AI writing is learning how to communicate with AI models through <strong>prompts</strong>. A prompt is the instruction you give to an AI — and the quality of your output depends almost entirely on the quality of your input.</p><p>Think of it like briefing a talented writer who knows nothing about your business. The more context, tone guidance, and specific requirements you provide, the better the result.</p><h4>The CRATE Framework for Writing Prompts</h4><ul><li><strong>C</strong>ontext — Who are you? What's the situation?</li><li><strong>R</strong>ole — What role should the AI play?</li><li><strong>A</strong>udience — Who will read this?</li><li><strong>T</strong>one — Formal, casual, persuasive, informative?</li><li><strong>E</strong>xpectation — What format and length do you need?</li></ul>` } },
  { type: "callout", content: { variant: "tip", title: "Pro Tip", body: "Always start with a role assignment. 'You are a senior business analyst writing for C-suite executives' produces dramatically better output than a bare instruction." } },
  { type: "text", content: { html: `<h3>Applied Learning: Your First Business Prompt</h3><p>Now it's your turn. Use the AI Sandbox below to practice writing your first business-focused prompt using the CRATE framework. Start with a simple task: ask the AI to write a short professional introduction email.</p>` } },
  { type: "prompt_exercise", content: { title: "Practice: Write a Professional Introduction Email", systemPrompt: "You are a professional business writing coach. Help the user craft effective business communications.", starterPrompt: "Using the CRATE framework, write a prompt that asks the AI to draft a professional introduction email from a new account manager to a client they've just been assigned.", hint: "Remember: Context (who you are, the situation), Role (what role should the AI play), Audience (who reads the email), Tone (professional but warm), Expectation (length, format)." } },
  { type: "text", content: { html: `<h3>Key Takeaways</h3><ul><li>AI writing tools can save knowledge workers hours every week</li><li>The quality of AI output depends on the quality of your prompt</li><li>The CRATE framework (Context, Role, Audience, Tone, Expectation) is your foundation</li><li>AI is a writing partner, not a replacement — always review and personalise output</li></ul>` } }
]);

addQuiz(lid(1,1), [
  { question: "What does the 'R' in the CRATE framework stand for?", options: ["Result", "Role", "Request", "Revision"], correctIndex: 1, explanation: "Role tells the AI what persona or expertise to adopt, which dramatically improves output quality." },
  { question: "According to the lesson, what percentage of a knowledge worker's week is spent on writing tasks?", options: ["15%", "22%", "28%", "35%"], correctIndex: 2, explanation: "Studies show knowledge workers spend approximately 28% of their workweek on writing-related tasks." },
  { question: "Which of the following is the BEST approach when using AI for business writing?", options: ["Copy AI output directly without review", "Use AI as a writing partner and always review output", "Only use AI for informal communications", "Avoid giving the AI any context to keep prompts short"], correctIndex: 1, explanation: "AI is most effective as a collaborative partner. Always review and personalise output to ensure accuracy and brand alignment." },
  { question: "What is a 'prompt' in the context of AI writing tools?", options: ["A grammar correction suggestion", "The instruction you give to an AI model", "An AI-generated template", "A formatting style guide"], correctIndex: 1, explanation: "A prompt is the instruction or input you provide to an AI model — the quality of your prompt directly determines the quality of the output." }
]);

// M1 L2 — Writing Long-Form Business Documents
addBlocks(lid(1,2), [
  { type: "text", content: { html: `<h2>Writing Long-Form Business Documents with AI</h2><p>Long-form documents — business proposals, strategic reports, white papers, and executive summaries — are among the most time-consuming writing tasks in any organisation. AI can transform this process from days to hours.</p>` } },
  { type: "callout", content: { variant: "info", title: "Documents Covered in This Lesson", body: "Business proposals, executive summaries, strategic reports, white papers, and project briefs." } },
  { type: "text", content: { html: `<h3>The Chunking Strategy</h3><p>The most effective approach to long documents is <strong>chunking</strong> — breaking the document into logical sections and prompting the AI for each section separately. This gives you:</p><ul><li>Better control over each section's content and tone</li><li>The ability to refine individual sections without regenerating the whole document</li><li>More consistent quality throughout</li></ul><h4>Step-by-Step Process</h4><ol><li><strong>Outline first:</strong> Ask AI to generate a document outline based on your brief</li><li><strong>Review and adjust:</strong> Edit the outline to match your needs</li><li><strong>Section by section:</strong> Prompt AI to write each section with the full outline as context</li><li><strong>Stitch and refine:</strong> Combine sections, then prompt AI to improve transitions and consistency</li><li><strong>Final polish:</strong> Ask AI to review the complete document for tone, clarity, and flow</li></ol>` } },
  { type: "text", content: { html: `<h3>Writing a Business Proposal</h3><p>A business proposal typically includes: Executive Summary, Problem Statement, Proposed Solution, Methodology, Timeline, Budget, and Team Credentials. Here's how to prompt each section effectively:</p><h4>Executive Summary Prompt Template</h4><pre><code>You are a senior business consultant. Write a compelling executive summary for a business proposal with the following details:
- Client: [Company Name]
- Problem: [Brief problem description]  
- Solution: [Your proposed solution]
- Key benefit: [Primary value proposition]
- Budget range: [Approximate range]

The executive summary should be 150-200 words, written in a confident and professional tone, suitable for C-suite readers.</code></pre>` } },
  { type: "callout", content: { variant: "warning", title: "Important", body: "Always replace placeholder information with real data before sending any AI-generated document to clients or stakeholders." } },
  { type: "prompt_exercise", content: { title: "Practice: Generate a Document Outline", systemPrompt: "You are an expert business writer specialising in professional proposals and reports.", starterPrompt: "Ask the AI to create a detailed outline for a business proposal. Include: the client is a mid-sized retail company, the problem is inefficient inventory management, and your solution is an AI-powered inventory system.", hint: "Use the chunking strategy — get the outline first, then you can prompt for each section individually." } },
  { type: "text", content: { html: `<h3>Executive Summary Best Practices</h3><p>The executive summary is the most read section of any business document. When prompting AI for an executive summary:</p><ul><li>Provide the full document context even if it's long</li><li>Specify the reader's level (C-suite, technical, operational)</li><li>Request a specific word count</li><li>Ask for the key decision the reader needs to make</li></ul>` } }
]);

addQuiz(lid(1,2), [
  { question: "What is the 'chunking strategy' for long documents?", options: ["Writing the entire document in one prompt", "Breaking the document into sections and prompting AI for each separately", "Using multiple AI tools simultaneously", "Copying existing documents and asking AI to reformat them"], correctIndex: 1, explanation: "Chunking means breaking a long document into logical sections and prompting the AI for each section individually, giving you better control and quality." },
  { question: "What should you do FIRST when creating a long business document with AI?", options: ["Write the conclusion first", "Ask AI to generate a document outline", "Write the executive summary", "Provide the full document in one prompt"], correctIndex: 1, explanation: "Always start with an outline. This gives you a roadmap, lets you adjust structure before investing time in content, and provides context for each subsequent section prompt." },
  { question: "Which section of a business proposal is typically most read by decision-makers?", options: ["Budget section", "Methodology section", "Executive summary", "Team credentials"], correctIndex: 2, explanation: "The executive summary is the most read section — many decision-makers read only this section before deciding whether to continue." },
  { question: "After generating all sections of a long document with AI, what is the recommended final step?", options: ["Submit it immediately", "Ask AI to review the complete document for tone, clarity, and flow", "Delete all AI-generated content and rewrite manually", "Only check the first and last paragraphs"], correctIndex: 1, explanation: "After stitching sections together, ask AI to review the complete document for consistency in tone, smooth transitions, and overall flow." }
]);

// M1 L3 — Refinement & Editing with AI
addBlocks(lid(1,3), [
  { type: "text", content: { html: `<h2>AI-Powered Editing and Refinement</h2><p>One of the most powerful uses of AI in business writing is not generating content from scratch, but <strong>improving content you've already written</strong>. AI can act as an expert editor, proofreader, tone consultant, and clarity coach — all in seconds.</p>` } },
  { type: "text", content: { html: `<h3>The Six Editing Modes</h3><p>When asking AI to edit your writing, specify which editing mode you need:</p><ol><li><strong>Clarity Edit:</strong> "Make this clearer and easier to understand for a non-technical reader"</li><li><strong>Tone Edit:</strong> "Adjust the tone to be more formal/casual/persuasive"</li><li><strong>Conciseness Edit:</strong> "Cut this by 30% without losing key information"</li><li><strong>Grammar & Style:</strong> "Fix grammar, punctuation, and improve sentence variety"</li><li><strong>Audience Alignment:</strong> "Rewrite this for a C-suite audience vs. a technical team"</li><li><strong>Brand Voice:</strong> "Rewrite to match our brand voice: [describe your brand voice]"</li></ol>` } },
  { type: "callout", content: { variant: "tip", title: "Power Move", body: "Combine editing modes: 'Make this 20% shorter, more formal, and ensure it's appropriate for a board presentation.' AI handles multiple instructions simultaneously." } },
  { type: "text", content: { html: `<h3>The Feedback Loop Technique</h3><p>Instead of accepting the first AI edit, use a feedback loop:</p><ol><li>Submit your original text for editing</li><li>Review the AI's output</li><li>Ask follow-up questions: "Why did you change X?" or "Make section 2 more specific"</li><li>Request variations: "Give me 3 alternative versions of the opening paragraph"</li><li>Combine the best elements from different versions</li></ol>` } },
  { type: "prompt_exercise", content: { title: "Practice: Edit for Clarity and Tone", systemPrompt: "You are a professional business editor with 20 years of experience editing corporate communications.", starterPrompt: "Paste a paragraph from a business email or report you've written recently (or make one up), then ask the AI to edit it for clarity and a more confident, professional tone.", hint: "Try the feedback loop: after the first edit, ask 'Can you make the opening sentence more impactful?' and see how the output changes." } },
  { type: "text", content: { html: `<h3>Detecting and Fixing Common Business Writing Problems</h3><p>Ask AI to specifically identify and fix these common issues:</p><ul><li><strong>Passive voice overuse:</strong> "Identify all passive voice constructions and rewrite in active voice"</li><li><strong>Jargon:</strong> "Flag any jargon or acronyms that a new employee might not understand"</li><li><strong>Buried lead:</strong> "Is the most important information in the first paragraph? If not, restructure it"</li><li><strong>Weak verbs:</strong> "Replace weak verbs (is, are, was) with stronger action verbs"</li></ul>` } }
]);

addQuiz(lid(1,3), [
  { question: "Which editing mode would you use to reduce a 500-word report to 350 words?", options: ["Clarity Edit", "Tone Edit", "Conciseness Edit", "Grammar & Style"], correctIndex: 2, explanation: "Conciseness Edit focuses on reducing length while preserving key information — perfect for hitting word count targets." },
  { question: "What is the 'Feedback Loop Technique' in AI editing?", options: ["Submitting the same text to multiple AI tools", "Reviewing AI output and asking follow-up questions to refine the result", "Having a human editor review AI output", "Running a spell-check after AI editing"], correctIndex: 1, explanation: "The feedback loop involves reviewing AI output, asking follow-up questions, requesting variations, and combining the best elements — producing much better results than accepting the first output." },
  { question: "Which of the following is NOT one of the six editing modes described in this lesson?", options: ["Clarity Edit", "Translation Edit", "Tone Edit", "Conciseness Edit"], correctIndex: 1, explanation: "Translation Edit is not one of the six modes. The six modes are: Clarity, Tone, Conciseness, Grammar & Style, Audience Alignment, and Brand Voice." },
  { question: "What prompt would you use to fix passive voice in a document?", options: ["'Make this document shorter'", "'Identify all passive voice constructions and rewrite in active voice'", "'Check for spelling errors'", "'Rewrite for a younger audience'"], correctIndex: 1, explanation: "Being specific about the exact issue (passive voice) and the desired action (rewrite in active voice) gives AI clear, actionable instructions." }
]);

// M1 L4 — Multi-Modal Documents
addBlocks(lid(1,4), [
  { type: "text", content: { html: `<h2>Multi-Modal Business Documents</h2><p>Modern business communication goes beyond plain text. <strong>Multi-modal documents</strong> combine text, data, visuals, and structured formats to communicate complex information more effectively. AI can help you create and integrate all of these elements.</p>` } },
  { type: "text", content: { html: `<h3>Types of Multi-Modal Business Content</h3><ul><li><strong>Data-driven reports:</strong> Combining narrative with tables, charts, and data callouts</li><li><strong>Visual summaries:</strong> Infographic-style layouts with key statistics highlighted</li><li><strong>Structured frameworks:</strong> SWOT analyses, comparison matrices, decision trees</li><li><strong>Annotated documents:</strong> Reports with explanatory sidebars and callout boxes</li></ul>` } },
  { type: "text", content: { html: `<h3>Prompting for Structured Data Formats</h3><p>AI excels at generating structured content. Use these prompt patterns:</p><h4>Comparison Matrix</h4><pre><code>Create a comparison matrix in markdown table format comparing [Option A], [Option B], and [Option C] across these criteria: Cost, Implementation Time, Risk Level, Expected ROI, and Scalability. Use a 1-5 rating scale with brief justifications.</code></pre><h4>SWOT Analysis</h4><pre><code>Conduct a SWOT analysis for [Company/Project/Decision]. Format as a 2x2 grid with bullet points. Be specific and evidence-based. Focus on [industry/context].</code></pre>` } },
  { type: "callout", content: { variant: "info", title: "Markdown Tip", body: "Ask AI to format output in Markdown — it renders beautifully in most modern business tools including Notion, Confluence, GitHub, and many email clients." } },
  { type: "prompt_exercise", content: { title: "Practice: Create a Structured Business Framework", systemPrompt: "You are a management consultant who specialises in creating clear, structured business frameworks and analyses.", starterPrompt: "Ask the AI to create a SWOT analysis for a fictional company launching an AI-powered HR tool. Request it in a clear structured format with 3-4 bullet points per quadrant.", hint: "After getting the SWOT, try asking: 'Based on this SWOT, what are the top 3 strategic priorities?' to see how AI can build on structured analysis." } },
  { type: "text", content: { html: `<h3>Combining AI Writing with Visual Tools</h3><p>AI-generated text can be directly imported into visual tools:</p><ul><li><strong>Canva:</strong> Use AI text as copy for infographics and presentations</li><li><strong>PowerPoint/Google Slides:</strong> AI-generated bullet points and speaker notes</li><li><strong>Notion/Confluence:</strong> AI-drafted pages with structured formatting</li><li><strong>Excel/Google Sheets:</strong> AI-generated data labels, summaries, and annotations</li></ul>` } }
]);

addQuiz(lid(1,4), [
  { question: "What is a 'multi-modal document' in the context of business writing?", options: ["A document written by multiple authors", "A document combining text, data, visuals, and structured formats", "A document available in multiple languages", "A document with multiple versions"], correctIndex: 1, explanation: "Multi-modal documents combine different content types — text, data, visuals, and structured formats — to communicate complex information more effectively." },
  { question: "Which prompt pattern would you use to compare three software options across five criteria?", options: ["SWOT Analysis prompt", "Comparison Matrix prompt", "Executive Summary prompt", "Conciseness Edit prompt"], correctIndex: 1, explanation: "A Comparison Matrix prompt is designed to evaluate multiple options across defined criteria, producing a structured table format ideal for decision-making." },
  { question: "What format should you request when you want AI output that renders well in Notion, Confluence, or GitHub?", options: ["HTML", "PDF", "Markdown", "Plain text"], correctIndex: 2, explanation: "Markdown renders beautifully in most modern business tools and is the recommended format for structured AI-generated content." },
  { question: "After generating a SWOT analysis with AI, what is a powerful follow-up prompt?", options: ["'Translate this to Spanish'", "'Make this shorter'", "'Based on this SWOT, what are the top 3 strategic priorities?'", "'Check this for grammar errors'"], correctIndex: 2, explanation: "Building on structured analysis by asking for strategic implications is a powerful way to extract maximum value from AI-generated frameworks." }
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 2: AI for Meetings & Communication
// ══════════════════════════════════════════════════════════════════════════════

// M2 L1 — Meeting Preparation with AI
addBlocks(lid(2,1), [
  { type: "text", content: { html: `<h2>AI-Powered Meeting Preparation</h2><p>Meetings consume an enormous amount of professional time — yet most professionals spend little time preparing for them. AI can transform your meeting preparation from a rushed 5-minute scan to a comprehensive briefing in under 10 minutes.</p>` } },
  { type: "callout", content: { variant: "info", title: "Time Savings", body: "Professionals who use AI for meeting prep report saving 45-90 minutes per week and arriving at meetings significantly more confident and prepared." } },
  { type: "text", content: { html: `<h3>The Pre-Meeting AI Workflow</h3><ol><li><strong>Agenda Analysis:</strong> Paste the meeting agenda and ask AI to identify key decisions, potential conflicts, and questions you should prepare</li><li><strong>Stakeholder Briefing:</strong> Ask AI to summarise what you know about each attendee's priorities and likely positions</li><li><strong>Data Preparation:</strong> Ask AI to help you identify what data or evidence would strengthen your position</li><li><strong>Question Generation:</strong> Ask AI to generate the 5 most important questions you should ask</li><li><strong>Objection Preparation:</strong> Ask AI to anticipate objections to your proposals and help you prepare responses</li></ol>` } },
  { type: "text", content: { html: `<h3>Agenda Creation with AI</h3><p>Use AI to create structured, time-boxed agendas that keep meetings on track:</p><pre><code>Create a 60-minute meeting agenda for a quarterly business review with these attendees: [list roles]. 
The meeting goals are: [list goals].
Key topics to cover: [list topics].
Format with time allocations, owner for each item, and desired outcome per agenda item.</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Prepare for a Difficult Meeting", systemPrompt: "You are an expert meeting facilitator and executive coach who helps professionals prepare for high-stakes meetings.", starterPrompt: "Describe a meeting you have coming up (or make one up — e.g., a budget review with your CFO), then ask the AI to help you prepare: identify key questions to ask, potential objections to your proposals, and data you should have ready.", hint: "The more context you give about the meeting purpose, attendees, and your goals, the more useful the preparation will be." } },
  { type: "text", content: { html: `<h3>Pre-Read Summaries</h3><p>Before any meeting with pre-read materials, use AI to create a concise briefing:</p><ul><li>Paste the pre-read document and ask for a 5-bullet summary of key points</li><li>Ask "What decisions will likely be made based on this document?"</li><li>Ask "What questions should I ask to demonstrate I've read this thoroughly?"</li></ul>` } }
]);

addQuiz(lid(2,1), [
  { question: "What is the first step in the Pre-Meeting AI Workflow?", options: ["Stakeholder Briefing", "Agenda Analysis", "Data Preparation", "Question Generation"], correctIndex: 1, explanation: "Agenda Analysis comes first — understanding what decisions need to be made and what potential conflicts exist sets the foundation for all other preparation." },
  { question: "What should you include when asking AI to create a meeting agenda?", options: ["Only the meeting title", "Attendees, goals, topics, time allocations, and desired outcomes", "Just the list of topics", "The meeting room location and catering requirements"], correctIndex: 1, explanation: "A well-structured agenda prompt includes attendees (and their roles), meeting goals, topics to cover, and requests for time allocations and desired outcomes per item." },
  { question: "How can AI help with 'Objection Preparation' before a meeting?", options: ["By writing the meeting minutes in advance", "By anticipating objections to your proposals and helping you prepare responses", "By cancelling the meeting if it's unnecessary", "By automatically sending the agenda to attendees"], correctIndex: 1, explanation: "AI can role-play as a skeptical stakeholder, anticipate likely objections to your proposals, and help you craft thoughtful, evidence-based responses." },
  { question: "What is the recommended approach for handling pre-read materials before a meeting?", options: ["Skip them if you're busy", "Ask AI to summarise key points, identify likely decisions, and generate questions that show you've read the material", "Read them once quickly", "Only read the executive summary"], correctIndex: 1, explanation: "Using AI to create a structured briefing from pre-read materials ensures you arrive informed, with prepared questions that demonstrate engagement." }
]);

// M2 L2 — Meeting Transcription & Summarisation
addBlocks(lid(2,2), [
  { type: "text", content: { html: `<h2>AI Meeting Transcription and Summarisation</h2><p>One of the most immediately valuable AI business skills is converting meeting recordings and transcripts into actionable summaries, decision logs, and follow-up task lists. This lesson teaches you to extract maximum value from every meeting.</p>` } },
  { type: "text", content: { html: `<h3>The Meeting Intelligence Stack</h3><p>A complete AI meeting workflow has four layers:</p><ol><li><strong>Transcription:</strong> Convert audio/video to text (tools: Otter.ai, Fireflies, Microsoft Copilot, Zoom AI)</li><li><strong>Summarisation:</strong> Extract key points, decisions, and context from the transcript</li><li><strong>Action Extraction:</strong> Identify all action items with owners and deadlines</li><li><strong>Distribution:</strong> Format and send meeting notes to all stakeholders</li></ol>` } },
  { type: "text", content: { html: `<h3>The Master Meeting Summary Prompt</h3><p>Once you have a transcript, use this comprehensive prompt:</p><pre><code>You are a professional meeting facilitator. Analyse this meeting transcript and produce:

1. EXECUTIVE SUMMARY (3-4 sentences capturing the meeting's purpose and outcome)
2. KEY DECISIONS MADE (bullet list with decision owner)
3. ACTION ITEMS (table format: Task | Owner | Deadline | Priority)
4. OPEN QUESTIONS (items that need follow-up but weren't resolved)
5. KEY INSIGHTS (any important information shared that stakeholders should know)

Transcript: [paste transcript here]</code></pre>` } },
  { type: "callout", content: { variant: "tip", title: "Tone Matching", body: "Add 'Match the professional tone of the organisation — formal but approachable' to your summary prompt to ensure the output fits your company culture." } },
  { type: "prompt_exercise", content: { title: "Practice: Summarise a Meeting", systemPrompt: "You are a professional meeting facilitator and executive assistant who specialises in extracting actionable insights from business meetings.", starterPrompt: "Write a brief fictional meeting transcript (5-8 exchanges) about a product launch decision, then ask the AI to produce a full meeting summary with decisions, action items, and open questions.", hint: "Try the Master Meeting Summary Prompt structure — it produces a complete, shareable meeting record in one pass." } },
  { type: "text", content: { html: `<h3>Follow-Up Email Generation</h3><p>After extracting meeting notes, generate follow-up communications:</p><pre><code>Based on these meeting notes: [paste notes]

Write a follow-up email to all attendees that:
- Thanks them for their time
- Confirms the key decisions made
- Lists all action items with owners and deadlines  
- Specifies the next meeting date/purpose
- Maintains a professional but warm tone</code></pre>` } }
]);

addQuiz(lid(2,2), [
  { question: "What are the four layers of the Meeting Intelligence Stack?", options: ["Record, Edit, Share, Archive", "Transcription, Summarisation, Action Extraction, Distribution", "Prepare, Attend, Note, Follow-up", "Audio, Video, Text, Email"], correctIndex: 1, explanation: "The Meeting Intelligence Stack: Transcription (audio to text), Summarisation (extract key points), Action Extraction (identify tasks/owners), Distribution (format and send notes)." },
  { question: "In the Master Meeting Summary Prompt, what format is recommended for Action Items?", options: ["Numbered list", "Paragraph format", "Table format: Task | Owner | Deadline | Priority", "Bullet points only"], correctIndex: 2, explanation: "Table format for action items makes them scannable, assignable, and easy to track — critical for accountability after meetings." },
  { question: "What should you add to a meeting summary prompt to ensure the output matches your company culture?", options: ["The meeting room number", "A tone instruction like 'formal but approachable'", "The names of all attendees", "The meeting duration"], correctIndex: 1, explanation: "Adding a tone instruction ensures AI output matches your organisation's communication style, making it immediately usable without heavy editing." },
  { question: "Which AI tools are mentioned as options for meeting transcription?", options: ["ChatGPT and Claude", "Otter.ai, Fireflies, Microsoft Copilot, Zoom AI", "Google Docs and Microsoft Word", "Slack and Teams"], correctIndex: 1, explanation: "Otter.ai, Fireflies, Microsoft Copilot, and Zoom AI are all purpose-built meeting transcription tools that integrate with common video conferencing platforms." }
]);

// M2 L3 — Professional Email Communication
addBlocks(lid(2,3), [
  { type: "text", content: { html: `<h2>AI-Powered Professional Email Communication</h2><p>Email remains the primary communication channel in most businesses, yet it's also one of the biggest time sinks. AI can help you write better emails faster, handle difficult communications with confidence, and maintain consistent professionalism across all correspondence.</p>` } },
  { type: "text", content: { html: `<h3>Email Categories and AI Approaches</h3><p>Different email types require different AI approaches:</p><ul><li><strong>Routine emails:</strong> Templates + personalisation prompts</li><li><strong>Difficult conversations:</strong> Tone calibration + empathy prompts</li><li><strong>Sales/persuasion emails:</strong> Benefit-focused + call-to-action prompts</li><li><strong>Executive communications:</strong> Brevity + impact prompts</li><li><strong>Client escalations:</strong> De-escalation + solution-focused prompts</li></ul>` } },
  { type: "text", content: { html: `<h3>The Difficult Email Framework</h3><p>When you need to deliver bad news, push back on a request, or address a conflict, use this prompt structure:</p><pre><code>Write a professional email that:
- Delivers this message: [the difficult message]
- To: [recipient role/relationship]
- Maintains a respectful, empathetic tone
- Acknowledges their perspective
- Clearly states the situation without blame
- Offers a constructive path forward
- Ends on a positive, collaborative note
Keep it under 200 words.</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Write a Difficult Professional Email", systemPrompt: "You are an expert in professional business communication with deep expertise in navigating difficult workplace conversations with empathy and clarity.", starterPrompt: "Describe a difficult email situation you face (or invent one — e.g., telling a client their project will be delayed by 2 weeks), then use the Difficult Email Framework to ask AI to draft it.", hint: "After the first draft, try asking: 'Make this more empathetic in the opening' or 'Add a specific offer to compensate for the inconvenience' to see how targeted refinements work." } },
  { type: "callout", content: { variant: "warning", title: "Always Personalise", body: "AI-generated emails should always be reviewed and personalised before sending. Add specific details, personal touches, and ensure the tone matches your relationship with the recipient." } }
]);

addQuiz(lid(2,3), [
  { question: "Which email type requires a 'de-escalation + solution-focused' AI approach?", options: ["Routine emails", "Sales emails", "Client escalations", "Executive communications"], correctIndex: 2, explanation: "Client escalations require de-escalation techniques and a focus on solutions rather than problems — AI can help calibrate the tone to reduce tension while maintaining professionalism." },
  { question: "What is the recommended maximum word count for a difficult email using the framework in this lesson?", options: ["100 words", "200 words", "500 words", "No limit"], correctIndex: 1, explanation: "Keeping difficult emails under 200 words ensures clarity, reduces the chance of misinterpretation, and respects the recipient's time." },
  { question: "What should you ALWAYS do before sending an AI-generated email?", options: ["Run it through a grammar checker", "Review and personalise it with specific details and appropriate tone", "Send it to a colleague for approval", "Convert it to PDF format"], correctIndex: 1, explanation: "AI-generated emails must always be reviewed and personalised — adding specific details and ensuring the tone matches your relationship with the recipient is essential." },
  { question: "For executive communications, which AI prompt approach is most appropriate?", options: ["Empathy + de-escalation prompts", "Brevity + impact prompts", "Template + personalisation prompts", "Benefit-focused + call-to-action prompts"], correctIndex: 1, explanation: "Executives value brevity and impact — prompts should focus on getting to the point quickly and making the key message immediately clear." }
]);

// M2 L4 — Presentation Creation
addBlocks(lid(2,4), [
  { type: "text", content: { html: `<h2>AI-Powered Presentation Creation</h2><p>Creating compelling presentations is one of the most time-intensive business tasks. AI can help you go from a rough idea to a polished slide deck structure in minutes — then help you refine every slide for maximum impact.</p>` } },
  { type: "text", content: { html: `<h3>The Presentation Creation Workflow</h3><ol><li><strong>Story Architecture:</strong> Ask AI to create a narrative arc for your presentation</li><li><strong>Slide Outline:</strong> Generate a slide-by-slide outline with titles and key points</li><li><strong>Slide Content:</strong> Develop content for each slide (bullet points, talking points, data callouts)</li><li><strong>Speaker Notes:</strong> Generate detailed speaker notes for each slide</li><li><strong>Opening Hook:</strong> Craft a compelling opening that grabs attention</li><li><strong>Closing CTA:</strong> Design a clear, memorable call to action</li></ol>` } },
  { type: "text", content: { html: `<h3>The Story Architecture Prompt</h3><pre><code>You are a presentation coach who has helped Fortune 500 executives deliver TED-quality presentations.

Create a story architecture for a [duration]-minute presentation on [topic] for [audience].

The presentation should:
- Open with a compelling hook or surprising statistic
- Build to a clear central argument
- Use the problem-solution-benefit structure
- Include 3 key supporting points with evidence
- End with a memorable call to action

Provide: Narrative arc, recommended slide count, and the single most important message the audience should remember.</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Build a Presentation Outline", systemPrompt: "You are a world-class presentation coach and storytelling expert who helps business professionals create compelling, memorable presentations.", starterPrompt: "Ask the AI to create a complete slide-by-slide outline for a 10-minute presentation pitching a new AI productivity initiative to your company's leadership team. Include slide titles, 3 bullet points per slide, and speaker notes.", hint: "After getting the outline, pick one slide and ask: 'Write the full speaker notes for slide 3, including a relevant anecdote or data point to make it memorable.'" } },
  { type: "text", content: { html: `<h3>Data Visualisation Descriptions</h3><p>AI can help you describe the ideal chart or visualisation for your data:</p><pre><code>I have this data: [describe your data]
What type of chart would best communicate [the insight you want to show]?
Describe the chart in enough detail that I can recreate it in PowerPoint/Google Slides.</code></pre>` } }
]);

addQuiz(lid(2,4), [
  { question: "What is the first step in the AI Presentation Creation Workflow?", options: ["Writing speaker notes", "Creating slide content", "Story Architecture", "Designing the closing CTA"], correctIndex: 2, explanation: "Story Architecture comes first — establishing the narrative arc and central argument before creating individual slides ensures the presentation tells a coherent, compelling story." },
  { question: "What structure does the Story Architecture Prompt recommend for presentations?", options: ["Introduction-Body-Conclusion", "Problem-Solution-Benefit", "Past-Present-Future", "Context-Action-Result"], correctIndex: 1, explanation: "The Problem-Solution-Benefit structure is highly effective for business presentations as it immediately establishes relevance (the problem), credibility (your solution), and value (the benefit)." },
  { question: "What should a presentation's closing section always include?", options: ["A summary of all slides", "A clear, memorable call to action", "The presenter's biography", "Technical appendices"], correctIndex: 1, explanation: "A clear, memorable call to action tells the audience exactly what you want them to do next — without it, even a great presentation fails to drive results." },
  { question: "How can AI help with data visualisation in presentations?", options: ["AI can directly create PowerPoint charts", "AI can describe the ideal chart type and format for your data so you can recreate it", "AI can only work with text, not data", "AI automatically imports data from Excel"], correctIndex: 1, explanation: "While AI can't directly create PowerPoint charts, it can analyse your data and recommend the most effective visualisation type with enough detail to recreate it in your presentation tool." }
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 3: AI for Data Analysis & Reporting
// ══════════════════════════════════════════════════════════════════════════════

// M3 L1 — Data Interpretation with AI
addBlocks(lid(3,1), [
  { type: "text", content: { html: `<h2>AI-Powered Data Interpretation for Business</h2><p>You don't need to be a data scientist to extract powerful insights from business data. AI can help you interpret spreadsheets, identify trends, spot anomalies, and communicate findings clearly — all without writing a single line of code.</p>` } },
  { type: "callout", content: { variant: "info", title: "What You'll Learn", body: "How to describe data to AI and get meaningful analysis, how to identify trends and anomalies, and how to translate data insights into business language." } },
  { type: "text", content: { html: `<h3>Describing Data to AI Effectively</h3><p>Since you can't always paste raw data into an AI chat, you need to describe your data clearly. Use this structure:</p><pre><code>I have a dataset with the following structure:
- Rows: [what each row represents, e.g., monthly sales transactions]
- Columns: [list key columns and what they contain]
- Time period: [date range covered]
- Size: [approximate number of rows]

Key metrics I'm seeing:
- [Metric 1]: [value or range]
- [Metric 2]: [value or range]

Please help me: [what you want to understand or analyse]</code></pre>` } },
  { type: "text", content: { html: `<h3>The Five Analysis Questions</h3><p>When analysing any business dataset, ask AI to help you answer these five questions:</p><ol><li><strong>What is the trend?</strong> Is the metric going up, down, or flat over time?</li><li><strong>What is the anomaly?</strong> Are there any unusual spikes, drops, or outliers?</li><li><strong>What is the correlation?</strong> Do two metrics move together?</li><li><strong>What is the benchmark?</strong> How does this compare to industry standards or past performance?</li><li><strong>What is the implication?</strong> What does this mean for the business?</li></ol>` } },
  { type: "prompt_exercise", content: { title: "Practice: Analyse Business Data", systemPrompt: "You are a senior business analyst with expertise in interpreting business data and translating insights into clear, actionable recommendations for non-technical stakeholders.", starterPrompt: "Describe a fictional dataset to the AI (e.g., 'Monthly sales data for 12 months showing Q1 strong, Q2-Q3 declining, Q4 recovery') and ask it to help you identify the trend, potential causes, and 3 actionable recommendations.", hint: "Use the Five Analysis Questions as a framework. After the initial analysis, ask: 'What additional data would help confirm this hypothesis?'" } },
  { type: "text", content: { html: `<h3>Translating Data to Business Language</h3><p>Data analysis is only valuable when communicated clearly. Use AI to translate technical findings:</p><pre><code>Translate this data finding into clear business language for a non-technical executive audience:
[Technical finding]

The executive needs to understand: what happened, why it matters, and what action to take.
Keep it to 3 sentences maximum.</code></pre>` } }
]);

addQuiz(lid(3,1), [
  { question: "What are the Five Analysis Questions for business data?", options: ["Who, What, When, Where, Why", "Trend, Anomaly, Correlation, Benchmark, Implication", "Input, Process, Output, Feedback, Control", "Revenue, Cost, Profit, Growth, Market Share"], correctIndex: 1, explanation: "The Five Analysis Questions — Trend, Anomaly, Correlation, Benchmark, Implication — provide a comprehensive framework for extracting meaningful insights from any business dataset." },
  { question: "When describing data to AI without pasting raw data, what information should you include?", options: ["Only the column names", "What each row represents, key columns, time period, size, and key metrics", "Just the total number of rows", "Only the date range"], correctIndex: 1, explanation: "Effective data description includes structure (rows/columns), time period, size, and key metrics — giving AI enough context to provide meaningful analysis." },
  { question: "What is the purpose of translating data findings into 'business language'?", options: ["To make the data seem more impressive", "To ensure non-technical executives can understand what happened, why it matters, and what action to take", "To hide technical complexity from stakeholders", "To reduce the amount of data presented"], correctIndex: 1, explanation: "Data analysis only creates value when decision-makers can understand and act on it. Translating technical findings into clear business language bridges the gap between analysis and action." },
  { question: "Which of the Five Analysis Questions asks 'Are there any unusual spikes, drops, or outliers?'", options: ["Trend", "Anomaly", "Correlation", "Benchmark"], correctIndex: 1, explanation: "The Anomaly question specifically looks for unusual patterns — spikes, drops, or outliers that deviate from expected behaviour and may indicate problems or opportunities." }
]);

// M3 L2 — Report Generation
addBlocks(lid(3,2), [
  { type: "text", content: { html: `<h2>AI-Powered Business Report Generation</h2><p>Business reports are the primary vehicle for communicating performance, insights, and recommendations to stakeholders. AI can help you produce professional, data-driven reports in a fraction of the traditional time.</p>` } },
  { type: "text", content: { html: `<h3>Report Types and AI Approaches</h3><ul><li><strong>Performance Reports:</strong> KPI summaries, trend analysis, variance explanations</li><li><strong>Market Research Reports:</strong> Competitive analysis, market sizing, opportunity assessment</li><li><strong>Project Status Reports:</strong> Progress updates, risk flags, milestone tracking</li><li><strong>Financial Reports:</strong> Revenue analysis, cost breakdowns, forecast narratives</li><li><strong>Customer Insights Reports:</strong> Feedback analysis, satisfaction trends, NPS interpretation</li></ul>` } },
  { type: "text", content: { html: `<h3>The Report Generation Prompt</h3><pre><code>You are a senior business analyst. Generate a [report type] for [audience] with the following data:

Performance data: [paste or describe your data]
Reporting period: [period]
Key metrics: [list KPIs]
Targets/benchmarks: [list targets]

The report should include:
1. Executive Summary (3-4 sentences)
2. Performance Highlights (what went well)
3. Areas of Concern (what needs attention)
4. Root Cause Analysis (why performance was as it was)
5. Recommendations (3-5 specific, actionable steps)
6. Outlook (what to expect next period)

Tone: Professional, data-driven, and action-oriented.</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Generate a Performance Report", systemPrompt: "You are a senior business analyst who specialises in creating clear, actionable performance reports for business stakeholders.", starterPrompt: "Create fictional monthly sales data (e.g., target was $500K, actual was $420K, top product underperformed, new market segment overperformed), then use the Report Generation Prompt to ask AI to produce a complete monthly performance report.", hint: "After the report, ask: 'Rewrite the Recommendations section to be more specific and include estimated impact for each recommendation.'" } },
  { type: "callout", content: { variant: "tip", title: "Variance Explanation", body: "For any metric that missed target, ask AI: 'Write a professional variance explanation for [metric] that missed target by [amount]. Possible causes: [list causes]. Tone: factual, not defensive.'" } }
]);

addQuiz(lid(3,2), [
  { question: "Which section of the Report Generation Prompt explains WHY performance was as it was?", options: ["Executive Summary", "Performance Highlights", "Root Cause Analysis", "Outlook"], correctIndex: 2, explanation: "Root Cause Analysis digs into the underlying reasons for performance — whether positive or negative — providing the 'why' that makes recommendations credible and actionable." },
  { question: "What type of AI prompt is recommended for explaining a metric that missed its target?", options: ["A SWOT analysis prompt", "A variance explanation prompt: factual, not defensive", "A competitive analysis prompt", "A trend analysis prompt"], correctIndex: 1, explanation: "Variance explanations should be factual and professional, not defensive. AI can help strike the right tone while clearly explaining the gap between target and actual performance." },
  { question: "For a Customer Insights Report, what data would you typically analyse?", options: ["Stock prices and market indices", "Feedback analysis, satisfaction trends, and NPS interpretation", "Employee headcount and payroll data", "Supplier contracts and procurement data"], correctIndex: 1, explanation: "Customer Insights Reports focus on customer-facing data: feedback, satisfaction scores, NPS (Net Promoter Score), and trends in customer behaviour." },
  { question: "What tone should a business performance report maintain?", options: ["Casual and conversational", "Technical and academic", "Professional, data-driven, and action-oriented", "Emotional and motivational"], correctIndex: 2, explanation: "Business performance reports should be professional (credible), data-driven (evidence-based), and action-oriented (focused on what to do next) — this combination drives decision-making." }
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 4: AI for Research & Synthesis
// ══════════════════════════════════════════════════════════════════════════════

// M4 L1 — Research Frameworks
addBlocks(lid(4,1), [
  { type: "text", content: { html: `<h2>AI Research Frameworks for Business</h2><p>Business research — competitive analysis, market research, due diligence, industry scanning — is essential but time-consuming. AI dramatically accelerates the research process and helps you synthesise information from multiple sources into coherent, actionable insights.</p>` } },
  { type: "text", content: { html: `<h3>The Research Acceleration Framework</h3><p>Use AI at each stage of the research process:</p><ol><li><strong>Scoping:</strong> Ask AI to help define research questions and identify information gaps</li><li><strong>Source Identification:</strong> Ask AI to suggest the best sources for your research topic</li><li><strong>Synthesis:</strong> Paste research findings and ask AI to synthesise key themes</li><li><strong>Gap Analysis:</strong> Ask AI to identify what's missing from your research</li><li><strong>Insight Generation:</strong> Ask AI to draw conclusions and implications from your findings</li></ol>` } },
  { type: "text", content: { html: `<h3>Competitive Analysis with AI</h3><p>A structured competitive analysis prompt:</p><pre><code>You are a market research analyst. Help me conduct a competitive analysis for [my company/product] in the [industry] market.

My company: [brief description]
Key competitors: [list 3-5 competitors]

For each competitor, analyse:
- Value proposition and positioning
- Key strengths and weaknesses  
- Target customer segments
- Pricing strategy (if known)
- Recent strategic moves

Then provide:
- Key competitive threats to my business
- Underserved opportunities in the market
- Recommended differentiation strategy</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Conduct a Competitive Analysis", systemPrompt: "You are a senior market research analyst with expertise in competitive intelligence and strategic positioning.", starterPrompt: "Choose a real or fictional industry (e.g., project management software, sustainable packaging, online education), describe your hypothetical company, and ask the AI to conduct a competitive analysis with strategic recommendations.", hint: "After the analysis, ask: 'What are the 3 most important questions I should be asking that I haven't asked yet?' — this often reveals blind spots in your research." } },
  { type: "text", content: { html: `<h3>Synthesising Multiple Sources</h3><p>When you have gathered research from multiple sources, use AI to synthesise:</p><pre><code>I've gathered research from [number] sources on [topic]. Here are the key findings from each:

Source 1: [paste key points]
Source 2: [paste key points]
Source 3: [paste key points]

Please:
1. Identify the 3-5 most important themes across all sources
2. Note any contradictions or conflicting findings
3. Highlight the most credible/consistent findings
4. Summarise the overall picture in 3 sentences</code></pre>` } }
]);

addQuiz(lid(4,1), [
  { question: "What is the fourth step in the Research Acceleration Framework?", options: ["Scoping", "Source Identification", "Synthesis", "Gap Analysis"], correctIndex: 3, explanation: "Gap Analysis is the fourth step — after synthesising your research, you ask AI to identify what's missing, what questions remain unanswered, and what additional research would strengthen your conclusions." },
  { question: "In a competitive analysis prompt, what should you ask AI to provide AFTER analysing each competitor?", options: ["A list of the competitor's employees", "Key competitive threats, underserved opportunities, and recommended differentiation strategy", "The competitor's financial statements", "A history of the competitor's founding"], correctIndex: 1, explanation: "After competitor-by-competitor analysis, the strategic synthesis — threats, opportunities, and differentiation strategy — is what transforms research into actionable business intelligence." },
  { question: "What powerful follow-up question can reveal blind spots in your research?", options: ["'Can you make this shorter?'", "'What are the 3 most important questions I should be asking that I haven't asked yet?'", "'Can you translate this to another language?'", "'What is the word count of this analysis?'"], correctIndex: 1, explanation: "Asking AI what questions you haven't asked is a powerful meta-research technique that surfaces blind spots and ensures your analysis is comprehensive." },
  { question: "When synthesising multiple research sources, what should you ask AI to identify?", options: ["The longest source", "Key themes, contradictions, most credible findings, and an overall summary", "The most recent source", "The source with the most data points"], correctIndex: 1, explanation: "Effective synthesis identifies themes (patterns across sources), contradictions (conflicting findings), credibility (most consistent findings), and provides an overall picture — turning raw research into insight." }
]);

// M4 L2 — Summarisation Techniques
addBlocks(lid(4,2), [
  { type: "text", content: { html: `<h2>Advanced AI Summarisation Techniques</h2><p>The ability to quickly summarise long documents, articles, reports, and conversations is one of the most immediately valuable AI skills in business. This lesson covers advanced techniques for getting summaries that are truly useful — not just shorter versions of the original.</p>` } },
  { type: "text", content: { html: `<h3>The Five Summarisation Modes</h3><ol><li><strong>Executive Summary:</strong> 3-5 sentences capturing the essential message for decision-makers</li><li><strong>Bullet Summary:</strong> 5-10 key points in scannable format</li><li><strong>Action Summary:</strong> Focus only on what needs to be done, by whom, by when</li><li><strong>Question-Driven Summary:</strong> Answer specific questions from the source material</li><li><strong>Comparative Summary:</strong> Summarise how this document compares to another</li></ol>` } },
  { type: "text", content: { html: `<h3>The Question-Driven Summary</h3><p>Instead of asking for a generic summary, ask AI to answer specific questions from the document:</p><pre><code>Read this document and answer these specific questions:
1. What is the main argument or recommendation?
2. What evidence supports it?
3. What are the key risks or limitations mentioned?
4. What action is the reader expected to take?
5. What would change if this recommendation is not followed?

Document: [paste document]</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Question-Driven Summary", systemPrompt: "You are an expert research analyst who specialises in extracting the most important information from complex business documents.", starterPrompt: "Find or write a 3-4 paragraph business article or report excerpt, then use the Question-Driven Summary technique to ask AI to answer 5 specific questions about it.", hint: "Try comparing two different summarisation modes on the same text — ask for an Executive Summary first, then an Action Summary. Notice how the same content produces very different outputs." } },
  { type: "callout", content: { variant: "tip", title: "Layered Summarisation", body: "For very long documents, use layered summarisation: summarise each section first, then ask AI to summarise the summaries. This maintains accuracy while handling documents too long for a single prompt." } }
]);

addQuiz(lid(4,2), [
  { question: "Which summarisation mode focuses ONLY on what needs to be done, by whom, and by when?", options: ["Executive Summary", "Bullet Summary", "Action Summary", "Comparative Summary"], correctIndex: 2, explanation: "Action Summary strips away context and narrative to focus purely on tasks, owners, and deadlines — ideal for converting meeting notes or project documents into task lists." },
  { question: "What is 'layered summarisation' and when should you use it?", options: ["Summarising the same document multiple times", "Summarising each section first, then summarising the summaries — used for very long documents", "Having multiple people summarise the same document", "Using multiple AI tools to summarise the same content"], correctIndex: 1, explanation: "Layered summarisation handles documents too long for a single prompt by summarising sections individually, then summarising those summaries — maintaining accuracy while managing length constraints." },
  { question: "What is the key advantage of a Question-Driven Summary over a generic summary?", options: ["It produces shorter output", "It answers specific questions relevant to your needs rather than what the AI thinks is important", "It is faster to generate", "It requires less input from the user"], correctIndex: 1, explanation: "Question-Driven Summaries ensure you get the specific information you need — not what the AI thinks is most important — making them far more useful for decision-making." },
  { question: "How many sentences should an Executive Summary mode produce?", options: ["1-2 sentences", "3-5 sentences", "10-15 sentences", "As many as needed"], correctIndex: 1, explanation: "An Executive Summary in this framework is 3-5 sentences — long enough to capture the essential message, short enough to be read in 30 seconds by a busy decision-maker." }
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 5: AI for Presentations & Visual Communication
// ══════════════════════════════════════════════════════════════════════════════

// M5 L1 — Slide Structure & Storytelling
addBlocks(lid(5,1), [
  { type: "text", content: { html: `<h2>AI-Powered Slide Structure and Business Storytelling</h2><p>Great presentations are built on great stories. Before you open PowerPoint or Google Slides, you need a compelling narrative architecture. AI can help you design that architecture and then populate every slide with content that serves the story.</p>` } },
  { type: "text", content: { html: `<h3>The Three Presentation Archetypes</h3><p>Every business presentation falls into one of three archetypes — and each requires a different narrative structure:</p><ol><li><strong>The Pitch:</strong> Problem → Solution → Proof → Ask (investor decks, sales presentations)</li><li><strong>The Report:</strong> Context → Findings → Implications → Recommendations (performance reviews, research presentations)</li><li><strong>The Vision:</strong> Where we are → Where we're going → How we get there → Why it matters (strategy presentations, change management)</li></ol>` } },
  { type: "text", content: { html: `<h3>The Slide Design Brief Prompt</h3><pre><code>You are a presentation strategist. I need to create a [archetype] presentation.

Context:
- Audience: [who they are, what they care about]
- Purpose: [what I want them to think/feel/do after]
- Duration: [length of presentation]
- Key message: [the one thing they must remember]

Create:
1. A narrative arc (5-7 sentences describing the story flow)
2. A slide outline (slide number, title, 3 key points, visual suggestion)
3. The opening hook (first 30 seconds of the presentation)
4. The closing statement (last 30 seconds)</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Design a Presentation Architecture", systemPrompt: "You are a world-class presentation strategist who has helped executives at Fortune 500 companies deliver board-level presentations, investor pitches, and company-wide strategy reveals.", starterPrompt: "Choose one of the three presentation archetypes (Pitch, Report, or Vision) and ask the AI to create a complete presentation architecture for a business scenario of your choice. Include the narrative arc, slide outline, opening hook, and closing statement.", hint: "After getting the architecture, ask: 'What is the single most common mistake presenters make with this archetype, and how does this structure avoid it?'" } },
  { type: "callout", content: { variant: "info", title: "The One-Sentence Test", body: "Before building any presentation, ask AI: 'Summarise the core message of this presentation in one sentence.' If you can't pass this test, the presentation isn't ready to be built." } }
]);

addQuiz(lid(5,1), [
  { question: "Which presentation archetype uses the structure: Problem → Solution → Proof → Ask?", options: ["The Report", "The Vision", "The Pitch", "The Update"], correctIndex: 2, explanation: "The Pitch archetype is designed for persuasion — establishing the problem (relevance), presenting the solution (credibility), providing proof (evidence), and making the ask (call to action)." },
  { question: "What is the 'One-Sentence Test' for a presentation?", options: ["Checking that the presentation can be delivered in one minute", "Ensuring the core message can be summarised in one sentence before building the presentation", "Making sure each slide has only one sentence", "Testing the presentation with one audience member first"], correctIndex: 1, explanation: "The One-Sentence Test ensures clarity of purpose before building. If you can't summarise the core message in one sentence, the presentation's central argument isn't clear enough yet." },
  { question: "For a strategy presentation about company direction, which archetype is most appropriate?", options: ["The Pitch", "The Report", "The Vision", "The Tutorial"], correctIndex: 2, explanation: "The Vision archetype — Where we are → Where we're going → How we get there → Why it matters — is designed for strategy and change management presentations." },
  { question: "What four elements should the Slide Design Brief Prompt produce?", options: ["Title, agenda, content, conclusion", "Narrative arc, slide outline, opening hook, closing statement", "Introduction, body, Q&A, summary", "Problem, solution, evidence, recommendation"], correctIndex: 1, explanation: "The Slide Design Brief produces: Narrative arc (the story), Slide outline (the structure), Opening hook (first 30 seconds), and Closing statement (last 30 seconds) — the complete architecture before any content is written." }
]);

// M5 L2 — Speaker Notes & Delivery
addBlocks(lid(5,2), [
  { type: "text", content: { html: `<h2>AI-Generated Speaker Notes and Delivery Coaching</h2><p>The gap between a good presentation and a great one is usually delivery. AI can help you craft speaker notes that guide confident, natural delivery — and even help you prepare for tough questions from the audience.</p>` } },
  { type: "text", content: { html: `<h3>The Speaker Notes Framework</h3><p>Effective speaker notes have three layers:</p><ol><li><strong>The Headline:</strong> The single most important point of this slide (1 sentence)</li><li><strong>The Story:</strong> The narrative or context that brings the slide to life (2-3 sentences)</li><li><strong>The Bridge:</strong> The transition to the next slide (1 sentence)</li></ol><p>Use this prompt for each slide:</p><pre><code>Write speaker notes for a presentation slide with this content:
Slide title: [title]
Key points: [bullet points]

The speaker notes should include:
1. Headline: The most important point in one sentence
2. Story: A brief narrative or real-world example that brings this slide to life (2-3 sentences)
3. Bridge: A natural transition to the next slide about [next slide topic]

Tone: Conversational but professional. The presenter should sound like they're speaking, not reading.</code></pre>` } },
  { type: "text", content: { html: `<h3>Q&A Preparation with AI</h3><p>Before any important presentation, use AI to prepare for tough questions:</p><pre><code>I'm presenting [topic] to [audience]. Based on this presentation content: [paste outline or key points]

Generate the 10 most challenging questions this audience is likely to ask.
For each question, provide:
- The question
- Why this audience would ask it
- A strong, concise answer (2-3 sentences)
- A data point or example that supports the answer</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Generate Speaker Notes and Q&A Prep", systemPrompt: "You are an executive presentation coach who specialises in helping business professionals deliver confident, compelling presentations.", starterPrompt: "Take a slide from a presentation you're working on (or create a fictional one), then ask the AI to: 1) Write speaker notes using the three-layer framework, and 2) Generate the 5 toughest questions the audience might ask with suggested answers.", hint: "After getting the Q&A prep, ask: 'Which of these questions is most likely to derail the presentation if answered poorly, and how should I handle it?'" } },
  { type: "callout", content: { variant: "tip", title: "Rehearsal Partner", body: "Use AI as a rehearsal partner: paste your speaker notes and ask 'What parts of this are most likely to lose the audience's attention, and how should I make them more engaging?'" } }
]);

addQuiz(lid(5,2), [
  { question: "What are the three layers of the Speaker Notes Framework?", options: ["Introduction, Body, Conclusion", "Headline, Story, Bridge", "Context, Evidence, Action", "Opening, Main Point, Closing"], correctIndex: 1, explanation: "The three layers are: Headline (most important point in one sentence), Story (narrative that brings the slide to life), and Bridge (transition to the next slide)." },
  { question: "What tone should speaker notes be written in?", options: ["Formal and academic", "Technical and detailed", "Conversational but professional — sounding like speaking, not reading", "Casual and humorous"], correctIndex: 2, explanation: "Speaker notes should sound like natural speech — conversational but professional. Notes that sound like they're being read create a robotic delivery that loses audiences." },
  { question: "What does the Q&A Preparation prompt ask AI to provide for each anticipated question?", options: ["Only the question text", "The question, why the audience would ask it, a strong answer, and a supporting data point", "Just the answer to the question", "The question and a one-word answer"], correctIndex: 1, explanation: "Comprehensive Q&A prep includes: the question, the motivation behind it (why this audience would ask it), a strong concise answer, and supporting evidence — preparing you for confident, credible responses." },
  { question: "How can AI be used as a 'rehearsal partner' for presentations?", options: ["AI can watch you present via camera", "Paste speaker notes and ask AI to identify parts likely to lose the audience's attention", "AI can time your presentation automatically", "AI can send the presentation to the audience for feedback"], correctIndex: 1, explanation: "Pasting speaker notes and asking AI to identify engagement risks and suggest improvements is a powerful way to stress-test your delivery before the real presentation." }
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 6: AI Workflow Automation
// ══════════════════════════════════════════════════════════════════════════════

// M6 L1 — Identifying Automation Opportunities
addBlocks(lid(6,1), [
  { type: "text", content: { html: `<h2>Identifying AI Automation Opportunities in Your Business</h2><p>The biggest opportunity in AI for business isn't using AI for individual tasks — it's identifying repetitive, time-consuming processes that can be partially or fully automated. This lesson teaches you to see your work through an automation lens.</p>` } },
  { type: "text", content: { html: `<h3>The Automation Opportunity Matrix</h3><p>Evaluate any task against two dimensions:</p><ul><li><strong>Frequency:</strong> How often does this task occur? (Daily, weekly, monthly)</li><li><strong>Time Cost:</strong> How long does it take each time?</li></ul><p>High-frequency + high-time-cost tasks are your <strong>Priority 1 automation targets</strong>.</p><h4>Common Business Automation Opportunities</h4><ul><li>Weekly status report generation from project data</li><li>Meeting summary and action item extraction</li><li>Customer inquiry response drafting</li><li>Competitive intelligence monitoring and summarisation</li><li>Employee onboarding documentation</li><li>Contract and proposal first drafts</li><li>Social media content creation from blog posts</li><li>Data entry validation and error checking</li></ul>` } },
  { type: "text", content: { html: `<h3>The Process Audit Prompt</h3><pre><code>I want to identify AI automation opportunities in my role as [job title] at a [company type].

My typical weekly tasks include:
[List 10-15 tasks you do regularly]

For each task, please assess:
1. Automation potential (High/Medium/Low) with reasoning
2. Recommended AI approach (which type of AI tool or prompt strategy)
3. Estimated time savings per week
4. Implementation complexity (Easy/Medium/Hard)

Prioritise by: highest time savings × lowest implementation complexity</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Audit Your Work for Automation", systemPrompt: "You are an AI workflow consultant who specialises in helping business professionals identify and implement AI automation opportunities in their daily work.", starterPrompt: "List 10 tasks you do regularly in your job (or invent a realistic job role), then use the Process Audit Prompt to ask AI to identify your top 3 automation opportunities with implementation recommendations.", hint: "After the audit, ask: 'For my top priority automation, walk me through exactly how I would implement this step by step using available AI tools.'" } },
  { type: "callout", content: { variant: "info", title: "Start Small", body: "Don't try to automate everything at once. Identify your single highest-value automation opportunity and implement it fully before moving to the next. One well-implemented automation is worth more than ten half-finished ones." } }
]);

addQuiz(lid(6,1), [
  { question: "What are the two dimensions of the Automation Opportunity Matrix?", options: ["Cost and Complexity", "Frequency and Time Cost", "Priority and Urgency", "Skill Level and Tool Availability"], correctIndex: 1, explanation: "The Automation Opportunity Matrix evaluates tasks on Frequency (how often it occurs) and Time Cost (how long it takes) — tasks that are both frequent and time-consuming are Priority 1 automation targets." },
  { question: "According to the lesson, what is the biggest opportunity in AI for business?", options: ["Using AI for individual creative tasks", "Identifying repetitive processes that can be partially or fully automated", "Replacing human workers with AI", "Using AI only for customer-facing communications"], correctIndex: 1, explanation: "The biggest opportunity isn't individual task assistance — it's identifying systemic, repetitive processes where AI automation creates compounding time savings across the organisation." },
  { question: "What is the recommended approach when starting with AI automation?", options: ["Automate all tasks simultaneously for maximum impact", "Identify your single highest-value automation and implement it fully before moving on", "Start with the most complex automation to build skills", "Only automate tasks that take more than 8 hours per week"], correctIndex: 1, explanation: "Starting with one well-implemented automation is more valuable than multiple half-finished ones. Full implementation — including testing, refinement, and team adoption — is what creates real time savings." },
  { question: "Which of the following is listed as a common business automation opportunity?", options: ["Strategic planning and vision setting", "Weekly status report generation from project data", "Performance reviews and salary decisions", "Product pricing strategy"], correctIndex: 1, explanation: "Weekly status report generation is a classic automation opportunity — it's frequent, time-consuming, follows a consistent format, and can be largely automated with the right prompt template." }
]);

// M6 L2 — Building Prompt Templates
addBlocks(lid(6,2), [
  { type: "text", content: { html: `<h2>Building Reusable Prompt Templates for Business</h2><p>The most productive AI users don't write prompts from scratch every time — they build and maintain a library of tested, refined prompt templates that can be quickly customised for specific situations. This lesson teaches you to create prompts that work consistently and can be shared across your team.</p>` } },
  { type: "text", content: { html: `<h3>Anatomy of a Reusable Prompt Template</h3><p>A good prompt template has five components:</p><ol><li><strong>Role Definition:</strong> Who is the AI in this context?</li><li><strong>Context Block:</strong> What background information does the AI need?</li><li><strong>Task Specification:</strong> What exactly needs to be done?</li><li><strong>Format Requirements:</strong> How should the output be structured?</li><li><strong>Variable Placeholders:</strong> [BRACKETS] for the parts that change each time</li></ol>` } },
  { type: "text", content: { html: `<h3>Template Example: Weekly Status Report</h3><pre><code>ROLE: You are a professional business writer creating internal status reports.

CONTEXT: This is a weekly status report for [PROJECT NAME] addressed to [AUDIENCE].
Company context: [BRIEF COMPANY/PROJECT CONTEXT]

TASK: Generate a professional weekly status report based on this data:
- Completed this week: [LIST OF COMPLETIONS]
- In progress: [LIST OF IN-PROGRESS ITEMS]
- Blocked/at risk: [LIST OF BLOCKERS]
- Next week priorities: [LIST OF PRIORITIES]
- Key metrics: [METRICS AND VALUES]

FORMAT:
1. Executive Summary (2-3 sentences)
2. Accomplishments (bullet list)
3. In Progress (bullet list with % complete)
4. Risks & Blockers (table: Issue | Impact | Mitigation)
5. Next Week (prioritised list)
6. Metrics Dashboard (table)

TONE: Professional, concise, factual. No fluff.</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Build Your Own Prompt Template", systemPrompt: "You are an AI productivity consultant who specialises in creating reusable prompt templates that teams can use to consistently produce high-quality business content.", starterPrompt: "Choose a task you do regularly (weekly report, client email, meeting summary, etc.) and ask the AI to help you build a reusable prompt template for it using the five-component anatomy. Then test the template with sample data.", hint: "After building the template, ask: 'What are the 3 most important variables in this template that will most affect output quality?' — this helps you know where to invest the most effort when customising." } },
  { type: "callout", content: { variant: "tip", title: "Template Library", body: "Store your best prompt templates in a shared document (Notion, Confluence, Google Docs) with the template, a description of when to use it, and an example output. This becomes a team productivity asset." } }
]);

addQuiz(lid(6,2), [
  { question: "What are the five components of a reusable prompt template?", options: ["Title, Body, Format, Examples, Notes", "Role Definition, Context Block, Task Specification, Format Requirements, Variable Placeholders", "Introduction, Instructions, Output, Review, Archive", "Who, What, When, Where, How"], correctIndex: 1, explanation: "The five components are: Role Definition (who the AI is), Context Block (background), Task Specification (what to do), Format Requirements (how to structure output), and Variable Placeholders (the parts that change)." },
  { question: "How are variable parts of a prompt template typically indicated?", options: ["With asterisks (*variable*)", "With [BRACKETS]", "With CAPITAL LETTERS", "With quotation marks"], correctIndex: 1, explanation: "[BRACKETS] are the conventional way to mark variable placeholders in prompt templates — they're visually distinct and easy to find and replace when customising the template." },
  { question: "Where should you store your best prompt templates for team use?", options: ["Only on your personal computer", "In a shared document (Notion, Confluence, Google Docs) with description and example output", "In the AI tool's chat history", "In a private email folder"], correctIndex: 1, explanation: "A shared template library in a collaborative tool (Notion, Confluence, Google Docs) transforms individual productivity gains into team-wide assets — with descriptions and examples so anyone can use them effectively." },
  { question: "What is the key advantage of reusable prompt templates over writing prompts from scratch?", options: ["Templates are always shorter", "Templates produce consistent, tested results and can be quickly customised for specific situations", "Templates require less AI processing power", "Templates work without an internet connection"], correctIndex: 1, explanation: "Reusable templates encode your best prompting practices, produce consistent results, and can be quickly customised — turning one-time prompt engineering effort into ongoing productivity gains." }
]);

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 7: AI for Client Communication & Relationship Management
// ══════════════════════════════════════════════════════════════════════════════

// M7 L1 — Client Communication Excellence
addBlocks(lid(7,1), [
  { type: "text", content: { html: `<h2>AI-Enhanced Client Communication</h2><p>Client relationships are built on trust, and trust is built through consistent, professional, and responsive communication. AI can help you maintain the highest standards of client communication even when you're managing multiple relationships simultaneously.</p>` } },
  { type: "text", content: { html: `<h3>The Client Communication Hierarchy</h3><p>Different client situations require different communication approaches:</p><ul><li><strong>Proactive Updates:</strong> Regular progress communications before clients ask</li><li><strong>Responsive Communications:</strong> Timely, thorough responses to client inquiries</li><li><strong>Difficult Conversations:</strong> Delivering bad news, managing expectations, addressing complaints</li><li><strong>Relationship Building:</strong> Check-ins, value-add communications, milestone celebrations</li><li><strong>Escalation Management:</strong> Handling unhappy clients and recovering relationships</li></ul>` } },
  { type: "text", content: { html: `<h3>The Proactive Client Update Template</h3><pre><code>Write a proactive client update email for [CLIENT NAME/COMPANY].

Project: [PROJECT NAME]
Reporting period: [PERIOD]
Status: [On track / At risk / Delayed]

Key updates:
- [UPDATE 1]
- [UPDATE 2]
- [UPDATE 3]

Upcoming milestones: [LIST]
Any concerns or risks: [LIST OR "None at this time"]

Tone: Professional, confident, and transparent. 
Length: Under 200 words.
End with a clear next step or call to action.</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Write a Client Update and Escalation Response", systemPrompt: "You are a senior client relationship manager with 15 years of experience managing complex client relationships across multiple industries.", starterPrompt: "Create a scenario: a client project is 2 weeks behind schedule due to a technical issue. Ask the AI to: 1) Write a proactive update email informing the client, and 2) Write a response to an angry follow-up email from the client demanding answers.", hint: "Compare the two emails — notice how the tone shifts from proactive/transparent to empathetic/solution-focused. Ask: 'What is the most important thing to avoid saying in the escalation response?'" } },
  { type: "text", content: { html: `<h3>Personalisation at Scale</h3><p>AI enables personalised communication even when managing many clients:</p><pre><code>I need to send a personalised check-in email to [CLIENT NAME].

What I know about this client:
- Industry: [INDUSTRY]
- Key challenges they've mentioned: [CHALLENGES]
- Recent wins they've had: [WINS]
- Our relationship stage: [NEW / ESTABLISHED / LONG-TERM]

Write a warm, personalised check-in email that:
- References something specific to their situation
- Provides one piece of relevant value (insight, resource, or idea)
- Ends with a low-pressure invitation to connect</code></pre>` } }
]);

addQuiz(lid(7,1), [
  { question: "What is the key principle behind 'Proactive Updates' in client communication?", options: ["Sending updates only when clients ask for them", "Communicating progress regularly before clients need to ask", "Sending daily emails to all clients", "Only communicating when there is good news"], correctIndex: 1, explanation: "Proactive updates build trust by demonstrating attentiveness and transparency — clients who receive regular updates before asking are far more confident in the relationship." },
  { question: "What tone should a proactive client update email maintain?", options: ["Casual and friendly", "Technical and detailed", "Professional, confident, and transparent", "Formal and distant"], correctIndex: 2, explanation: "Proactive client updates should be professional (credible), confident (reassuring), and transparent (honest about status) — this combination builds the trust that sustains long-term relationships." },
  { question: "What makes AI-assisted client communication 'personalisation at scale'?", options: ["Sending the same email to all clients simultaneously", "Using client-specific context (industry, challenges, wins) to create personalised communications efficiently", "Automating all client communications without human review", "Using the client's name in a generic template"], correctIndex: 1, explanation: "True personalisation at scale means using specific knowledge about each client — their industry, challenges, recent wins — to create communications that feel individually crafted, even when managing many relationships." },
  { question: "Which client communication type is used for 'Handling unhappy clients and recovering relationships'?", options: ["Proactive Updates", "Responsive Communications", "Relationship Building", "Escalation Management"], correctIndex: 3, explanation: "Escalation Management is specifically designed for unhappy clients — it requires de-escalation, empathy, accountability, and a clear path to resolution." }
]);

// M7 L2 — Proposal Writing & Business Development
addBlocks(lid(7,2), [
  { type: "text", content: { html: `<h2>AI-Powered Proposal Writing and Business Development</h2><p>Winning new business requires compelling proposals that speak directly to the client's needs, demonstrate your understanding of their challenges, and make a clear case for why you're the right choice. AI can help you create proposals that stand out — faster than ever before.</p>` } },
  { type: "text", content: { html: `<h3>The Winning Proposal Structure</h3><ol><li><strong>Executive Summary:</strong> The client's problem + your solution + the key benefit (1 page)</li><li><strong>Understanding of Need:</strong> Demonstrate you understand their specific situation</li><li><strong>Proposed Solution:</strong> What you'll do, how you'll do it, why this approach</li><li><strong>Methodology & Timeline:</strong> Step-by-step approach with clear milestones</li><li><strong>Investment:</strong> Pricing structured as value, not cost</li><li><strong>Why Us:</strong> Relevant experience, team credentials, differentiators</li><li><strong>Next Steps:</strong> Clear, low-friction path to yes</li></ol>` } },
  { type: "text", content: { html: `<h3>The Proposal Personalisation Prompt</h3><pre><code>You are a senior business development consultant. Help me write a compelling proposal section.

Client context:
- Company: [COMPANY NAME]
- Industry: [INDUSTRY]
- Specific challenge: [THEIR CHALLENGE]
- Decision-maker: [ROLE AND WHAT THEY CARE ABOUT]
- Budget signals: [ANY BUDGET CONTEXT]
- Competitive context: [ARE WE COMPETING? AGAINST WHOM?]

Section to write: [SECTION NAME]
Key points to include: [YOUR KEY POINTS]

Make this feel like it was written specifically for this client, not from a template.
Demonstrate deep understanding of their industry and situation.</code></pre>` } },
  { type: "prompt_exercise", content: { title: "Practice: Write a Winning Proposal Section", systemPrompt: "You are a senior business development consultant with a track record of winning high-value contracts through compelling, client-centred proposals.", starterPrompt: "Create a client scenario (e.g., a retail company needing an e-commerce transformation), then ask the AI to write the 'Understanding of Need' section of a proposal — demonstrating deep understanding of their specific challenges and what's at stake if they don't act.", hint: "After the first draft, ask: 'What is the most compelling sentence in this section, and how can we make the rest of the section as strong as that sentence?'" } },
  { type: "callout", content: { variant: "info", title: "The 'So What' Test", body: "After every proposal section, ask AI: 'Apply the So What test — for each point in this section, explain why the client should care.' This ensures every element of your proposal speaks to client value, not just your capabilities." } }
]);

addQuiz(lid(7,2), [
  { question: "What is the purpose of the 'Understanding of Need' section in a winning proposal?", options: ["To list your company's services", "To demonstrate you understand the client's specific situation and challenges", "To present your pricing", "To introduce your team members"], correctIndex: 1, explanation: "The Understanding of Need section demonstrates empathy and insight — showing the client that you've listened, understood their specific situation, and aren't just sending a generic proposal." },
  { question: "How should pricing be structured in a winning proposal?", options: ["As a detailed cost breakdown", "As value, not cost", "As the lowest possible number", "As a range with no specifics"], correctIndex: 1, explanation: "Structuring pricing as value (what the client gains) rather than cost (what they pay) shifts the conversation from 'is this affordable?' to 'is this worth it?' — a much more favourable framing." },
  { question: "What is the 'So What' test for proposal sections?", options: ["Checking if the proposal is long enough", "For each point, explaining why the client should care — ensuring everything speaks to client value", "Testing if the proposal can be summarised in one sentence", "Checking if the proposal has a clear next step"], correctIndex: 1, explanation: "The 'So What' test ensures every element of your proposal is client-centric — not just listing your capabilities, but explicitly connecting each point to the client's goals and challenges." },
  { question: "What should the 'Next Steps' section of a proposal provide?", options: ["A list of all your other clients", "A clear, low-friction path to yes", "Detailed legal terms and conditions", "A request for the client to call you when ready"], correctIndex: 1, explanation: "Next Steps should make it as easy as possible for the client to say yes — a clear, simple action (e.g., 'Reply to this email to schedule a 30-minute call') removes friction from the decision process." }
]);

console.log(`\nTotal content blocks to insert: ${contentBlocks.length}`);
console.log(`Total quiz questions to insert: ${quizQuestions.length}`);

// ─── Clear existing content blocks and quiz questions ────────────────────
console.log("\nClearing existing content blocks and quiz questions...");
await conn.execute("DELETE FROM quiz_questions");
await conn.execute("DELETE FROM content_blocks");

// ─── Insert content blocks in batches ────────────────────────────────────
console.log("Inserting content blocks...");
let blockCount = 0;
for (const block of contentBlocks) {
  await conn.execute(
    "INSERT INTO content_blocks (lessonId, `order`, type, content) VALUES (?, ?, ?, ?)",
    [block.lessonId, block.order, block.type, JSON.stringify(block.content)]
  );
  blockCount++;
  if (blockCount % 10 === 0) console.log(`  Inserted ${blockCount}/${contentBlocks.length} blocks...`);
}

// ─── Insert quiz questions in batches ────────────────────────────────────
console.log("Inserting quiz questions...");
let quizCount = 0;
for (const q of quizQuestions) {
  await conn.execute(
    "INSERT INTO quiz_questions (lessonId, `order`, question, options, correctIndex, explanation) VALUES (?, ?, ?, ?, ?, ?)",
    [q.lessonId, q.order, q.question, q.options, q.correctIndex, q.explanation]
  );
  quizCount++;
}

console.log(`\n✅ Done! Inserted ${blockCount} content blocks and ${quizCount} quiz questions.`);
await conn.end();
