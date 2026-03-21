'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  Brush,
  CheckSquare,
  ClipboardCheck,
  ChevronRight,
  Code,
  Database,
  Filter,
  Languages,
  Lightbulb,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuthStore, useDashboardStore, type LearningPath, type Skill } from '@/lib/store'
import { cn } from '@/lib/utils'

const SkillRadar = dynamic(
  () => import('@/components/3d/skill-radar'),
  { ssr: false, loading: () => null }
)

const RoadmapTimeline = dynamic(
  () => import('@/components/3d/roadmap-timeline'),
  { ssr: false, loading: () => null }
)

const categoryConfig = {
  technical: {
    label: 'Technical',
    icon: Code,
    color: 'from-cyan-500 to-blue-500',
    tracks: ['Web Development', 'Backend Development', 'Mobile Development', 'Cloud & DevOps', 'Cybersecurity', 'Core CS Subjects'],
  },
  'data-ai': {
    label: 'Data & AI',
    icon: Database,
    color: 'from-teal-500 to-emerald-500',
    tracks: ['Data Analysis', 'Machine Learning', 'Artificial Intelligence', 'AI Tools', 'Business Intelligence', 'Programming Fundamentals'],
  },
  professional: {
    label: 'Professional',
    icon: Users,
    color: 'from-violet-500 to-purple-500',
    tracks: ['Communication', 'Leadership', 'Critical Thinking', 'Team Collaboration', 'Presentation Skills'],
  },
  business: {
    label: 'Business',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-500',
    tracks: ['Marketing', 'Sales', 'Finance', 'Entrepreneurship', 'Operations'],
  },
  creative: {
    label: 'Creative',
    icon: Brush,
    color: 'from-pink-500 to-rose-500',
    tracks: ['Graphic Design', 'UI/UX Design', 'Video Editing', 'Content Creation', 'Animation'],
  },
  language: {
    label: 'Language',
    icon: Languages,
    color: 'from-green-500 to-lime-500',
    tracks: ['English Fluency', 'Spanish', 'German', 'Public Speaking', 'Writing'],
  },
  vocational: {
    label: 'Vocational',
    icon: Wrench,
    color: 'from-red-500 to-orange-500',
    tracks: ['Electrician Basics', 'Automotive', 'Healthcare Support', 'Construction', 'Hospitality'],
  },
} as const

type SkillCategoryKey = keyof typeof categoryConfig

interface SkillFormState {
  name: string
  category: SkillCategoryKey
  track: string
  notes: string
}

const categoryOrder = Object.keys(categoryConfig) as SkillCategoryKey[]

