"""
Enhanced interactive lesson content - Example for Lesson 1
This shows how to structure lessons with interactive components
"""

def get_enhanced_lesson_1_sections():
    """Example of lesson with interactive components"""
    return [
        {
            "title": "Welcome to AI Mastery",
            "type": "content",
            "order_index": 1,
            "blocks": [
                {
                    "id": "block_1",
                    "type": "heading",
                    "content": "What You'll Learn",
                    "level": 2,
                    "order_index": 0
                },
                {
                    "id": "block_2",
                    "type": "text",
                    "content": "In this lesson, you'll discover the foundations of working with AI language models. You'll learn how these powerful tools think and how to communicate with them effectively.",
                    "order_index": 1
                },
                {
                    "id": "block_3",
                    "type": "challenge",
                    "title": "🎯 Quick Start Challenge",
                    "description": "Check these off as you complete each section",
                    "tasks": [
                        {
                            "title": "Understand how AI models work",
                            "description": "Learn the basics of LLMs"
                        },
                        {
                            "title": "Learn the 4 Core Elements",
                            "description": "Master Role, Task, Context, Constraints"
                        },
                        {
                            "title": "See examples of good vs bad prompts",
                            "description": "Compare prompt quality"
                        }
                    ],
                    "order_index": 2
                }
            ]
        },
        {
            "title": "Understanding AI Language Models",
            "type": "content",
            "order_index": 2,
            "blocks": [
                {
                    "id": "block_4",
                    "type": "callout",
                    "callout_type": "info",
                    "title": "Key Concept",
                    "content": "AI models like GPT, Claude, and Gemini are trained on vast amounts of text data. They predict the most likely next words based on patterns they've learned. Think of them as incredibly sophisticated autocomplete systems.",
                    "collapsible": False,
                    "order_index": 0
                },
                {
                    "id": "block_5",
                    "type": "accordion",
                    "items": [
                        {
                            "title": "How do AI models 'think'?",
                            "content": "AI doesn't understand like humans do—it recognizes patterns and generates responses that match those patterns. It's more like pattern matching than true comprehension.",
                            "defaultOpen": False,
                            "variant": "info"
                        },
                        {
                            "title": "What makes prompts important?",
                            "content": "Your prompt is the AI's only instruction manual. A better prompt = better output. It's that simple! The quality of your results is 90% determined by your prompt.",
                            "defaultOpen": False,
                            "variant": "primary"
                        },
                        {
                            "title": "Can AI really understand context?",
                            "content": "AI doesn't 'understand' context like humans, but it can use contextual clues in your prompt to generate more relevant responses. The more context you provide, the better the output.",
                            "defaultOpen": False,
                            "variant": "default"
                        }
                    ],
                    "order_index": 1
                }
            ]
        },
        {
            "title": "The 4 Core Elements Framework",
            "type": "content",
            "order_index": 3,
            "blocks": [
                {
                    "id": "block_6",
                    "type": "heading",
                    "content": "Every effective prompt needs these 4 elements:",
                    "level": 3,
                    "order_index": 0
                },
                {
                    "id": "block_7",
                    "type": "tabs",
                    "tabs": [
                        {
                            "label": "1. Role/Persona",
                            "content": [
                                "Define who the AI should act as:",
                                "• 'You are an expert marketing consultant'",
                                "• 'Act as a technical writer'",
                                "• 'You are a helpful career advisor'",
                                "",
                                "The role sets the AI's perspective and expertise level."
                            ]
                        },
                        {
                            "label": "2. Task",
                            "content": [
                                "Be specific about what you want:",
                                "• 'Create a...'",
                                "• 'Analyze this...'",
                                "• 'Write a...'",
                                "",
                                "Clear tasks get clear results. Vague tasks get vague results."
                            ]
                        },
                        {
                            "label": "3. Context",
                            "content": [
                                "Provide background information:",
                                "• Audience (who is this for?)",
                                "• Tone (professional, casual, friendly?)",
                                "• Purpose (why are you creating this?)",
                                "",
                                "Context makes output relevant and appropriate."
                            ]
                        },
                        {
                            "label": "4. Constraints",
                            "content": [
                                "Set boundaries and requirements:",
                                "• Format (bullet points, paragraph, etc.)",
                                "• Length (word count, character limit)",
                                "• Style guidelines",
                                "• What to include/exclude",
                                "",
                                "Constraints give you precise control over output."
                            ]
                        }
                    ],
                    "order_index": 1
                }
            ]
        },
        {
            "title": "Good vs Bad Prompts",
            "type": "content",
            "order_index": 4,
            "blocks": [
                {
                    "id": "block_8",
                    "type": "code_comparison",
                    "badLabel": "❌ Bad Prompt",
                    "bad": "Write something about marketing",
                    "goodLabel": "✅ Good Prompt",
                    "good": "You are a senior marketing strategist.\n\nCreate a 300-word email campaign outline for a B2B SaaS product targeting IT directors.\n\nUse a professional but approachable tone.\n\nInclude:\n- Subject line\n- Opening hook\n- 3 key benefits\n- Call-to-action",
                    "order_index": 0
                },
                {
                    "id": "block_9",
                    "type": "callout",
                    "callout_type": "tip",
                    "title": "Pro Tip",
                    "content": "The difference between mediocre and exceptional AI outputs is 90% about the prompt. Master prompting, and you'll 10x your productivity!",
                    "collapsible": False,
                    "order_index": 1
                }
            ]
        },
        {
            "title": "Test Your Knowledge",
            "type": "content",
            "order_index": 5,
            "blocks": [
                {
                    "id": "block_10",
                    "type": "quiz",
                    "question": "Which of the following is NOT one of the 4 Core Elements?",
                    "options": [
                        "Role/Persona",
                        "Creativity Level",
                        "Context",
                        "Constraints"
                    ],
                    "correctAnswer": 1,
                    "explanation": "The 4 Core Elements are: Role, Task, Context, and Constraints. Creativity is not a core element, though tone can be specified in Context.",
                    "order_index": 0
                },
                {
                    "id": "block_11",
                    "type": "quiz",
                    "question": "What percentage of AI output quality comes from the prompt?",
                    "options": [
                        "30%",
                        "50%",
                        "70%",
                        "90%"
                    ],
                    "correctAnswer": 3,
                    "explanation": "Approximately 90% of output quality is determined by the prompt. The better your prompt, the better the results!",
                    "order_index": 1
                }
            ]
        },
        {
            "title": "Next Steps",
            "type": "content",
            "order_index": 6,
            "blocks": [
                {
                    "id": "block_12",
                    "type": "steps",
                    "steps": [
                        {
                            "title": "Practice with the Sandbox",
                            "content": "Try creating prompts in the AI Sandbox. Use all 4 Core Elements and see how the AI responds."
                        },
                        {
                            "title": "Complete Applied Learning",
                            "content": "Write a professional prompt that will be evaluated by our AI Judge. You must pass to unlock the quiz."
                        },
                        {
                            "title": "Take the Quiz",
                            "content": "Test your understanding with the lesson quiz. You need 70% to pass and move to the next lesson."
                        },
                        {
                            "title": "Move Forward",
                            "content": "Once you complete the quiz, you'll unlock the next lesson where you'll see the 4 Core Elements in action!"
                        }
                    ],
                    "order_index": 0
                },
                {
                    "id": "block_13",
                    "type": "callout",
                    "callout_type": "success",
                    "title": "Ready to Start?",
                    "content": "Open the floating sandbox and start practicing! Remember: Role, Task, Context, Constraints. You've got this! 🚀",
                    "collapsible": False,
                    "order_index": 1
                }
            ]
        }
    ]
