"""
Quiz questions and applied learning exercises for all lessons
"""

def get_applied_exercises():
    """Applied learning exercises for each lesson"""
    return [
        # Module 1 - Lesson 1
        {
            "exercise_id": "ex_001",
            "lesson_id": "les_001",
            "description": "Create a professional email prompt using all 4 Core Elements",
            "prompt_template": "Create a prompt that will generate a professional email",
            "required_elements": [
                "Role/Persona - Define who the AI should be",
                "Task - Specify to write a professional email",
                "Context - Include audience, purpose, and tone",
                "Constraints - Add format, length, and style requirements"
            ],
            "passing_score": 75,
            "instructions": """Your task is to create a complete prompt that would generate a professional email. 

Your prompt must include ALL 4 Core Elements:
1. **Role** - Who should the AI act as?
2. **Task** - What specifically should it create?
3. **Context** - Who is the audience? What's the situation?
4. **Constraints** - What are the requirements (length, tone, format)?

Example of a good prompt:
"You are a customer service manager. Write a response email to a customer who complained about a delayed shipment. The customer is frustrated but has been loyal for 3 years. Tone: Apologetic but professional. Length: 150-200 words. Include: apology, explanation, compensation offer, and next steps."

Now create YOUR prompt for any professional email scenario."""
        },
        
        # Module 1 - Lesson 2
        {
            "exercise_id": "ex_002",
            "lesson_id": "les_002",
            "description": "Deconstruct a weak prompt and rebuild it with all 4 elements",
            "prompt_template": "Improve this weak prompt by adding missing elements",
            "required_elements": [
                "Identify what's missing from the original",
                "Add specific Role definition",
                "Clarify the Task with details",
                "Provide relevant Context",
                "Set clear Constraints"
            ],
            "passing_score": 75,
            "instructions": """Given this weak prompt: "Write something about team productivity"

Your task:
1. Identify which of the 4 Core Elements are missing
2. Rewrite it as a complete, effective prompt with ALL 4 elements

Your improved prompt should be detailed and specific enough that any AI would produce high-quality output."""
        },
        
        # Module 1 - Lesson 3
        {
            "exercise_id": "ex_003",
            "lesson_id": "les_003",
            "description": "Create a Chain of Thought prompt for a complex business decision",
            "prompt_template": "Use Chain of Thought to analyze a business scenario",
            "required_elements": [
                "Include 'step-by-step' or 'think through' language",
                "Break down the problem into stages",
                "Request reasoning for each stage",
                "Ask for a final recommendation with justification"
            ],
            "passing_score": 75,
            "instructions": """Create a prompt that uses Chain of Thought to help decide whether to:
- Launch a new product feature now or wait 3 months

Your prompt should:
- Ask AI to think step-by-step
- Consider multiple factors (market timing, competition, resources, risks)
- Show reasoning at each step
- Provide a final recommendation with clear justification

Use phrases like "Let's think through this step-by-step" or "Consider each factor carefully before concluding." """
        },
        
        # Module 1 - Lesson 4
        {
            "exercise_id": "ex_004",
            "lesson_id": "les_004",
            "description": "Create a few-shot prompt with 2-3 examples",
            "prompt_template": "Use few-shot learning to maintain consistent formatting",
            "required_elements": [
                "Provide 2-3 clear examples",
                "Show input/output pattern",
                "Examples demonstrate desired style/format",
                "Include your actual request after examples"
            ],
            "passing_score": 75,
            "instructions": """Create a few-shot prompt to generate social media posts in a specific style.

Your prompt must include:
1. A clear task description
2. 2-3 example posts showing the exact style you want
3. Your actual request for a new post

The AI should be able to match your examples' tone, length, and structure exactly."""
        },
        
        # Module 1 - Lesson 5
        {
            "exercise_id": "ex_005",
            "lesson_id": "les_005",
            "description": "Create an advanced prompt with detailed persona and multi-layered constraints",
            "prompt_template": "Build a sophisticated prompt using advanced techniques",
            "required_elements": [
                "Detailed persona (not just a role)",
                "Complex task with multiple components",
                "Rich context and background",
                "Multi-layered constraints (structure, style, quality)",
                "Clear success criteria"
            ],
            "passing_score": 80,
            "instructions": """Create a master-level prompt that demonstrates advanced techniques.

Your prompt should include:
1. A detailed persona with experience, specialty, and communication style
2. A complex task (e.g., strategic analysis, comprehensive plan)
3. Multiple constraints for structure, quality, and output format
4. Specific success criteria

This should be a prompt that would generate professional-grade output suitable for executives or clients."""
        },
        
        # Module 2 - Lesson 6
        {
            "exercise_id": "ex_006",
            "lesson_id": "les_006",
            "description": "Create a data analysis prompt with clear specifications",
            "prompt_template": "Prompt AI to analyze a dataset and extract insights",
            "required_elements": [
                "Describe the dataset structure",
                "Ask specific analytical questions",
                "Request structured output format",
                "Include request for actionable recommendations"
            ],
            "passing_score": 75,
            "instructions": """Create a prompt to analyze business data.

Your prompt must:
1. Describe your data (columns, time period, size)
2. Ask 3-5 specific questions about the data
3. Specify output format (executive summary, findings, recommendations)
4. Request data visualization suggestions

Imagine you're asking AI to analyze sales, customer, or financial data for your business."""
        }
    ]