const skillSuggestions: Record<SkillCategoryKey, Record<string, string[]>> = {
  technical: {
    'Web Development': ['HTML', 'Intro to HTML & CSS', 'CSS', 'SASS', 'W3.CSS', 'Bootstrap', 'JavaScript', 'TypeScript', 'React', 'Angular', 'AngularJS', 'Vue', 'Next.js', 'Tailwind CSS', 'jQuery', 'XML', 'GitHub'],
    'Backend Development': ['Node.js', 'Express', 'REST APIs', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Authentication', 'System Design', 'Java', 'PHP', 'ASP', 'Django', 'Go', 'Rust'],
    'Mobile Development': ['React Native', 'Flutter', 'Android Basics', 'iOS Basics', 'Kotlin', 'Swift', 'Firebase', 'GitHub'],
    'Cloud & DevOps': ['Git', 'GitHub', 'GitHub Actions', 'Docker', 'Kubernetes', 'Linux', 'Bash', 'AWS', 'CI/CD'],
    Cybersecurity: ['Cybersecurity', 'Network Security', 'Ethical Hacking', 'OWASP Basics', 'Encryption', 'Security Testing'],
    'Core CS Subjects': ['DSA', 'DAA', 'Operating Systems', 'DBMS', 'Computer Networks', 'OOP', 'Computer Architecture', 'Discrete Mathematics'],
  },
  'data-ai': {
    'Data Analysis': ['Excel', 'SQL', 'Python', 'R', 'NumPy', 'Pandas', 'SciPy', 'Data Visualization', 'Statistics', 'Data Science'],
    'Machine Learning': ['Python', 'scikit-learn', 'NumPy', 'Pandas', 'SciPy', 'Model Evaluation', 'Feature Engineering', 'Deep Learning'],
    'Artificial Intelligence': ['AI', 'Artificial Intelligence', 'Gen AI', 'Search Algorithms', 'Knowledge Representation', 'Reasoning Systems', 'Neural Networks'],
    'AI Tools': ['Prompt Engineering', 'LLM Workflows', 'LangChain', 'AI Automation', 'Chatbot Design', 'Vector Search', 'Gen AI'],
    'Business Intelligence': ['Excel', 'Power BI', 'Tableau', 'Dashboards', 'Reporting', 'KPIs'],
    'Programming Fundamentals': ['C', 'C++', 'C#', 'Java', 'Python', 'R', 'Problem Solving', 'Algorithms', 'Data Structures', 'Debugging'],
  },
  professional: {
    Communication: ['Written Communication', 'Verbal Communication', 'Active Listening', 'Email Writing'],
    Leadership: ['Team Leadership', 'Decision Making', 'Delegation', 'Conflict Resolution'],
    'Critical Thinking': ['Problem Solving', 'Decision Analysis', 'Reasoning', 'Structured Thinking'],
    'Team Collaboration': ['Teamwork', 'Stakeholder Communication', 'Meeting Skills', 'Feedback Skills'],
    'Presentation Skills': ['Public Speaking', 'Storytelling', 'Slide Design', 'Audience Engagement'],
  },
  business: {
    Marketing: ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing', 'Email Marketing'],
    Sales: ['Sales Pitching', 'Lead Generation', 'Negotiation', 'CRM Basics'],
    Finance: ['Budgeting', 'Financial Analysis', 'Accounting Basics', 'Forecasting'],
    Entrepreneurship: ['Business Planning', 'Product Strategy', 'Customer Research', 'Startup Operations'],
    Operations: ['Project Management', 'Process Improvement', 'Supply Chain Basics', 'Workflow Design'],
  },
  creative: {
    'Graphic Design': ['Photoshop', 'Illustrator', 'Brand Design', 'Typography', 'Color Theory'],
    'UI/UX Design': ['Wireframing', 'Prototyping', 'User Research', 'Figma', 'Design Systems'],
    'Video Editing': ['Premiere Pro', 'CapCut', 'Motion Graphics', 'Storyboarding'],
    'Content Creation': ['Script Writing', 'Thumbnail Design', 'Short-form Content', 'Content Planning'],
    Animation: ['2D Animation', 'After Effects', 'Motion Design', 'Frame-by-frame Animation'],
  },
  language: {
    'English Fluency': ['Speaking', 'Listening', 'Reading', 'Writing', 'Interview English'],
    Spanish: ['Spanish Speaking', 'Spanish Grammar', 'Spanish Vocabulary'],
    German: ['German Speaking', 'German Grammar', 'German Vocabulary'],
    'Public Speaking': ['Speech Delivery', 'Confidence Building', 'Audience Handling'],
    Writing: ['Essay Writing', 'Creative Writing', 'Professional Writing', 'Grammar'],
  },
  vocational: {
    'Electrician Basics': ['Wiring Basics', 'Circuit Reading', 'Electrical Safety'],
    Automotive: ['Engine Basics', 'Diagnostics', 'Vehicle Maintenance'],
    'Healthcare Support': ['Patient Care Basics', 'Medical Terminology', 'Clinical Support Skills'],
    Construction: ['Site Safety', 'Measurement', 'Tool Handling', 'Blueprint Reading'],
    Hospitality: ['Customer Service', 'Front Desk Skills', 'Food Service Basics'],
  },
}

const legacyCategoryMap: Record<string, SkillCategoryKey> = {
  technical: 'technical',
  soft: 'professional',
  domain: 'data-ai',
  professional: 'professional',
  'data-ai': 'data-ai',
  business: 'business',
  creative: 'creative',
  language: 'language',
  vocational: 'vocational',
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

function normalizeCategory(category: string): SkillCategoryKey {
  return legacyCategoryMap[category] ?? 'technical'
}

function formatCategoryLabel(category: string) {
  return categoryConfig[normalizeCategory(category)].label
}

function buildLearningPath(skill: Skill): LearningPath {
  const normalizedCategory = normalizeCategory(skill.category)
  const track = skill.track?.trim() || categoryConfig[normalizedCategory].tracks[0]
  const progress = skill.targetLevel > 0 ? clamp(Math.round((skill.level / skill.targetLevel) * 100)) : 0

  const modules = [
    `Foundations of ${skill.name}`,
    `${track} core workflow`,
    `${skill.name} guided practice`,
    `${skill.name} portfolio project`,
    `${skill.name} advanced challenge`,
  ].map((title, index) => {
    const completionThreshold = Math.min(100, 20 + index * 18)
    return {
      id: `${skill.id}-${index}`,
      title,
      completed: progress >= completionThreshold,
    }
  })

  return {
    id: `path-${skill.id}`,
    title: `${skill.name} learning path`,
    description: `A guided path for ${track} within ${formatCategoryLabel(skill.category)} skills.`,
    progress,
    modules,
  }
}

function getLevelStage(level: number) {
  if (level < 35) return 'Beginner'
  if (level < 70) return 'Developing'
  if (level < 85) return 'Job-ready'
  return 'Advanced'
}

function getStageDescription(stage: string) {
  if (stage === 'Beginner') return 'Complete the first lessons and pass the early tests.'
  if (stage === 'Developing') return 'Keep practicing and finish the intermediate lessons.'
  if (stage === 'Job-ready') return 'Build projects and clear the advanced tests.'
  return 'You can work independently and refine high-level skills.'
}

function normalizeSkillName(name: string) {
  return name.trim().toLowerCase()
}

function getSkillGuidance(skill: Skill) {
  const normalizedCategory = normalizeCategory(skill.category)
  const config = categoryConfig[normalizedCategory]
  const track = skill.track?.trim() || config.tracks[0]
  const stage = getLevelStage(skill.level)
  const skillKey = normalizeSkillName(skill.name)

  const practiceIdeas: Record<SkillCategoryKey, string[]> = {
    technical: [
      `Build a small hands-on task using ${skill.name}.`,
      `Read the official docs for the part of ${skill.name} you are learning now.`,
      `Practice the workflow used in ${track}.`,
    ],
    'data-ai': [
      `Work on one dataset or analytical problem using ${skill.name}.`,
      `Write down your logic and decisions clearly.`,
      `Practice the tools and steps used in ${track}.`,
    ],
    professional: [
      `Use ${skill.name} in a real conversation, presentation, or team task.`,
      `Ask for direct feedback after you practice.`,
      `Reflect on one thing to improve each week.`,
    ],
    business: [
      `Apply ${skill.name} to a real business scenario or case study.`,
      `Track one metric or result from your decisions.`,
      `Review frameworks commonly used in ${track}.`,
    ],
    creative: [
      `Create one publishable piece using ${skill.name}.`,
      `Revise it after feedback or self-review.`,
      `Study strong examples from ${track}.`,
    ],
    language: [
      `Practice ${skill.name} daily through speaking, reading, and writing.`,
      `Record your output and review mistakes.`,
      `Use prompts connected to ${track}.`,
    ],
    vocational: [
      `Practice ${skill.name} through hands-on repetition.`,
      `Focus on safety, accuracy, and consistency.`,
      `Learn the tools and standards used in ${track}.`,
    ],
  }

  const skillSpecificGuidance: Record<string, {
    whyItMatters: string
    nextSteps: string[]
    practiceIdeas: string[]
    milestones: string[]
    outcome: string
  }> = {
    html: {
      whyItMatters: 'HTML is the structure layer of the web. Strong HTML improves accessibility, layout clarity, SEO, and collaboration with CSS and JavaScript work.',
      nextSteps: [
        'Build one semantic page using headings, sections, forms, tables, and lists correctly.',
        'Practice writing accessible markup with labels, alt text, landmarks, and button/link usage.',
        'Review your page in browser devtools and validate the structure.',
      ],
      practiceIdeas: [
        'Recreate a landing page using only HTML first before adding CSS.',
        'Convert one messy layout into semantic tags like `header`, `main`, `section`, and `footer`.',
        'Build a complete form with proper labels, validation hints, and grouped fields.',
      ],
      milestones: [
        'Use semantic tags without guessing.',
        'Build a complete multi-section page from scratch.',
        'Explain accessibility basics in your own words.',
      ],
      outcome: 'You should be able to structure real web pages cleanly and prepare strong foundations for CSS, JavaScript, and React work.',
    },
    css: {
      whyItMatters: 'CSS controls visual quality, spacing, responsiveness, and polish. Better CSS translates directly into better UI execution.',
      nextSteps: [
        'Practice layout with flexbox and grid on one real page.',
        'Build reusable spacing, typography, and color patterns instead of ad hoc styling.',
        'Test your layout on both mobile and desktop breakpoints.',
      ],
      practiceIdeas: [
        'Clone one modern layout and match spacing precisely.',
        'Build a card grid, pricing section, and navbar with responsive behavior.',
        'Refactor duplicated styles into cleaner reusable patterns.',
      ],
      milestones: [
        'Handle responsive layout without breaking alignment.',
        'Create visually consistent components.',
        'Understand when to use flexbox vs grid.',
      ],
      outcome: 'You should be able to turn plain markup into responsive, production-looking interfaces with consistent design decisions.',
    },
    javascript: {
      whyItMatters: 'JavaScript drives application logic, interactions, and browser behavior. It is the core runtime skill behind modern frontend work.',
      nextSteps: [
        'Practice functions, arrays, objects, async logic, and DOM events on small tasks.',
        'Write one mini project that reads input, transforms data, and updates the UI.',
        'Debug your own code using console tools and browser breakpoints.',
      ],
      practiceIdeas: [
        'Build a todo app, quiz app, or weather fetcher with plain JavaScript.',
        'Solve 5 to 10 array/object transformation problems.',
        'Refactor repetitive logic into reusable functions.',
      ],
      milestones: [
        'Use conditions, loops, and functions comfortably.',
        'Handle async requests and errors clearly.',
        'Build one complete interactive browser project.',
      ],
      outcome: 'You should be able to write application logic confidently and support more advanced frameworks like React.',
    },
    typescript: {
      whyItMatters: 'TypeScript improves correctness, maintainability, and developer confidence in larger codebases.',
      nextSteps: [
        'Add clear types for function inputs, outputs, and object shapes.',
        'Practice union types, interfaces, narrowing, and reusable types.',
        'Refactor one JavaScript-style component into stricter TypeScript.',
      ],
      practiceIdeas: [
        'Type a form state object and its update handlers.',
        'Create interfaces for API responses and UI models.',
        'Fix type errors without falling back to `any`.',
      ],
      milestones: [
        'Understand the difference between type aliases and interfaces.',
        'Handle optional and nullable values safely.',
        'Use TypeScript to catch mistakes before runtime.',
      ],
      outcome: 'You should be able to work more safely in modern React and frontend codebases without relying on weak typing.',
    },
    react: {
      whyItMatters: 'React is one of the most common frontend libraries for building interactive products and real-world interfaces.',
      nextSteps: [
        'Build components with clear props, state, and event handling.',
        'Practice conditional rendering, list rendering, and form state.',
        'Split one page into reusable components with readable structure.',
      ],
      practiceIdeas: [
        'Build a dashboard card section, modal, and form using React state.',
        'Convert a static layout into reusable components.',
        'Practice lifting state and passing data through props correctly.',
      ],
      milestones: [
        'Understand when state should stay local vs shared.',
        'Build a multi-section page with reusable components.',
        'Debug rendering and state update issues confidently.',
      ],
      outcome: 'You should be able to create structured, interactive UI features and contribute to React-based product work.',
    },
    'node.js': {
      whyItMatters: 'Node.js is a common backend runtime for APIs, server logic, tooling, and full-stack development.',
      nextSteps: [
        'Build a small API with routing, validation, and error handling.',
        'Understand request-response flow and JSON data exchange.',
        'Practice environment variables, middleware, and structured logging.',
      ],
      practiceIdeas: [
        'Create a CRUD API for tasks, users, or products.',
        'Add one protected route and one public route.',
        'Connect a frontend form to your API.',
      ],
      milestones: [
        'Set up a small backend from scratch.',
        'Handle validation and failure states clearly.',
        'Understand how frontend and backend connect.',
      ],
      outcome: 'You should be able to build and explain a small service layer for full-stack applications.',
    },
    python: {
      whyItMatters: 'Python is widely used in automation, backend, scripting, data work, and machine learning.',
      nextSteps: [
        'Practice core syntax, functions, file handling, and data structures.',
        'Write one script that solves a practical problem end to end.',
        'Use modules and break larger problems into smaller functions.',
      ],
      practiceIdeas: [
        'Automate file cleanup, CSV processing, or report generation.',
        'Solve beginner-to-intermediate logic problems.',
        'Build a small CLI tool tied to your track.',
      ],
      milestones: [
        'Write clean functions and organize simple scripts.',
        'Use lists, dictionaries, and loops fluently.',
        'Solve practical tasks without needing copy-paste solutions.',
      ],
      outcome: 'You should be able to use Python effectively for automation, learning projects, and more advanced data or AI workflows.',
    },
    'machine learning': {
      whyItMatters: 'Machine Learning helps you model patterns, make predictions, and work on applied AI problems using real data.',
      nextSteps: [
        'Strengthen the basics: data cleaning, model choice, evaluation, and overfitting.',
        'Train one simple model and explain what each metric means.',
        'Document your workflow from dataset to result.',
      ],
      practiceIdeas: [
        'Run one classification or regression project on a public dataset.',
        'Compare two model approaches and explain the tradeoff.',
        'Build a notebook that shows preprocessing, training, and evaluation.',
      ],
      milestones: [
        'Understand train/test split and validation clearly.',
        'Choose evaluation metrics with intention.',
        'Build one end-to-end ML case study.',
      ],
      outcome: 'You should be able to explain and build a small machine learning workflow rather than just running a model blindly.',
    },
    'artificial intelligence': {
      whyItMatters: 'Artificial Intelligence is a core college and career subject that connects search, reasoning, agents, and intelligent problem solving.',
      nextSteps: [
        'Study AI fundamentals, intelligent agents, search techniques, and knowledge representation unit by unit.',
        'Practice standard university questions, definitions, and worked examples after each topic.',
        'Revise with mock theory answers and viva-style explanation practice.',
      ],
      practiceIdeas: [
        'Solve search and reasoning examples step by step.',
        'Prepare short notes for each AI unit and key definitions.',
        'Practice previous year questions and explain answers aloud.',
      ],
      milestones: [
        'Explain core AI concepts without confusion.',
        'Solve standard search and reasoning problems correctly.',
        'Answer theory and viva questions with better confidence.',
      ],
      outcome: 'You should be able to study AI for exams, solve common academic questions, and connect the subject to practical intelligent systems.',
    },
    dsa: {
      whyItMatters: 'Data Structures and Algorithms is one of the most important college and interview subjects because it builds problem solving and coding logic.',
      nextSteps: [
        'Study arrays, strings, linked lists, stacks, queues, trees, graphs, and algorithms in order.',
        'Practice one topic at a time with concept revision plus coding questions.',
        'Use dry runs, handwritten tracing, and complexity analysis for exam preparation.',
      ],
      practiceIdeas: [
        'Solve topic-wise coding problems and write the approach before coding.',
        'Revise time and space complexity for every major data structure and algorithm.',
        'Prepare short theory notes for semester exams and viva questions.',
      ],
      milestones: [
        'Solve beginner to intermediate DSA problems independently.',
        'Explain complexity and tradeoffs clearly.',
        'Handle exam-style theory and coding questions with less confusion.',
      ],
      outcome: 'You should be able to solve common DSA questions, explain algorithm choices, and prepare effectively for exams and placements.',
    },
    daa: {
      whyItMatters: 'Design and Analysis of Algorithms helps college students understand algorithm strategy, efficiency, and proof-based problem solving.',
      nextSteps: [
        'Study algorithm design paradigms like divide and conquer, greedy, dynamic programming, and backtracking.',
        'Practice recurrence solving, complexity analysis, and standard textbook problems.',
        'Prepare unit-wise notes and compare algorithm approaches for exam answers.',
      ],
      practiceIdeas: [
        'Solve standard DAA problems with full step-by-step reasoning.',
        'Write theory answers comparing strategies and complexity.',
        'Practice previous year university questions and viva explanations.',
      ],
      milestones: [
        'Recognize which design paradigm fits a problem.',
        'Analyze running time more confidently.',
        'Answer long-form DAA exam questions with structure and clarity.',
      ],
      outcome: 'You should be able to understand core algorithm design techniques and perform better in college exams and technical discussions.',
    },
    'operating systems': {
      whyItMatters: 'Operating Systems is a core CS subject needed for semester exams, viva preparation, and understanding how software works with hardware and processes.',
      nextSteps: [
        'Study processes, threads, CPU scheduling, synchronization, deadlocks, memory management, and file systems carefully.',
        'Practice diagrams, scheduling problems, and standard theory answers after each unit.',
        'Revise with previous year questions and short notes before exams.',
      ],
      practiceIdeas: [
        'Solve CPU scheduling and paging questions step by step.',
        'Prepare definitions, differences, and short notes for each unit.',
        'Explain process synchronization and deadlock concepts in your own words.',
      ],
      milestones: [
        'Solve common OS numerical questions correctly.',
        'Explain major OS concepts clearly.',
        'Handle theory, diagrams, and viva questions with more confidence.',
      ],
      outcome: 'You should be able to study OS effectively for college exams and build a stronger systems foundation.',
    },
    dbms: {
      whyItMatters: 'DBMS is a major college and placement subject that helps learners understand databases, queries, transactions, and system design basics.',
      nextSteps: [
        'Study ER models, normalization, relational algebra, SQL, transactions, and indexing in order.',
        'Practice schema design, SQL queries, and normalization examples regularly.',
        'Revise definitions and long-form theory answers for exam preparation.',
      ],
      practiceIdeas: [
        'Solve SQL questions and write expected outputs.',
        'Practice normalization and transaction questions from old papers.',
        'Prepare short notes on DBMS architecture and concepts.',
      ],
      milestones: [
        'Write correct SQL for common problems.',
        'Explain normalization and transactions clearly.',
        'Perform better in theory and practical DBMS exams.',
      ],
      outcome: 'You should be able to handle DBMS exam topics, write stronger SQL solutions, and understand the core ideas behind database systems.',
    },
    'data analysis': {
      whyItMatters: 'Data Analysis turns raw information into decisions, insights, and measurable actions.',
      nextSteps: [
        'Practice cleaning, summarizing, and visualizing one dataset.',
        'Focus on finding useful questions before jumping into charts.',
        'Learn how to present findings in plain language.',
      ],
      practiceIdeas: [
        'Analyze a CSV and produce 3 to 5 actionable findings.',
        'Create a short dashboard or notebook summary.',
        'Compare trends over time and explain what changed.',
      ],
      milestones: [
        'Clean inconsistent data without confusion.',
        'Choose charts that match the question.',
        'Present insights clearly to non-technical people.',
      ],
      outcome: 'You should be able to investigate data, summarize patterns, and communicate useful decisions from your analysis.',
    },
    english: {
      whyItMatters: 'English helps with interviews, documentation, presentations, collaboration, and access to global learning resources.',
      nextSteps: [
        'Practice speaking, listening, reading, and writing every week.',
        'Pick one goal such as interview English, writing clarity, or speaking confidence.',
        'Record yourself and review weak patterns in grammar, pronunciation, or flow.',
      ],
      practiceIdeas: [
        'Summarize one article or video in English each day.',
        'Practice mock interview answers out loud.',
        'Write short messages, emails, or summaries and revise them for clarity.',
      ],
      milestones: [
        'Speak for 2 to 3 minutes on a topic without stopping constantly.',
        'Write clearer sentences with fewer grammar errors.',
        'Understand professional vocabulary related to your field.',
      ],
      outcome: 'You should be able to communicate more clearly in study, interview, and workplace situations using English.',
    },
    marketing: {
      whyItMatters: 'Marketing connects products, audiences, messaging, and growth. It is a practical business skill with visible output.',
      nextSteps: [
        'Learn audience targeting, messaging, funnel basics, and campaign goals.',
        'Review one campaign and explain why it worked or failed.',
        'Create a simple content or campaign plan around a product.',
      ],
      practiceIdeas: [
        'Write ad copy, landing page copy, or a content plan for one offer.',
        'Audit a brand’s social or email funnel.',
        'Track one metric such as CTR, conversion, or retention.',
      ],
      milestones: [
        'Understand who the message is for and why.',
        'Write clearer copy with a defined CTA.',
        'Connect campaign work to actual metrics.',
      ],
      outcome: 'You should be able to plan and evaluate simple marketing work with clearer audience and metric thinking.',
    },
    'digital marketing': {
      whyItMatters: 'Digital marketing helps people understand products, drives traffic, generates leads, and connects content to business growth.',
      nextSteps: [
        'Learn the full funnel: awareness, consideration, conversion, and retention.',
        'Study content, SEO, paid ads, email, and analytics as connected parts of one system.',
        'Build one small campaign with a goal, audience, message, and metric.',
      ],
      practiceIdeas: [
        'Write a 7-day content plan for a product or service.',
        'Create one landing page message with a clear CTA and audience angle.',
        'Review one brand and identify what they are doing well in SEO, social, or email.',
      ],
      milestones: [
        'Explain the difference between reach, engagement, leads, and conversions.',
        'Write basic campaign copy for one target audience.',
        'Read simple performance metrics and suggest one improvement.',
      ],
      outcome: 'You should be able to plan beginner-level digital campaigns, create clearer messaging, and connect marketing work to measurable outcomes.',
    },
  }

  const studyPlans: Record<string, {
    overview: string
    beginner: string[]
    intermediate: string[]
    advanced: string[]
    youtubeChannels: string[]
    concepts: string[]
    exercises: string[]
    checkpoints: string[]
  }> = {
    html: {
      overview: 'This internal HTML track teaches structure, semantic markup, forms, accessibility, and page composition from scratch.',
      beginner: ['HTML document structure', 'Headings, paragraphs, lists, and links', 'Images, forms, and tables'],
      intermediate: ['Semantic sections and page layout', 'Accessible forms and labels', 'Reusable page structures'],
      advanced: ['SEO-friendly structure', 'Accessibility review workflow', 'Build a complete multi-section page'],
      youtubeChannels: ['PathForge HTML Basics', 'PathForge Web Foundations', 'PathForge Accessibility Walkthroughs'],
      concepts: ['Semantic tags', 'Accessibility basics', 'Form structure', 'Document hierarchy'],
      exercises: ['Build a profile page', 'Create a contact form', 'Convert a layout into semantic HTML'],
      checkpoints: ['Can create a valid page from scratch', 'Uses semantic tags correctly', 'Builds forms with labels'],
    },
    css: {
      overview: 'This CSS study track focuses on visual styling, spacing systems, layout control, and responsive design.',
      beginner: ['Selectors and properties', 'Colors, spacing, and typography', 'Box model and positioning'],
      intermediate: ['Flexbox and grid', 'Responsive breakpoints', 'Reusable utility patterns'],
      advanced: ['Systematic design tokens', 'Complex responsive sections', 'Production-style polish and consistency'],
      youtubeChannels: ['PathForge CSS Crash Course', 'PathForge Responsive UI', 'PathForge Layout Clinics'],
      concepts: ['Box model', 'Flexbox', 'Grid', 'Responsive design', 'Visual hierarchy'],
      exercises: ['Style a landing page', 'Build a card grid', 'Make one section mobile responsive'],
      checkpoints: ['Uses flexbox confidently', 'Builds responsive layouts', 'Maintains visual consistency'],
    },
    javascript: {
      overview: 'This JavaScript path teaches browser logic, problem solving, DOM interaction, and app behavior step by step.',
      beginner: ['Variables, conditions, loops', 'Functions and arrays', 'Objects and events'],
      intermediate: ['DOM manipulation', 'Async requests and promises', 'State-driven UI behavior'],
      advanced: ['Error handling patterns', 'Code organization', 'Mini app architecture'],
      youtubeChannels: ['PathForge JavaScript Foundations', 'PathForge DOM Practice', 'PathForge Async JS'],
      concepts: ['Functions', 'Arrays and objects', 'DOM', 'Events', 'Async flow'],
      exercises: ['Build a todo app', 'Create a quiz app', 'Fetch and render API data'],
      checkpoints: ['Can solve small logic tasks', 'Can update UI with JS', 'Can debug basic errors'],
    },
    react: {
      overview: 'This React path focuses on component thinking, state, props, forms, and practical interface building.',
      beginner: ['JSX and components', 'Props and composition', 'State basics'],
      intermediate: ['Forms and controlled inputs', 'Conditional rendering', 'Lists and reusable UI blocks'],
      advanced: ['State structure decisions', 'Feature decomposition', 'Interactive dashboard flows'],
      youtubeChannels: ['PathForge React Start', 'PathForge React Components', 'PathForge React Forms'],
      concepts: ['Components', 'Props', 'State', 'Rendering', 'UI composition'],
      exercises: ['Build a modal', 'Create a dashboard card set', 'Implement a small form flow'],
      checkpoints: ['Builds reusable components', 'Understands state updates', 'Creates small interactive features'],
    },
    python: {
      overview: 'This Python track helps learners move from syntax basics to scripting, automation, and practical projects.',
      beginner: ['Syntax and variables', 'Conditions, loops, and functions', 'Lists and dictionaries'],
      intermediate: ['Files and modules', 'Data transformation', 'Small CLI scripts'],
      advanced: ['Automation workflows', 'Project structure', 'Track-specific practical scripts'],
      youtubeChannels: ['PathForge Python Basics', 'PathForge Python Practice', 'PathForge Python Automation'],
      concepts: ['Functions', 'Data structures', 'Modules', 'File handling', 'Script flow'],
      exercises: ['Build a calculator', 'Process a CSV file', 'Create a mini automation script'],
      checkpoints: ['Writes clean functions', 'Uses Python for a real task', 'Organizes scripts logically'],
    },
    english: {
      overview: 'This English path is designed for learners who want stronger speaking, listening, reading, writing, and workplace communication.',
      beginner: ['Basic sentence patterns', 'Daily vocabulary themes', 'Listening and reading basics'],
      intermediate: ['Conversation flow', 'Writing clear messages', 'Interview and presentation English'],
      advanced: ['Professional communication', 'Fluent explanation practice', 'Field-specific vocabulary'],
      youtubeChannels: ['PathForge Spoken English', 'PathForge Interview English', 'PathForge Writing Practice'],
      concepts: ['Vocabulary building', 'Pronunciation', 'Grammar patterns', 'Fluency', 'Professional communication'],
      exercises: ['Record a self-introduction', 'Write one email', 'Practice 3 interview answers'],
      checkpoints: ['Speaks more fluently', 'Writes clearer sentences', 'Handles professional communication better'],
    },
    marketing: {
      overview: 'This marketing track teaches audience research, messaging, channels, content, and campaign performance inside one learning flow.',
      beginner: ['Marketing fundamentals', 'Audience and offer basics', 'Content and messaging principles'],
      intermediate: ['SEO, email, social, and funnel basics', 'Campaign planning', 'Measurement and KPIs'],
      advanced: ['Optimization strategy', 'Conversion thinking', 'Campaign review and growth loops'],
      youtubeChannels: ['PathForge Marketing Basics', 'PathForge Campaign Teardowns', 'PathForge SEO and Content'],
      concepts: ['Target audience', 'Positioning', 'Funnel', 'CTR', 'Conversion', 'Retention'],
      exercises: ['Create a content calendar', 'Write one campaign brief', 'Audit a brand funnel'],
      checkpoints: ['Can define an audience', 'Writes clearer marketing copy', 'Reads basic campaign metrics'],
    },
    'digital marketing': {
      overview: 'This internal digital marketing path covers SEO, content, social, paid ads, email, analytics, and campaign strategy inside your site.',
      beginner: ['What digital marketing is', 'Audience, offer, and message basics', 'SEO, content, and social foundations'],
      intermediate: ['Email and lead funnels', 'Paid campaign basics', 'Landing page and CTA optimization'],
      advanced: ['Analytics interpretation', 'Growth experiments', 'Campaign optimization and reporting'],
      youtubeChannels: ['PathForge Digital Marketing Intro', 'PathForge SEO and Content Systems', 'PathForge Ads and Analytics'],
      concepts: ['Audience targeting', 'Brand message', 'SEO', 'Email funnels', 'Paid traffic', 'Analytics'],
      exercises: ['Build a 7-day campaign plan', 'Write landing page copy', 'Review performance metrics for one mock campaign'],
      checkpoints: ['Knows major digital channels', 'Creates a simple campaign plan', 'Can explain metrics and next actions'],
    },
  }

  const defaultStudyPlan = {
    overview: `This PathForge study path teaches ${skill.name} through guided internal lessons, progressive difficulty, and practical assignments for ${track}.`,
    beginner: [
      `Intro to ${skill.name}`,
      `${skill.name} foundations for ${track}`,
      `First guided practice in ${skill.name}`,
    ],
    intermediate: [
      `${skill.name} workflow and practical use`,
      `${skill.name} problem solving and review`,
      `${skill.name} applied task in ${track}`,
    ],
    advanced: [
      `${skill.name} advanced scenarios`,
      `${skill.name} performance and quality improvement`,
      `${skill.name} project or case study`,
    ],
    youtubeChannels: [
      `PathForge ${skill.name} Basics`,
      `PathForge ${track} Practice`,
      `PathForge ${skill.name} Deep Dive`,
    ],
    concepts: [
      `${skill.name} fundamentals`,
      `${track} workflow`,
      'Common mistakes',
      'Real-world application',
    ],
    exercises: [
      `Finish one guided task using ${skill.name}`,
      `Create one small practice output for ${track}`,
      `Review and improve your result`,
    ],
    checkpoints: [
      `You can explain the core ideas of ${skill.name} clearly.`,
      `You completed at least one practical task in ${track}.`,
      `You can move your self-rating forward with real proof of work.`,
    ],
  }

  const milestones: Record<string, string[]> = {
    Beginner: [
      `Understand the basic concepts of ${skill.name}.`,
      `Finish one guided exercise in ${track}.`,
      `Explain where ${skill.name} is used.`,
    ],
    Developing: [
      `Complete one independent task using ${skill.name}.`,
      `Work with less step-by-step help.`,
      `Build one proof-of-work item.`,
    ],
    'Job-ready': [
      `Handle realistic tasks using ${skill.name}.`,
      `Show results inside a project or assignment.`,
      `Explain your decisions and tradeoffs clearly.`,
    ],
    Advanced: [
      `Review or mentor others using ${skill.name}.`,
      `Improve speed, quality, or consistency.`,
      `Build a standout portfolio or case study item.`,
    ],
  }

  const specific = skillSpecificGuidance[skillKey]
  if (specific) {
    return {
      stage,
      ...specific,
      studyPlan: studyPlans[skillKey] ?? defaultStudyPlan,
    }
  }

  return {
    stage,
    whyItMatters: `${skill.name} supports ${track} work inside ${config.label}. Stronger skill here improves confidence and real output.`,
    nextSteps: [
      `Move from ${skill.level}% toward ${skill.targetLevel}% by focusing on one module at a time.`,
      `Spend your next study block on real tasks that use ${skill.name}.`,
      `Save evidence of progress through notes, code, screenshots, or practice output.`,
    ],
    practiceIdeas: practiceIdeas[normalizedCategory],
    milestones: milestones[stage],
    outcome: `With steady progress in ${skill.name}, you should be able to use it more confidently in ${track} tasks, projects, and interviews.`,
    studyPlan: studyPlans[skillKey] ?? defaultStudyPlan,
  }
}

function getSkillSummary(skill: Skill) {
  const path = buildLearningPath(skill)
  const nextModule = path.modules.find((module) => !module.completed)?.title ?? 'Advanced challenge review'
  return { path, nextModule }
}

interface AssessmentQuestion {
  id: string
  prompt: string
  options: {
    label: string
    score: number
  }[]
}

function getAssessmentStorageKey(userId: string, skillId: string) {
  return `pathforge-skill-assessment:${userId}:${skillId}`
}

function buildAssessmentQuestions(skill: Skill): AssessmentQuestion[] {
  const track = skill.track?.trim() || categoryConfig[normalizeCategory(skill.category)].tracks[0]

  return [
    {
      id: 'foundation',
      prompt: `How well do you understand the basics of ${skill.name}?`,
      options: [
        { label: 'I am starting from zero', score: 0 },
        { label: 'I know some basics but need guidance', score: 1 },
        { label: 'I can explain the basics clearly', score: 2 },
      ],
    },
    {
      id: 'practice',
      prompt: `How much real practice have you already done in ${skill.name}?`,
      options: [
        { label: 'No real practice yet', score: 0 },
        { label: 'A few guided exercises', score: 1 },
        { label: `I built or used ${skill.name} in real ${track} work`, score: 2 },
      ],
    },
    {
      id: 'independence',
      prompt: `How independently can you solve beginner ${skill.name} tasks?`,
      options: [
        { label: 'I still need step-by-step help', score: 0 },
        { label: 'I can finish simple tasks with some help', score: 1 },
        { label: 'I can finish beginner tasks on my own', score: 2 },
      ],
    },
    {
      id: 'review',
      prompt: `Can you review your own ${skill.name} work and explain what is correct or wrong?`,
      options: [
        { label: 'Not yet', score: 0 },
        { label: 'Sometimes, with doubt', score: 1 },
        { label: 'Yes, for beginner-level work', score: 2 },
      ],
    },
  ]
}

function calculateAssessmentLevel(totalScore: number, proofLength: number) {
  if (totalScore <= 1) return 0
  if (totalScore <= 3) return 10
  if (totalScore <= 5) return 20
  if (totalScore <= 6) return proofLength >= 80 ? 34 : 20
  if (totalScore <= 7) return proofLength >= 120 ? 50 : 34
  return proofLength >= 160 ? 70 : 50
}

function getAssessmentRecommendation(level: number) {
  if (level === 0) return 'Start from the beginning and build the foundations first.'
  if (level <= 20) return 'Start early in the beginner section and use practice to close the gaps.'
  if (level <= 34) return 'You can skip the earliest lessons and begin near the end of the beginner stage.'
  if (level <= 50) return 'You can begin in the intermediate stage, but still review weak basics when needed.'
  return 'You can start beyond the beginner lessons and focus on intermediate work immediately.'
}

export default function SkillsPage() {
  const { skills, addSkill, updateSkill, deleteSkill } = useDashboardStore()
  const { user } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<SkillCategoryKey | null>(null)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null)
  const [assessmentSkillId, setAssessmentSkillId] = useState<string | null>(null)
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({})
  const [assessmentEvidence, setAssessmentEvidence] = useState('')
  const [assessmentFeedback, setAssessmentFeedback] = useState('')
  const [formState, setFormState] = useState<SkillFormState>({
    name: '',
    category: 'technical',
    track: categoryConfig.technical.tracks[0],
    notes: '',
  })

  const enrichedSkills = useMemo(
    () => skills.map((skill) => ({ ...skill, normalizedCategory: normalizeCategory(skill.category) })),
    [skills]
  )

  const filteredSkills = useMemo(() => {
    if (!selectedCategory) return enrichedSkills
    return enrichedSkills.filter((skill) => skill.normalizedCategory === selectedCategory)
  }, [enrichedSkills, selectedCategory])

  useEffect(() => {
    if (filteredSkills.length === 0) {
      setSelectedSkillId(null)
      return
    }

    if (!selectedSkillId || !filteredSkills.some((skill) => skill.id === selectedSkillId)) {
      setSelectedSkillId(filteredSkills[0].id)
    }
  }, [filteredSkills, selectedSkillId])

  const selectedSkill = filteredSkills.find((skill) => skill.id === selectedSkillId) ?? null
  const selectedPath = selectedSkill ? buildLearningPath(selectedSkill) : null
  const skillSummary = selectedSkill ? getSkillSummary(selectedSkill) : null
  const skillGuidance = selectedSkill ? getSkillGuidance(selectedSkill) : null
  const assessmentSkill = skills.find((skill) => skill.id === assessmentSkillId) ?? null
  const assessmentQuestions = assessmentSkill ? buildAssessmentQuestions(assessmentSkill) : []
  const suggestedSkills = skillSuggestions[formState.category][formState.track] ?? []
  const averageLevel = filteredSkills.length > 0
    ? Math.round(filteredSkills.reduce((acc, skill) => acc + skill.level, 0) / filteredSkills.length)
    : 0

  const categoryStats = categoryOrder.map((category) => {
    const items = enrichedSkills.filter((skill) => skill.normalizedCategory === category)
    const average = items.length > 0
      ? Math.round(items.reduce((acc, skill) => acc + skill.level, 0) / items.length)
      : 0

    return {
      key: category,
      count: items.length,
      average,
      ...categoryConfig[category],
    }
  })

  const openCreateForm = () => {
    const initialCategory = selectedCategory ?? 'technical'
    setEditingSkillId(null)
    setFormState({
      name: '',
      category: initialCategory,
      track: categoryConfig[initialCategory].tracks[0],
      notes: '',
    })
    setIsFormOpen(true)
  }

  const openEditForm = (skill: Skill) => {
    const normalizedCategory = normalizeCategory(skill.category)
    setEditingSkillId(skill.id)
    setFormState({
      name: skill.name,
      category: normalizedCategory,
      track: skill.track?.trim() || categoryConfig[normalizedCategory].tracks[0],
      notes: skill.notes ?? '',
    })
    setIsFormOpen(true)
  }

  const openAssessment = (skill: Skill) => {
    setAssessmentSkillId(skill.id)
    setAssessmentAnswers({})
    setAssessmentEvidence('')
    setAssessmentFeedback('')

    if (!user) return

    const raw = localStorage.getItem(getAssessmentStorageKey(user.id, skill.id))
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as {
        answers?: Record<string, number>
        evidence?: string
      }
      setAssessmentAnswers(parsed.answers ?? {})
      setAssessmentEvidence(parsed.evidence ?? '')
    } catch {
      setAssessmentAnswers({})
      setAssessmentEvidence('')
    }
  }

  const handleSaveSkill = () => {
    const name = formState.name.trim()

    if (!name) return

    const existingSkill = editingSkillId ? skills.find((skill) => skill.id === editingSkillId) : null

    const payload = {
      name,
      category: formState.category,
      track: formState.track,
      notes: formState.notes.trim(),
      level: existingSkill?.level ?? 0,
      targetLevel: existingSkill?.targetLevel ?? 100,
      lastUpdated: new Date().toISOString(),
    }

    if (editingSkillId) {
      updateSkill(editingSkillId, payload)
      setSelectedSkillId(editingSkillId)
    } else {
      const id = `skill-${Date.now()}`
      addSkill({
        id,
        ...payload,
      })
      setSelectedSkillId(id)
    }

    setIsFormOpen(false)
    setEditingSkillId(null)
  }

  const handleAssessmentSubmit = () => {
    if (!assessmentSkill) return

    const allQuestionsAnswered = assessmentQuestions.every((question) => assessmentAnswers[question.id] !== undefined)
    if (!allQuestionsAnswered) {
      setAssessmentFeedback('Answer all assessment questions first.')
      return
    }

    const totalScore = assessmentQuestions.reduce((sum, question) => sum + (assessmentAnswers[question.id] ?? 0), 0)
    const level = calculateAssessmentLevel(totalScore, assessmentEvidence.trim().length)

    updateSkill(assessmentSkill.id, {
      level,
      targetLevel: 100,
      lastUpdated: new Date().toISOString(),
    })

    if (user) {
      localStorage.setItem(
        getAssessmentStorageKey(user.id, assessmentSkill.id),
        JSON.stringify({
          level,
          assessedAt: new Date().toISOString(),
          answers: assessmentAnswers,
          evidence: assessmentEvidence.trim(),
        })
      )
    }

    setSelectedSkillId(assessmentSkill.id)
    setAssessmentFeedback(`Assessment complete. ${assessmentSkill.name} now starts at ${level}%. ${getAssessmentRecommendation(level)}`)
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-8 xl:flex-row xl:items-center xl:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Skills <span className="gradient-text">Roadmap</span>
          </h1>
          <p className="text-muted-foreground">
            Select a skill to see what to do next, how to practice it, and what outcome to expect.
          </p>
        </div>
        <MagneticButton variant="primary" onClick={openCreateForm}>
          <Plus className="w-5 h-5" />
          Add Skill
        </MagneticButton>
      </motion.div>

      {isFormOpen && (
        <GlassCard className="mb-8" delay={0}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingSkillId ? 'Edit Skill' : 'Add Skill'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a category and course area so the guidance matches the learner type.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingSkillId(null)
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close skill form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Skill Name</label>
                <input
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  list="skill-suggestions"
                  placeholder="TypeScript, Digital Marketing, Spoken English..."
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <datalist id="skill-suggestions">
                  {suggestedSkills.map((skillName) => (
                    <option key={skillName} value={skillName} />
                  ))}
                </datalist>
                <p className="mt-2 text-xs text-muted-foreground">
                  If you do not know the exact name, choose from suggestions below.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
                <select
                  value={formState.category}
                  onChange={(e) => {
                    const category = e.target.value as SkillCategoryKey
                    setFormState((prev) => ({
                      ...prev,
                      category,
                      track: categoryConfig[category].tracks[0],
                    }))
                  }}
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {categoryOrder.map((category) => (
                    <option key={category} value={category}>
                      {categoryConfig[category].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Track / Course Area</label>
                <select
                  value={formState.track}
                  onChange={(e) => setFormState((prev) => ({ ...prev, track: e.target.value }))}
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {categoryConfig[formState.category].tracks.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Suggested Skills</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((skillName) => {
                    const isSelectedSuggestion = formState.name.trim().toLowerCase() === skillName.toLowerCase()
                    return (
                      <button
                        key={skillName}
                        type="button"
                        onClick={() => setFormState((prev) => ({ ...prev, name: skillName }))}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          isSelectedSuggestion
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-foreground/80 hover:bg-muted/20'
                        )}
                      >
                        {skillName}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Notes</label>
                <input
                  value={formState.notes}
                  onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Exam prep, career switch, freelance work, university course..."
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Progress</label>
                <div className="rounded-lg border border-border bg-input px-4 py-3 text-sm text-muted-foreground">
                  Current and target levels are set automatically from study progress.
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingSkillId(null)
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <MagneticButton variant="primary" onClick={handleSaveSkill}>
                {editingSkillId ? 'Update Skill' : 'Save Skill'}
              </MagneticButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      <div className="grid gap-4 mb-8 md:grid-cols-2 2xl:grid-cols-4">
        {categoryStats.map((category, index) => {
          const Icon = category.icon
          const isActive = selectedCategory === category.key

          return (
            <GlassCard
              key={category.key}
              delay={index * 0.05}
              className={cn('cursor-pointer transition-all', isActive && 'ring-2 ring-primary')}
            >
              <button
                onClick={() => setSelectedCategory(isActive ? null : category.key)}
                className="w-full text-left"
              >
                <GlassCardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} p-3`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{category.label}</p>
                      <p className="text-2xl font-bold text-foreground">{category.average}%</p>
                      <p className="text-xs text-muted-foreground mt-1">{category.count} skills tracked</p>
                    </div>
                  </div>
                </GlassCardContent>
              </button>
            </GlassCard>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
        <GlassCard delay={0.2}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Skill Radar</h3>
              <span className="text-sm text-muted-foreground">
                {selectedCategory ? `${categoryConfig[selectedCategory].label}: ${averageLevel}%` : `Overall: ${averageLevel}%`}
              </span>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[420px]">
            <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <SkillRadar skills={filteredSkills.slice(0, 8)} />
            </Suspense>
          </GlassCardContent>
        </GlassCard>

        <GlassCard delay={0.3}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">All Skills</h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Filter className="w-4 h-4" />
                {selectedCategory ? 'Clear Filter' : 'All Skills'}
              </button>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="max-h-[420px] overflow-y-auto">
            {filteredSkills.length === 0 ? (
              <div className="flex h-full min-h-[220px] items-center justify-center text-center">
                <p className="max-w-xs text-sm text-muted-foreground">
                  No skills yet. Start by adding one course area or real-world skill.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {filteredSkills.map((skill, index) => {
                  const config = categoryConfig[skill.normalizedCategory]
                  const Icon = config.icon
                  const isSelected = selectedSkillId === skill.id

                  return (
                    <motion.li
                      key={skill.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.04 }}
                    >
                      <div
                        onClick={() => setSelectedSkillId(skill.id)}
                        className={cn(
                          'rounded-xl p-4 transition-colors cursor-pointer',
                          isSelected ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-muted/20 hover:bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} p-2.5`}>
                            <Icon className="w-full h-full text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="text-sm font-medium text-foreground">{skill.name}</span>
                              <span className="text-sm text-primary">{skill.level}%</span>
                            </div>
                            <Progress value={skill.level} className="h-1.5" />
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="text-xs text-muted-foreground">
                                {config.label}
                                {skill.track ? ` | ${skill.track}` : ''}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">Target: {skill.targetLevel}%</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditForm(skill)
                                  }}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  Edit
                                </button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSkillToDelete(skill)
                                      }}
                                      className="text-xs font-medium text-destructive hover:underline"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{skillToDelete?.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setSkillToDelete(null)}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          if (skillToDelete) {
                                            deleteSkill(skillToDelete.id)
                                            if (selectedSkillId === skillToDelete.id) {
                                              setSelectedSkillId(null)
                                            }
                                            setSkillToDelete(null)
                                          }
                                        }}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={cn('w-4 h-4 text-muted-foreground transition-transform', isSelected && 'translate-x-1 text-primary')} />
                        </div>
                      </div>
                    </motion.li>
                  )
                })}
              </ul>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard delay={0.35}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Selected Skill Guidance</h3>
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {!selectedSkill || !skillSummary || !skillGuidance ? (
              <div className="flex min-h-[280px] items-center justify-center text-center">
                <p className="max-w-xs text-sm text-muted-foreground">
                  Select a skill to view what to do next, how to practice it, and what outcome to aim for.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground">{formatCategoryLabel(selectedSkill.category)}</p>
                  <h3 className="text-2xl font-semibold text-foreground mt-1">{selectedSkill.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Track: {selectedSkill.track || categoryConfig[normalizeCategory(selectedSkill.category)].tracks[0]}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{selectedSkill.level}%</p>
                </div>
                <div className="rounded-xl bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{selectedSkill.targetLevel}%</p>
                </div>
              </div>

                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress Update</p>
                  <p className="mt-2 text-sm text-foreground">
                    Skill progress updates automatically when the user completes study lessons, practice work, and tests.
                  </p>
                </div>

                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stage</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{skillGuidance.stage}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{getStageDescription(skillGuidance.stage)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{skillGuidance.whyItMatters}</p>
                </div>

                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next Focus</p>
                  <p className="mt-2 text-sm text-foreground">{skillSummary.nextModule}</p>
                </div>

                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
                  <p className="mt-2 text-sm text-foreground">
                    {selectedSkill.notes?.trim() || 'No notes added yet. Edit this skill to save learner context, course goals, or career intent.'}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">What To Do Now</p>
                  <div className="space-y-2">
                    {skillGuidance.nextSteps.slice(0, 2).map((step) => (
                      <p key={step} className="text-sm text-foreground">{step}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/20 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Study On PathForge</p>
                  </div>
                  <p className="text-sm text-foreground">{skillGuidance.studyPlan.overview}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Beginner</p>
                    <p className="mt-2 text-sm text-foreground">{skillGuidance.studyPlan.beginner[0]}</p>
                  </div>
                  <div className="rounded-xl bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Intermediate</p>
                    <p className="mt-2 text-sm text-foreground">{skillGuidance.studyPlan.intermediate[0]}</p>
                  </div>
                  <div className="rounded-xl bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Advanced</p>
                    <p className="mt-2 text-sm text-foreground">{skillGuidance.studyPlan.advanced[0]}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Expected Outcome</p>
                  <p className="mt-2 text-sm text-foreground">{skillGuidance.outcome}</p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <p className="text-xs uppercase tracking-[0.18em] text-primary">Starting Level Assessment</p>
                      </div>
                      <p className="mt-3 text-sm text-foreground">
                        If the learner already knows the basics, use the assessment to start above 0% and unlock the right lessons automatically.
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Assessment can place the learner at 0%, 10%, 20%, 34%, 50%, or 70% based on answers and evidence.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAssessment(selectedSkill)}
                      className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      Assess my current level
                    </button>
                  </div>

                  {assessmentSkill?.id === selectedSkill.id && (
                    <div className="mt-5 space-y-4">
                      {assessmentQuestions.map((question) => (
                        <div key={question.id} className="rounded-xl border border-border/60 bg-background/20 p-4">
                          <p className="text-sm font-medium text-foreground">{question.prompt}</p>
                          <div className="mt-3 grid gap-2">
                            {question.options.map((option) => {
                              const isSelected = assessmentAnswers[question.id] === option.score
                              return (
                                <button
                                  key={`${question.id}-${option.label}`}
                                  type="button"
                                  onClick={() => setAssessmentAnswers((prev) => ({ ...prev, [question.id]: option.score }))}
                                  className={cn(
                                    'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                                    isSelected
                                      ? 'border-primary bg-primary/10 text-foreground'
                                      : 'border-border/60 bg-muted/10 text-foreground hover:bg-muted/20'
                                  )}
                                >
                                  {option.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}

                      <div className="rounded-xl border border-border/60 bg-background/20 p-4">
                        <p className="text-sm font-medium text-foreground">Evidence or learner note</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Write what the learner already built, practiced, or understands. Longer evidence allows a stronger starting level.
                        </p>
                        <textarea
                          value={assessmentEvidence}
                          onChange={(e) => setAssessmentEvidence(e.target.value)}
                          placeholder={`Example: I already built two small ${selectedSkill.name} tasks and can explain the beginner concepts.`}
                          className="mt-3 min-h-[120px] w-full rounded-xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={handleAssessmentSubmit}
                          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Save assessment result
                        </button>
                        {assessmentFeedback && (
                          <p className={cn('text-sm', assessmentFeedback.includes('complete') ? 'text-emerald-500' : 'text-amber-500')}>
                            {assessmentFeedback}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={`/dashboard/skills/${selectedSkill.id}`}
                  className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                >
                  <span>Open full study page for {selectedSkill.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        <GlassCard delay={0.4}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Learning Path</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSkill ? `Generated from ${selectedSkill.name}` : 'Select a skill to generate its path'}
                </p>
              </div>
              <Target className="w-5 h-5 text-muted-foreground" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[420px]">
            <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <RoadmapTimeline paths={selectedPath ? [selectedPath] : []} />
            </Suspense>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}
