# E-Quipped AI Mastery Platform - Interactive Features Guide

## 🎨 **FloatingSandbox - Ghost Mode**

### Overview
The FloatingSandbox is an advanced, floating learning interface with true "ghost mode" - a transparent state showing only a color gradient outline.

### Features

#### **1. Ghost Mode (Transparent)**
- **Appearance**: Only colored gradient outline visible, completely transparent inside
- **Animation**: Rainbow gradient rotates around the border
- **Behavior**: 
  - Click INSIDE the box → Becomes opaque
  - Click OUTSIDE the box → Becomes transparent
  - Displays "Click to open" hint in center

#### **2. Opaque Mode (Active)**
- **Appearance**: Solid dark background with full content
- **Controls visible**: 
  - Mode switcher (Applied Learning / Quiz / Sandbox)
  - Transparency toggle button
  - Close button
- **Draggable**: Click and hold top bar to move anywhere on screen
- **Resizable**: Drag bottom-right corner to resize (300-800px wide, 400-900px tall)

### Three Modes

#### **Applied Learning Mode**
- User writes a prompt
- AI Judge evaluates it (score 0-100)
- Must score 75+ to pass
- Shows detailed feedback and suggestions
- Unlocks quiz after passing

#### **Quiz Mode**
- Multiple choice questions
- Must complete Applied Learning first
- Shows real-time selection
- Instant grading on submission
- 70% required to pass
- Displays detailed feedback with explanations

#### **Sandbox Mode**
- Free-form AI chat
- Choose between GPT-5.2, Claude 4.5, Gemini 3
- Prompt quality scoring (optional)
- Tips and suggestions
- Unlimited practice

---

## 📚 **Interactive Lesson Components**

### 1. **Accordion**
Collapsible sections for organizing content.

**Usage in lesson data**:
```python
{
    "type": "accordion",
    "items": [
        {
            "title": "Section Title",
            "content": "Section content here",
            "defaultOpen": False,
            "variant": "primary"  # default, primary, success, warning, info
        }
    ]
}
```

**Variants**:
- `default`: White/gray theme
- `primary`: Fuchsia theme
- `success`: Green theme
- `warning`: Amber theme
- `info`: Blue theme

---

### 2. **Tabs**
Tabbed content for organizing related information.

**Usage in lesson data**:
```python
{
    "type": "tabs",
    "tabs": [
        {
            "label": "Tab 1",
            "content": "Content for tab 1"
        },
        {
            "label": "Tab 2",
            "content": "Content for tab 2"
        }
    ]
}
```

**Features**:
- Click to switch tabs
- Highlighted active tab
- Smooth transitions

---

### 3. **Callout**
Highlighted boxes for important information.

**Usage in lesson data**:
```python
{
    "type": "callout",
    "callout_type": "tip",  # tip, warning, info, success, error
    "title": "Pro Tip",
    "content": "Important information here",
    "collapsible": True  # Optional
}
```

**Types**:
- `tip`: Blue lightbulb icon
- `warning`: Amber alert icon
- `info`: Gray info icon
- `success`: Green checkmark icon
- `error`: Red X icon

---

### 4. **ChallengeBox**
Interactive checklist for lesson tasks.

**Usage in lesson data**:
```python
{
    "type": "challenge",
    "title": "Learning Challenge",
    "description": "Complete these tasks",
    "tasks": [
        {
            "title": "Task 1",
            "description": "Task description"
        },
        {
            "title": "Task 2",
            "description": "Task description"
        }
    ]
}
```

**Features**:
- Click to check off tasks
- Progress bar
- Celebration when complete
- Green highlight for completed items

---

### 5. **CodeComparison**
Side-by-side comparison of bad vs good code/prompts.

**Usage in lesson data**:
```python
{
    "type": "code_comparison",
    "badLabel": "❌ Bad Example",
    "bad": "Bad code or prompt here",
    "goodLabel": "✅ Good Example",
    "good": "Good code or prompt here"
}
```

**Features**:
- Red border for bad example
- Green border for good example
- Side-by-side layout
- Code formatting

---

### 6. **QuickQuiz**
Inline quiz questions for immediate practice.

**Usage in lesson data**:
```python
{
    "type": "quiz",
    "question": "What is the answer?",
    "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
    ],
    "correctAnswer": 2,  # 0-indexed
    "explanation": "Explanation of the correct answer"
}
```

**Features**:
- Click to answer
- Immediate feedback
- Shows explanation
- "Try again" option
- Green for correct, red for incorrect

---

### 7. **StepGuide**
Step-by-step walkthrough with navigation.

**Usage in lesson data**:
```python
{
    "type": "steps",
    "steps": [
        {
            "title": "Step 1",
            "content": "Do this first"
        },
        {
            "title": "Step 2",
            "content": "Then do this"
        }
    ]
}
```