def get_quiz_questions():
    """Quiz questions for each lesson"""
    return [
        # Module 1 - Lesson 1 Quiz
        {
            "lesson_id": "les_001",
            "question_id": "q_001_1",
            "question": "Which of the following is NOT one of the 4 Core Elements of effective prompts?",
            "options": [
                "Role/Persona",
                "Creativity",
                "Context",
                "Constraints"
            ],
            "correct_answer": 1,
            "explanation": "The 4 Core Elements are: Role, Task, Context, and Constraints. Creativity is not one of the core elements.",
            "order_index": 1
        },
        {
            "lesson_id": "les_001",
            "question_id": "q_001_2",
            "question": "What does the 'Context' element provide in a prompt?",
            "options": [
                "The AI model to use",
                "Background information like audience, tone, and purpose",
                "The number of words required",
                "The file format for output"
            ],
            "correct_answer": 1,
            "explanation": "Context provides background information such as the target audience, desired tone, and the purpose of the content. This helps AI generate more relevant and appropriate responses.",
            "order_index": 2
        },
        {
            "lesson_id": "les_001",
            "question_id": "q_001_3",
            "question": "Which prompt demonstrates the 'Role' element effectively?",
            "options": [
                "Write a blog post",
                "You are an expert marketing consultant with 15 years of B2B experience",
                "Make it 500 words",
                "The audience is small business owners"
            ],
            "correct_answer": 1,
            "explanation": "The Role element defines who the AI should act as. Option 2 creates a detailed persona for the AI to embody.",
            "order_index": 3
        },
        {
            "lesson_id": "les_001",
            "question_id": "q_001_4",
            "question": "Why do constraints improve AI output quality?",
            "options": [
                "They make the prompt longer",
                "They limit the AI's creativity",
                "They provide specific boundaries and requirements for the output",
                "They make the AI work faster"
            ],
            "correct_answer": 2,
            "explanation": "Constraints provide specific boundaries (format, length, style) that guide the AI to produce output that meets your exact requirements.",
            "order_index": 4
        },
        {
            "lesson_id": "les_001",
            "question_id": "q_001_5",
            "question": "What happens when you omit the Task element from a prompt?",
            "options": [
                "The AI will choose the best task automatically",
                "The prompt becomes more flexible",
                "The AI doesn't know what specific action to take",
                "The output quality improves"
            ],
            "correct_answer": 2,
            "explanation": "Without a clear Task, the AI doesn't know what specific action you want it to perform, leading to vague or irrelevant outputs.",
            "order_index": 5
        },
        
        # Module 1 - Lesson 2 Quiz
        {
            "lesson_id": "les_002",
            "question_id": "q_002_1",
            "question": "When breaking down a prompt, what should you identify first?",
            "options": [
                "The constraints",
                "Which of the 4 Core Elements are present or missing",
                "The word count",
                "The AI model to use"
            ],
            "correct_answer": 1,
            "explanation": "First identify which Core Elements are present or missing. This helps you understand what needs to be added or improved.",
            "order_index": 1
        },
        {
            "lesson_id": "les_002",
            "question_id": "q_002_2",
            "question": "Which demonstrates better use of the 4 Core Elements?",
            "options": [
                "Write an email about the meeting",
                "As a project manager, draft a 200-word follow-up email to the client about yesterday's strategy meeting. Include: key decisions, next steps, and timeline. Tone: Professional but warm.",
                "Send an email",
                "Write something for the client"
            ],
            "correct_answer": 1,
            "explanation": "Option 2 includes all 4 elements: Role (project manager), Task (draft email), Context (client, strategy meeting), and Constraints (200 words, specific inclusions, tone).",
            "order_index": 2
        },
        {
            "lesson_id": "les_002",
            "question_id": "q_002_3",
            "question": "What is the recommended order for building prompts?",
            "options": [
                "Constraints → Context → Role → Task",
                "Role → Task → Context → Constraints",
                "Task → Role → Constraints → Context",
                "Any order works equally well"
            ],
            "correct_answer": 1,
            "explanation": "Starting with Role and Task establishes the foundation. Then add Context for relevance, and finally Constraints for precision.",
            "order_index": 3
        },
        
        # Module 1 - Lesson 3 Quiz
        {
            "lesson_id": "les_003",
            "question_id": "q_003_1",
            "question": "What is Chain of Thought (CoT) prompting?",
            "options": [
                "Writing very long prompts",
                "Asking AI to reason through problems step-by-step before answering",
                "Using multiple AI models simultaneously",
                "Chaining several prompts together"
            ],
            "correct_answer": 1,
            "explanation": "Chain of Thought prompting asks the AI to explicitly show its reasoning process step-by-step, which improves accuracy on complex tasks.",
            "order_index": 1
        },
        {
            "lesson_id": "les_003",
            "question_id": "q_003_2",
            "question": "When should you use Chain of Thought prompting?",
            "options": [
                "For simple, straightforward questions",
                "For complex analysis, multi-step problems, and decision-making",
                "Only for mathematical calculations",
                "Never - it makes responses too long"
            ],
            "correct_answer": 1,
            "explanation": "CoT is most effective for complex tasks that benefit from structured reasoning: analysis, strategy, troubleshooting, and decisions.",
            "order_index": 2
        },
        {
            "lesson_id": "les_003",
            "question_id": "q_003_3",
            "question": "Which phrase effectively triggers Chain of Thought reasoning?",
            "options": [
                "Be quick",
                "Let's think step-by-step",
                "Give me the answer",
                "Make it short"
            ],
            "correct_answer": 1,
            "explanation": "'Let's think step-by-step' explicitly instructs the AI to show its reasoning process, triggering Chain of Thought behavior.",
            "order_index": 3
        },
        
        # Module 1 - Lesson 4 Quiz
        {
            "lesson_id": "les_004",
            "question_id": "q_004_1",
            "question": "What is few-shot learning in prompt engineering?",
            "options": [
                "Using very short prompts",
                "Providing 2-4 examples to show the AI the desired output pattern",
                "Testing multiple AI models",
                "Limiting the AI's token usage"
            ],
            "correct_answer": 1,
            "explanation": "Few-shot learning involves providing 2-4 examples that demonstrate the exact format, style, or structure you want the AI to replicate.",
            "order_index": 1
        },
        {
            "lesson_id": "les_004",
            "question_id": "q_004_2",
            "question": "How many examples are typically recommended for few-shot prompting?",
            "options": [
                "1",
                "2-4",
                "10-15",
                "As many as possible"
            ],
            "correct_answer": 1,
            "explanation": "2-4 examples is the sweet spot - enough to show the pattern clearly without making the prompt too long or confusing.",
            "order_index": 2
        },
        {
            "lesson_id": "les_004",
            "question_id": "q_004_3",
            "question": "Why do examples work better than instructions?",
            "options": [
                "They're shorter",
                "AI can pattern-match from concrete examples more accurately than interpreting abstract instructions",
                "They use less processing power",
                "Examples are easier to write"
            ],
            "correct_answer": 1,
            "explanation": "AI excels at pattern recognition. Concrete examples provide clear patterns to match, while abstract instructions leave room for interpretation.",
            "order_index": 3
        },
        
        # Module 1 - Lesson 5 Quiz
        {
            "lesson_id": "les_005",
            "question_id": "q_005_1",
            "question": "What makes an 'advanced persona' more effective than a basic role?",
            "options": [
                "It's longer",
                "It includes specific experience, expertise, and communication style",
                "It uses more technical language",
                "It mentions more AI models"
            ],
            "correct_answer": 1,
            "explanation": "Advanced personas include rich details about experience, specialization, and communication style, creating more consistent and appropriate responses.",
            "order_index": 1
        },
        {
            "lesson_id": "les_005",
            "question_id": "q_005_2",
            "question": "What is 'meta-prompting'?",
            "options": [
                "Using AI on Mars",
                "Asking AI to help improve your prompts",
                "Running multiple prompts simultaneously",
                "Translating prompts to other languages"
            ],
            "correct_answer": 1,
            "explanation": "Meta-prompting is asking the AI to analyze and suggest improvements to your prompts, helping you learn and iterate faster.",
            "order_index": 2
        },
        {
            "lesson_id": "les_005",
            "question_id": "q_005_3",
            "question": "In the iteration framework, when should you stop refining a prompt?",
            "options": [
                "After the first attempt",
                "When the output meets your quality requirements",
                "After exactly 3 iterations",
                "Never - always iterate indefinitely"
            ],
            "correct_answer": 1,
            "explanation": "Iterate until the output consistently meets your requirements. Some prompts need 2 iterations, others need 5+. Quality is the criterion, not count.",
            "order_index": 3
        }
    ]
