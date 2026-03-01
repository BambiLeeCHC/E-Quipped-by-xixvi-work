"""
Comprehensive seed data for E-Quipped AI Mastery Platform
7 Modules - 36 Lessons with Applied Learning and Quizzes
"""

from datetime import datetime, timezone

def get_all_modules():
    """Get all 7 modules"""
    return [
        {
            "module_id": "mod_001",
            "title": "Foundations of Prompt Engineering",
            "description": "Master the core principles of effective AI communication",
            "slug": "foundations-prompt-engineering",
            "order_index": 1,
            "is_published": True,
            "difficulty": "Beginner",
            "estimated_hours": 8,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "module_id": "mod_002",
            "title": "AI for Data & Analysis",
            "description": "Leverage AI to extract insights from data",
            "slug": "ai-data-analysis",
            "order_index": 2,
            "is_published": True,
            "difficulty": "Intermediate",
            "estimated_hours": 10,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "module_id": "mod_003",
            "title": "AI for Business Writing",
            "description": "Create professional documents with AI assistance",
            "slug": "ai-business-writing",
            "order_index": 3,
            "is_published": True,
            "difficulty": "Intermediate",
            "estimated_hours": 8,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "module_id": "mod_004",
            "title": "AI for Presentations & Decks",
            "description": "Design compelling presentations using AI",
            "slug": "ai-presentations-decks",
            "order_index": 4,
            "is_published": True,
            "difficulty": "Intermediate",
            "estimated_hours": 7,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "module_id": "mod_005",
            "title": "AI for Research & Synthesis",
            "description": "Accelerate research and information synthesis with AI",
            "slug": "ai-research-synthesis",
            "order_index": 5,
            "is_published": True,
            "difficulty": "Advanced",
            "estimated_hours": 9,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "module_id": "mod_006",
            "title": "AI for Email & Client Comms",
            "description": "Master professional communication with AI",
            "slug": "ai-email-client-comms",
            "order_index": 6,
            "is_published": True,
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "module_id": "mod_007",
            "title": "AI Workflow Automation",
            "description": "Build and deploy AI-powered automated workflows",
            "slug": "ai-workflow-automation",
            "order_index": 7,
            "is_published": True,
            "difficulty": "Advanced",
            "estimated_hours": 12,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

def get_all_lessons():
    """Get all 36 lessons across 7 modules"""
    lessons = []
    
    # MODULE 1: Foundations of Prompt Engineering (5 lessons)
    lessons.extend([
        {
            "lesson_id": "les_001",
            "module_id": "mod_001",
            "title": "Introduction to AI & Prompt Engineering",
            "slug": "intro-ai-prompt-engineering",
            "description": "Understand how AI language models work and why prompts matter",
            "order_index": 1,
            "difficulty_level": "beginner",
            "estimated_minutes": 45,
            "xp_reward": 100,
            "learning_objectives": [
                "Understand how Large Language Models (LLMs) process information",
                "Recognize the difference between good and bad prompts",
                "Identify the 4 Core Elements of effective prompts"
            ],
            "content": """# Welcome to AI Mastery!

## What You'll Learn

In this lesson, you'll discover the foundations of working with AI language models. You'll learn how these powerful tools "think" and how to communicate with them effectively.

## Understanding AI Language Models

AI models like GPT, Claude, and Gemini are trained on vast amounts of text data. They predict the most likely next words based on patterns they've learned. Think of them as incredibly sophisticated autocomplete systems.

**Key Concept:** AI doesn't "understand" like humans do—it recognizes patterns and generates responses that match those patterns.

## The 4 Core Elements Framework

Every effective prompt should include these elements:

### 1. **Role/Persona**
Define who the AI should act as:
- "You are an expert marketing consultant"
- "Act as a technical writer"
- "You are a helpful career advisor"

### 2. **Task**
Be specific about what you want:
- "Create a..."
- "Analyze this..."
- "Write a..."

### 3. **Context**
Provide background information:
- Audience (who is this for?)
- Tone (professional, casual, friendly?)
- Purpose (why are you creating this?)

### 4. **Constraints**
Set boundaries and requirements:
- Format (bullet points, paragraph, etc.)
- Length (word count, character limit)
- Style guidelines
- What to include/exclude

## Examples

❌ **Bad Prompt:** "Write something about marketing"

✅ **Good Prompt:** "You are a senior marketing strategist. Create a 300-word email campaign outline for a B2B SaaS product targeting IT directors. Use a professional but approachable tone. Include: subject line, opening hook, 3 key benefits, and call-to-action."

## Why This Matters

The difference between mediocre and exceptional AI outputs is 90% about the prompt. Master prompting, and you'll 10x your productivity.""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_002",
            "module_id": "mod_001",
            "title": "The 4 Core Elements in Action",
            "slug": "four-core-elements-action",
            "description": "Practice using Role, Task, Context, and Constraints in real scenarios",
            "order_index": 2,
            "difficulty_level": "beginner",
            "estimated_minutes": 60,
            "xp_reward": 150,
            "learning_objectives": [
                "Apply the 4 Core Elements to create effective prompts",
                "Identify missing elements in weak prompts",
                "Improve prompt quality through iteration"
            ],
            "sections": [
                {
                    "title": "Deconstructing Great Prompts",
                    "type": "content",
                    "order_index": 1,
                    "blocks": [
                        {
                            "id": "block_1",
                            "type": "heading",
                            "content": "Let's Break Down a Perfect Prompt",
                            "level": 2,
                            "order_index": 0
                        },
                        {
                            "id": "block_2",
                            "type": "gif",
                            "url": "/api/uploads/image/prompt_breakdown_demo.gif",
                            "caption": "Watch how we deconstruct a professional prompt into its 4 core elements",
                            "alt_text": "Animated demonstration of breaking down a prompt into Role, Task, Context, and Constraints",
                            "order_index": 1
                        },
                        {
                            "id": "block_3",
                            "type": "text",
                            "content": "In this demonstration, you'll see how each element contributes to the final output quality. Notice how removing even one element significantly degrades the AI's response.",
                            "order_index": 2
                        }
                    ]
                },
                {
                    "title": "Element-by-Element Breakdown",
                    "type": "content",
                    "order_index": 2,
                    "blocks": [
                        {
                            "id": "block_4",
                            "type": "callout",
                            "callout_type": "tip",
                            "content": "**Pro Tip:** Start with Role and Task, then add Context and Constraints. This progression helps you build prompts systematically.",
                            "order_index": 0
                        },
                        {
                            "id": "block_5",
                            "type": "code",
                            "language": "text",
                            "content": """ROLE: You are a professional email copywriter with 10 years of experience

TASK: Write a follow-up email after a sales call

CONTEXT: 
- Recipient: Mid-level manager at a Fortune 500 company
- Call went well, they expressed interest
- Next step: schedule a product demo
- Tone: Professional but warm

CONSTRAINTS:
- Keep it under 150 words
- Include a clear call-to-action
- Mention 2 specific points from the call
- Suggest 3 specific time slots for the demo""",
                            "order_index": 1
                        }
                    ]
                }
            ],
            "content": "This lesson uses rich content sections. See sections array.",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_003",
            "module_id": "mod_001",
            "title": "Chain of Thought Prompting",
            "slug": "chain-of-thought-prompting",
            "description": "Guide AI through complex reasoning step-by-step",
            "order_index": 3,
            "difficulty_level": "intermediate",
            "estimated_minutes": 50,
            "xp_reward": 175,
            "learning_objectives": [
                "Understand when to use Chain of Thought (CoT) prompting",
                "Structure multi-step reasoning prompts",
                "Improve accuracy on complex tasks"
            ],
            "content": """# Chain of Thought Prompting

## What is Chain of Thought?

Chain of Thought (CoT) prompting is a technique where you explicitly ask the AI to "think step-by-step" or "reason through" a problem before providing an answer.

## When to Use CoT

Use Chain of Thought for:
- **Complex analysis** - Financial calculations, data interpretation
- **Multi-step problems** - Strategy planning, troubleshooting
- **Decision-making** - Comparing options, evaluating trade-offs
- **Creative problem-solving** - Brainstorming, ideation

## The Magic Phrase

Simply adding "Let's think step-by-step" or "Reason through this carefully" can dramatically improve output quality.

## Example Comparison

### Without CoT:
❌ "Should we launch our product in Q1 or Q2?"
→ Gets a quick, surface-level answer

### With CoT:
✅ "We're deciding between Q1 and Q2 product launch. Consider these factors step-by-step:
1. Market conditions in each quarter
2. Competitor activity
3. Our team's readiness
4. Budget availability
5. Seasonal demand patterns

Think through each factor, then provide a recommendation with reasoning."

→ Gets a thorough, well-reasoned analysis

## Advanced CoT Techniques

### 1. Numbered Steps
```
Step 1: Analyze the problem
Step 2: Identify key variables
Step 3: Consider trade-offs
Step 4: Make recommendation
```

### 2. Structured Thinking
```
First, let's understand the situation...
Then, let's evaluate options...
Next, let's consider risks...
Finally, let's reach a conclusion...
```

### 3. Self-Questioning
```
Ask yourself:
- What assumptions am I making?
- What evidence supports each option?
- What could go wrong?
- What's the best outcome?
```

## Real-World Application

Use CoT whenever you need:
- Strategic recommendations
- Technical troubleshooting
- Content planning
- Risk assessment
- Competitive analysis""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_004",
            "module_id": "mod_001",
            "title": "Few-Shot Learning & Examples",
            "slug": "few-shot-learning-examples",
            "description": "Use examples to teach AI exactly what you want",
            "order_index": 4,
            "difficulty_level": "intermediate",
            "estimated_minutes": 55,
            "xp_reward": 200,
            "learning_objectives": [
                "Master few-shot prompting techniques",
                "Provide effective examples to guide AI output",
                "Create consistent, on-brand content at scale"
            ],
            "sections": [
                {
                    "title": "The Power of Examples",
                    "type": "content",
                    "order_index": 1,
                    "blocks": [
                        {
                            "id": "block_1",
                            "type": "heading",
                            "content": "Show, Don't Just Tell",
                            "level": 2,
                            "order_index": 0
                        },
                        {
                            "id": "block_2",
                            "type": "gif",
                            "url": "/api/uploads/image/few_shot_examples_demo.gif",
                            "caption": "Watch how providing 2-3 examples dramatically improves AI output consistency",
                            "alt_text": "Animated demonstration showing the transformation from vague prompts to few-shot prompts with examples",
                            "order_index": 1
                        },
                        {
                            "id": "block_3",
                            "type": "text",
                            "content": "Few-shot learning is one of the most powerful techniques in prompt engineering. Instead of describing what you want, you SHOW the AI with examples.",
                            "order_index": 2
                        }
                    ]
                }
            ],
            "content": """# Few-Shot Learning & Examples

## What is Few-Shot Learning?

Few-shot learning means providing 2-4 examples of the desired output format, style, or structure. The AI learns from these examples and replicates the pattern.

## Why Examples Work Better Than Instructions

🎯 **The Problem with Instructions:**
"Write in a casual, friendly tone with short paragraphs and occasional humor."

✅ **The Solution with Examples:**
[Show 2 examples of the exact style you want]

The AI will match your examples more accurately than it will follow abstract instructions.

## How to Structure Few-Shot Prompts

### Template:
```
Task: [What you want]

Examples:

Input: [Example input 1]
Output: [Example output 1]

Input: [Example input 2]
Output: [Example output 2]

Now, do this:
Input: [Your actual input]
Output: [AI generates here]
```

## Real Example: Product Descriptions

```
Task: Write engaging product descriptions

Examples:

Input: Wireless Earbuds
Output: "Tired of tangled cables? These sleek wireless earbuds deliver crystal-clear audio and 24-hour battery life. Your commute just got way better. 🎧"

Input: Coffee Maker
Output: "Brewing perfection, one cup at a time. This programmable coffee maker knows you're not a morning person—that's why it starts before you wake up. ☕"

Now create one for:
Input: Smart Watch
Output: [AI generates matching style]
```

## When to Use Few-Shot

Use few-shot prompting for:
- ✅ Maintaining brand voice
- ✅ Consistent formatting (tables, lists, structures)
- ✅ Specific writing styles
- ✅ Data transformation patterns
- ✅ Code generation with patterns

## Pro Tips

1. **Use 2-4 examples** - More isn't always better
2. **Show diversity** - Cover different scenarios
3. **Be consistent** - Examples should match each other in style
4. **Include edge cases** - Show how to handle unusual inputs

## Common Mistakes

❌ Inconsistent examples
❌ Too many examples (>5)
❌ Examples don't match desired output
❌ No clear input/output distinction""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_005",
            "module_id": "mod_001",
            "title": "Advanced Prompt Engineering",
            "slug": "advanced-prompt-engineering",
            "description": "Master advanced techniques: personas, constraints, and iteration",
            "order_index": 5,
            "difficulty_level": "advanced",
            "estimated_minutes": 70,
            "xp_reward": 250,
            "learning_objectives": [
                "Create detailed AI personas for specialized tasks",
                "Use advanced constraints for precision control",
                "Iterate and refine prompts systematically"
            ],
            "content": """# Advanced Prompt Engineering

## Creating Powerful Personas

Go beyond simple roles—create detailed personas:

### Basic Role:
"You are a marketing expert"

### Advanced Persona:
```
You are Sarah Chen, CMO of a Series B SaaS company with 10 years experience in B2B marketing. 
You specialize in demand generation and have launched 15+ successful campaigns generating $50M+ in pipeline. 
You think strategically but stay grounded in data. 
Your communication style is direct, actionable, and metric-focused.
```

**Impact:** More consistent, higher-quality, persona-appropriate responses.

## Advanced Constraints

### 1. Structural Constraints
```
Format your response as:
- Executive Summary (2 sentences)
- Key Points (3 bullet points, max 15 words each)
- Action Items (numbered list with owners and deadlines)
- Risks (table with 3 columns: Risk, Impact, Mitigation)
```

### 2. Cognitive Constraints
```
Constraints:
- Think like a CFO reviewing this
- Challenge every assumption
- Flag any unsupported claims
- Provide confidence levels (High/Medium/Low) for each recommendation
```

### 3. Quality Constraints
```
Requirements:
- No marketing jargon
- Every claim must have supporting data
- Use active voice only
- Write at 8th grade reading level
- Include 1-2 specific examples per point
```

## The Iteration Framework

### Step 1: Start Broad
Create a basic prompt and generate output

### Step 2: Identify Gaps
What's missing? What's wrong? What could be better?

### Step 3: Add Specificity
Add constraints, examples, or context to address gaps

### Step 4: Test and Refine
Generate again. Repeat until output meets requirements.

### Example Iteration:

**Version 1:** "Write a blog post about AI"
→ Too generic, unfocused

**Version 2:** "Write a 500-word blog post about AI in marketing for small business owners"
→ Better, but tone is off

**Version 3:** "You are a marketing consultant who helps small businesses. Write a 500-word blog post about AI in marketing. Use a friendly, encouraging tone. Include 3 specific, affordable AI tools they can start using today. Write at an 8th-grade level."
→ Much better!

**Version 4:** "You are Maria Rodriguez, a marketing consultant specializing in small businesses with <$1M revenue. Write a 500-word blog post titled '3 AI Tools That'll Save You 10 Hours Per Week (For Under $50/Month)'. 

Tone: Warm, encouraging, practical—like talking to a friend.

Structure:
- Hook: A relatable problem small business owners face
- Tool 1: [Name, use case, time saved, cost]
- Tool 2: [Same format]
- Tool 3: [Same format]
- CTA: Encouraging next step

Include one short personal anecdote. Write at 8th-grade level. No jargon."
→ Perfect!

## Meta-Prompting

Ask the AI to help improve prompts:

```
"I'm trying to get better output for [task]. Here's my current prompt: [your prompt]

Analyze this prompt and suggest 3 specific improvements based on:
1. The 4 Core Elements framework
2. Clarity and specificity
3. Likely output quality

Then rewrite the prompt incorporating your suggestions."
```

## Advanced Techniques Cheat Sheet

| Technique | When to Use | Example Phrase |
|-----------|-------------|----------------|
| **Role Playing** | Need expert perspective | "As a [detailed persona]..." |
| **Chain of Thought** | Complex analysis | "Let's think step-by-step..." |
| **Few-Shot** | Consistent formatting | "Here are 3 examples..." |
| **Constraints** | Precise control | "Requirements: [specific list]" |
| **Iteration** | Refining output | "This is close, but adjust [X]..." |
| **Meta-Prompting** | Improving prompts | "Help me improve this prompt..." |

## Your Prompt Engineering Toolkit

1. **Start with the 4 Core Elements**
2. **Add examples when you need consistency**
3. **Use Chain of Thought for complex reasoning**
4. **Create detailed personas for specialized tasks**
5. **Iterate based on output quality**
6. **Test multiple variations**

## Practice Makes Perfect

The best prompt engineers spend 80% of their time refining prompts and 20% reviewing outputs. Your prompt is the blueprint—invest time in making it great.""",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ])
    
    # MODULE 2: AI for Data & Analysis (5 lessons)
    lessons.extend([
        {
            "lesson_id": "les_006",
            "module_id": "mod_002",
            "title": "AI-Powered Data Interpretation",
            "slug": "ai-data-interpretation",
            "description": "Transform raw data into actionable insights",
            "order_index": 1,
            "difficulty_level": "intermediate",
            "estimated_minutes": 60,
            "xp_reward": 200,
            "learning_objectives": [
                "Use AI to analyze datasets and identify patterns",
                "Generate data-driven insights and recommendations",
                "Create executive summaries from complex data"
            ],
            "sections": [
                {
                    "title": "Understanding Data with AI",
                    "type": "content",
                    "order_index": 1,
                    "blocks": [
                        {
                            "id": "block_1",
                            "type": "heading",
                            "content": "From Numbers to Insights",
                            "level": 2,
                            "order_index": 0
                        },
                        {
                            "id": "block_2",
                            "type": "gif",
                            "url": "/api/uploads/image/data_interpretation_demo.gif",
                            "caption": "Watch AI transform a raw dataset into a clear, actionable insight summary",
                            "alt_text": "Animated demo of AI analyzing sales data and generating insights",
                            "order_index": 1
                        },
                        {
                            "id": "block_3",
                            "type": "text",
                            "content": "AI excels at finding patterns humans might miss. In this lesson, you'll learn to prompt AI to analyze data and extract meaningful insights quickly.",
                            "order_index": 2
                        }
                    ]
                }
            ],
            "content": """# AI-Powered Data Interpretation

## The Data Analysis Challenge

As a professional, you're constantly faced with spreadsheets, reports, and datasets. The challenge isn't getting the data—it's understanding what it means and what to do about it.

## How AI Transforms Data Analysis

AI can:
- **Identify patterns** you might overlook
- **Summarize complex datasets** in seconds
- **Generate hypotheses** about what's driving trends
- **Provide recommendations** based on the data

## The Data Interpretation Framework

### Step 1: Describe Your Data
```
I have a dataset with the following columns:
- Date (MM/DD/YYYY)
- Product Category
- Units Sold
- Revenue
- Customer Segment
- Region

Time period: January 2024 - December 2024
Total rows: 5,247
```

### Step 2: Ask Specific Questions
```
Analyze this data and tell me:
1. Which product categories are growing vs. declining?
2. Are there seasonal patterns?
3. Which customer segments are most valuable?
4. Any unusual trends or anomalies?
```

### Step 3: Request Structured Output
```
Format your analysis as:
- Executive Summary (3 sentences)
- Key Findings (5 bullet points)
- Trends & Patterns (with specific numbers)
- Recommendations (3 actionable items)
```

## Practical Example

**Prompt:**
```
You are a business analyst with expertise in retail data.

I have sales data for a clothing retailer with these columns:
[Date, Product_Type, Units_Sold, Revenue, Store_Location, Customer_Age_Group]

Dataset covers Q1-Q4 2024, 12,450 transactions.

Analyze this data and identify:
1. Top performing product categories by revenue
2. Store location performance comparison
3. Age group preferences by product type
4. Month-over-month growth trends
5. Any concerning patterns or opportunities

Provide:
- Executive summary (2-3 sentences)
- 5 key insights with specific numbers
- 3 actionable recommendations
- One data visualization suggestion

Think step-by-step through the analysis.
```

## Advanced Techniques

### 1. Comparative Analysis
Ask AI to compare time periods, segments, or categories

### 2. Root Cause Analysis
Use Chain of Thought to dig into "why" behind the numbers

### 3. Predictive Questions
"Based on this data, what might happen if..."

## Common Pitfalls to Avoid

❌ Uploading data without context
❌ Asking vague questions like "analyze this"
❌ Not specifying output format
❌ Ignoring data quality issues

✅ Provide data structure description
✅ Ask specific, focused questions
✅ Request structured, actionable output
✅ Acknowledge data limitations""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_007",
            "module_id": "mod_002",
            "title": "Creating Data Visualizations with AI",
            "slug": "ai-data-visualizations",
            "description": "Generate charts, graphs, and visual data stories",
            "order_index": 2,
            "difficulty_level": "intermediate",
            "estimated_minutes": 55,
            "xp_reward": 175,
            "learning_objectives": [
                "Prompt AI to suggest appropriate visualization types",
                "Generate chart specifications and descriptions",
                "Create compelling data narratives"
            ],
            "content": """# Creating Data Visualizations with AI

[Content for visualization lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_008",
            "module_id": "mod_002",
            "title": "Predictive Analysis & Forecasting",
            "slug": "predictive-analysis-forecasting",
            "description": "Use AI for trend analysis and predictions",
            "order_index": 3,
            "difficulty_level": "advanced",
            "estimated_minutes": 65,
            "xp_reward": 225,
            "learning_objectives": [
                "Identify trends in historical data",
                "Generate forecasts and projections",
                "Assess risk and uncertainty in predictions"
            ],
            "content": """# Predictive Analysis & Forecasting

[Content for forecasting lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_009",
            "module_id": "mod_002",
            "title": "SQL Query Generation & Database Analysis",
            "slug": "sql-query-generation",
            "description": "Generate and optimize SQL queries with AI",
            "order_index": 4,
            "difficulty_level": "intermediate",
            "estimated_minutes": 50,
            "xp_reward": 200,
            "learning_objectives": [
                "Transform business questions into SQL queries",
                "Optimize database queries for performance",
                "Debug and explain complex SQL"
            ],
            "content": """# SQL Query Generation & Database Analysis

[Content for SQL lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_010",
            "module_id": "mod_002",
            "title": "Business Intelligence Reports",
            "slug": "business-intelligence-reports",
            "description": "Create comprehensive BI reports with AI assistance",
            "order_index": 5,
            "difficulty_level": "advanced",
            "estimated_minutes": 70,
            "xp_reward": 250,
            "learning_objectives": [
                "Structure executive-level BI reports",
                "Combine multiple data sources",
                "Generate actionable recommendations"
            ],
            "content": """# Business Intelligence Reports

[Content for BI reports lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ])
    
    # MODULE 3: AI for Business Writing (5 lessons)
    lessons.extend([
        {
            "lesson_id": "les_011",
            "module_id": "mod_003",
            "title": "Professional Emails & Memos",
            "slug": "professional-emails-memos",
            "description": "Craft effective business communications",
            "order_index": 1,
            "difficulty_level": "beginner",
            "estimated_minutes": 45,
            "xp_reward": 150,
            "learning_objectives": [
                "Write clear, concise business emails",
                "Adapt tone for different audiences",
                "Structure memos and announcements effectively"
            ],
            "content": """# Professional Emails & Memos

[Content with GIF demonstrations]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_012",
            "module_id": "mod_003",
            "title": "Reports & Documentation",
            "slug": "reports-documentation",
            "description": "Create comprehensive business reports",
            "order_index": 2,
            "difficulty_level": "intermediate",
            "estimated_minutes": 65,
            "xp_reward": 200,
            "learning_objectives": [
                "Structure long-form reports",
                "Maintain consistency across sections",
                "Create executive summaries"
            ],
            "content": """# Reports & Documentation

[Content for reports lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_013",
            "module_id": "mod_003",
            "title": "Proposals & Business Cases",
            "slug": "proposals-business-cases",
            "description": "Build persuasive business proposals",
            "order_index": 3,
            "difficulty_level": "advanced",
            "estimated_minutes": 75,
            "xp_reward": 250,
            "learning_objectives": [
                "Structure winning proposals",
                "Calculate and present ROI",
                "Address objections proactively"
            ],
            "content": """# Proposals & Business Cases

[Content for proposals lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_014",
            "module_id": "mod_003",
            "title": "Marketing Copy & Content",
            "slug": "marketing-copy-content",
            "description": "Create engaging marketing materials",
            "order_index": 4,
            "difficulty_level": "intermediate",
            "estimated_minutes": 55,
            "xp_reward": 200,
            "learning_objectives": [
                "Write compelling headlines and hooks",
                "Create persuasive call-to-actions",
                "Adapt voice for different channels"
            ],
            "content": """# Marketing Copy & Content

[Content for marketing lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lesson_id": "les_015",
            "module_id": "mod_003",
            "title": "Editing & Refinement with AI",
            "slug": "editing-refinement-ai",
            "description": "Polish and perfect your writing",
            "order_index": 5,
            "difficulty_level": "intermediate",
            "estimated_minutes": 50,
            "xp_reward": 175,
            "learning_objectives": [
                "Use AI for content editing and improvement",
                "Adjust tone and style systematically",
                "Optimize for clarity and impact"
            ],
            "content": """# Editing & Refinement with AI

[Content for editing lesson]""",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ])
    
    return lessons

# Additional lessons for modules 4-7 will be added in part 2...