**Features**:
- Previous/Next buttons
- Progress dots
- Step counter
- Guided navigation

---

## 🎯 **How to Add Interactive Content to Lessons**

### Method 1: Using Sections and Blocks
Add sections to your lesson data:

```python
{
    "lesson_id": "les_001",
    "title": "Lesson Title",
    "sections": [
        {
            "title": "Section Title",
            "type": "content",
            "order_index": 1,
            "blocks": [
                {
                    "id": "block_1",
                    "type": "heading",
                    "content": "Heading Text",
                    "level": 2,
                    "order_index": 0
                },
                {
                    "id": "block_2",
                    "type": "text",
                    "content": "Paragraph text",
                    "order_index": 1
                },
                {
                    "id": "block_3",
                    "type": "accordion",
                    "items": [
                        {
                            "title": "Expandable Section",
                            "content": "Hidden content",
                            "defaultOpen": False
                        }
                    ],
                    "order_index": 2
                }
            ]
        }
    ]
}
```

### Method 2: Markdown-style in Content Field
The system auto-parses basic markdown:
- `# Heading 1`
- `## Heading 2`
- `### Heading 3`
- `- List item`
- `* List item`
- Regular paragraphs

---

## 📦 **Available Block Types**

| Type | Purpose | Key Props |
|------|---------|-----------|
| `heading` | Section headings | `content`, `level` (1-6) |
| `text` | Paragraphs | `content` |
| `gif` | Animated demos | `url`, `caption`, `alt_text` |
| `code` | Code snippets | `content`, `language` |
| `callout` | Highlighted info | `callout_type`, `title`, `content` |
| `accordion` | Collapsible sections | `items[]` |
| `tabs` | Tabbed content | `tabs[]` |
| `challenge` | Task checklist | `title`, `tasks[]` |
| `code_comparison` | Side-by-side compare | `bad`, `good` |
| `quiz` | Inline quiz | `question`, `options[]`, `correctAnswer` |
| `steps` | Step-by-step guide | `steps[]` |

---

## 🎨 **Styling System**

### Color Variants
- **Primary**: Fuchsia/Purple gradient
- **Success**: Green
- **Warning**: Amber
- **Info**: Blue
- **Error**: Red
- **Default**: Slate/Gray

### Responsive Design
- Desktop: Full features
- Tablet: Adapted layout
- Mobile: Optimized for touch

---

## 🚀 **Best Practices**

### 1. Lesson Structure
- Start with overview callout
- Use accordions for FAQ sections
- Add challenge boxes for hands-on tasks
- Include quick quizzes throughout
- End with step guide for next actions

### 2. Interactive Element Placement
- Don't overuse - 2-3 interactive elements per lesson section
- Place quizzes after teaching concepts
- Use challenge boxes at the end of sections
- Code comparisons immediately after explaining concepts

### 3. Ghost Mode Usage
- Teaches users where sandbox is
- Allows reading content without obstruction
- Click inside to interact
- Auto-hides when clicking outside

---

## 🔧 **Technical Details**

### FloatingSandbox State Management
- Position: `{ x, y }` in pixels
- Size: `{ width, height }` in pixels
- Transparency: Boolean toggle
- Mode: 'sandbox' | 'applied' | 'quiz'

### Interactive Components
- All components are React functional components
- Use Tailwind CSS for styling
- Lucide icons for UI elements
- Smooth animations with CSS transitions

### Data Flow
1. Lesson loaded from backend
2. Sections and blocks parsed
3. Components rendered dynamically
4. User interactions tracked
5. Progress saved to backend

---

## 📝 **Example: Complete Interactive Lesson**

See `/app/backend/enhanced_lesson_example.py` for a full example of Lesson 1 with all interactive components demonstrated.

---

## 🎯 **Quick Start Checklist**

- [ ] Backend running with 7 modules, 37 lessons
- [ ] Frontend compiled successfully
- [ ] FloatingSandbox appears on lesson page
- [ ] Can drag and resize sandbox
- [ ] Ghost mode (transparent) works
- [ ] Click inside → opaque, click outside → transparent
- [ ] Applied Learning AI evaluation working
- [ ] Quiz system functional
- [ ] Interactive components rendering in lessons

---

## 🆘 **Troubleshooting**

### Sandbox Not Appearing
- Check console for errors
- Verify FloatingSandbox import in App.js
- Ensure lessonId is being passed

### Ghost Mode Not Working
- Check if isTransparent state is toggling
- Verify click handlers are attached
- Look for z-index conflicts

### Interactive Components Not Rendering
- Check lesson data structure
- Verify block type names match exactly
- Check console for component errors
- Ensure InteractiveLessonComponents are imported

---

Ready to create amazing interactive lessons! 🚀
