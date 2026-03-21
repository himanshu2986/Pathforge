'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, BookOpen, CheckSquare, ChevronLeft, ChevronRight, ClipboardCheck, PlayCircle, Target } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Progress } from '@/components/ui/progress'
import { useAuthStore, useDashboardStore, type Skill } from '@/lib/store'
import { cn } from '@/lib/utils'

const categoryLabels: Record<string, string> = {
  technical: 'Technical',
  soft: 'Professional',
  domain: 'Data & AI',
  professional: 'Professional',
  'data-ai': 'Data & AI',
  business: 'Business',
  creative: 'Creative',
  language: 'Language',
  vocational: 'Vocational',
}

const categoryTracks: Record<string, string[]> = {
  technical: ['Web Development', 'Backend Development', 'Mobile Development', 'Cloud & DevOps', 'Cybersecurity', 'Core CS Subjects'],
  'data-ai': ['Data Analysis', 'Machine Learning', 'Artificial Intelligence', 'AI Tools', 'Business Intelligence', 'Programming Fundamentals'],
  professional: ['Communication', 'Leadership', 'Critical Thinking', 'Team Collaboration', 'Presentation Skills'],
  business: ['Marketing', 'Sales', 'Finance', 'Entrepreneurship', 'Operations'],
  creative: ['Graphic Design', 'UI/UX Design', 'Video Editing', 'Content Creation', 'Animation'],
  language: ['English Fluency', 'Spanish', 'German', 'Public Speaking', 'Writing'],
  vocational: ['Electrician Basics', 'Automotive', 'Healthcare Support', 'Construction', 'Hospitality'],
}

interface LessonItem {
  id: string
  group: string
  title: string
  shortLabel: string
  summary: string
  paragraphs: string[]
  takeaways: string[]
  exercise: string
  checkpoint: string
  quizQuestion: string
  quizOptions: string[]
  correctAnswer: number
}

interface DetailedCourse {
  overview: string
  lessons: LessonItem[]
}

interface PracticeCheck {
  label: string
  passed: boolean
}

interface AdaptiveQuiz {
  difficultyLabel: string
  helperText: string
  question: string
  options: string[]
  correctAnswer: number
}

interface ShuffledQuiz {
  options: string[]
  correctAnswer: number
}

interface AssessmentQuestion {
  id: string
  prompt: string
  options: {
    label: string
    score: number
  }[]
}

interface LessonAttemptState {
  failedAttempts: number
  totalAttempts: number
  cooldownUntil: number
}

type LessonAttemptMap = Record<string, LessonAttemptState>

interface PracticeConfig {
  mode: 'code' | 'analysis' | 'reflection' | 'plan' | 'hands-on'
  placeholder: string
  intro: string
  actionLabel: string
  minLength: number
  successMessage: string
  failureMessage: string
}

function normalizeCategory(category: string) {
  if (category === 'soft') return 'professional'
  if (category === 'domain') return 'data-ai'
  return category in categoryTracks ? category : 'technical'
}

function getStage(level: number) {
  if (level < 35) return 'Beginner'
  if (level < 70) return 'Developing'
  if (level < 85) return 'Job-ready'
  return 'Advanced'
}

function normalizeSkillName(name: string) {
  const normalized = name.trim().toLowerCase()

  const aliases: Record<string, string> = {
    'nodejs': 'node.js',
    'gen ai': 'artificial intelligence',
    'generative ai': 'artificial intelligence',
    'ai': 'artificial intelligence',
    'intro to html & css': 'intro to html & css',
    'sass': 'sass',
    'w3.css': 'w3.css',
    'asp': 'asp',
    'c plus plus': 'c++',
    'c sharp': 'c#',
    'golang': 'go',
  }

  return aliases[normalized] ?? normalized
}

function getAssessmentStorageKey(userId: string, skillId: string) {
  return `pathforge-skill-assessment:${userId}:${skillId}`
}

function getQuizAttemptStorageKey(userId: string, skillId: string) {
  return `pathforge-quiz-attempts:${userId}:${skillId}`
}

function buildAssessmentQuestions(skill: Skill): AssessmentQuestion[] {
  const track = skill.track?.trim() || categoryTracks[normalizeCategory(skill.category)][0]

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
        { label: `I already used ${skill.name} in real ${track} work`, score: 2 },
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
  if (level <= 20) return 'Start early in the beginner stage and use practice to close the gaps.'
  if (level <= 34) return 'You can begin near the end of the beginner stage.'
  if (level <= 50) return 'You can begin in the intermediate stage, but still review weak basics when needed.'
  return 'You can begin beyond the beginner stage and focus on stronger independent practice.'
}

function getStageDescription(stage: string) {
  if (stage === 'Beginner') return 'Complete the first lessons and pass the early tests.'
  if (stage === 'Developing') return 'Keep practicing and finish the intermediate lessons.'
  if (stage === 'Job-ready') return 'Build projects and clear the advanced tests.'
  return 'You can work independently and refine high-level skills.'
}

function buildAdaptiveQuiz(lesson: LessonItem | undefined, skill: Skill | null, progress: number): AdaptiveQuiz {
  if (!lesson || !skill) {
    return {
      difficultyLabel: 'Beginner',
      helperText: 'The test will adapt when a lesson is selected.',
      question: 'Select a lesson to begin.',
      options: ['Option 1', 'Option 2', 'Option 3'],
      correctAnswer: 0,
    }
  }

  const stage = getStage(progress)

  if (progress < 35) {
    return {
      difficultyLabel: 'Beginner',
      helperText: 'Basic recognition and core understanding.',
      question: lesson.quizQuestion,
      options: lesson.quizOptions,
      correctAnswer: lesson.correctAnswer,
    }
  }

  if (progress < 70) {
    return {
      difficultyLabel: 'Developing',
      helperText: 'Application-focused questions based on simple real tasks.',
      question: `You are using ${skill.name} in a small real task. What shows that you understood "${lesson.title}" correctly?`,
      options: [
        `You apply ${lesson.title} in a practical ${skill.track ?? 'project'} task and can explain why you used it.`,
        `You skip the practical step because reading the chapter once is enough.`,
        `You copy an answer without understanding how ${lesson.title} works.`,
      ],
      correctAnswer: 0,
    }
  }

  if (progress < 85) {
    return {
      difficultyLabel: 'Job-ready',
      helperText: 'Scenario and decision-based questions.',
      question: `A reviewer asks how "${lesson.title}" should be used in a real ${skill.track ?? 'workflow'} situation. Which answer is strongest?`,
      options: [
        `Use ${lesson.title} intentionally, justify the decision, and connect it to the result of the task.`,
        `Say the topic is not important because only final output matters.`,
        `Use ${lesson.title} randomly and hope it works without checking the result.`,
      ],
      correctAnswer: 0,
    }
  }

  return {
    difficultyLabel: 'Advanced',
    helperText: 'Evaluation and quality-focused questions.',
    question: `Which response best shows advanced understanding of "${lesson.title}" in ${skill.name}?`,
    options: [
      `Evaluate tradeoffs, apply ${lesson.title} with intention, and review the quality of the final result.`,
      `Focus only on speed and ignore whether ${lesson.title} was used correctly.`,
      `Treat ${lesson.title} as a memorized term without connecting it to output quality.`,
    ],
    correctAnswer: 0,
  }
}

function buildQuizPool(lesson: LessonItem | undefined, skill: Skill | null, progress: number): AdaptiveQuiz[] {
  const baseQuiz = buildAdaptiveQuiz(lesson, skill, progress)
  if (!lesson || !skill) return [baseQuiz]

  const track = skill.track?.trim() || categoryTracks[normalizeCategory(skill.category)][0]
  const title = lesson.title
  const category = normalizeCategory(skill.category)

  const categoryVariantBuilders: Record<string, () => AdaptiveQuiz[]> = {
    technical: () => [
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 2 focuses on implementation quality.`,
        question: `In a ${track} workflow, what is the best way to prove you understood "${title}"?`,
        options: [
          `Use ${title} in a real build, explain your decision, and review the final result.`,
          `Skip the workflow and only memorize the lesson heading.`,
          `Copy an example without checking whether it solves the actual task.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 3 focuses on debugging and review.`,
        question: `A reviewer says your ${skill.name} work still has issues around "${title}". What response is strongest?`,
        options: [
          `Check the implementation, explain the mistake, and improve the output based on the review.`,
          `Ignore the review because the code runs once.`,
          `Rename things and submit again without checking the behavior.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 4 focuses on production judgment.`,
        question: `Which choice shows stronger professional use of "${title}" in ${skill.name}?`,
        options: [
          `Use ${title} intentionally, test the result, and connect it to maintainable output.`,
          `Use ${title} randomly as long as the page looks different.`,
          `Avoid ${title} completely because deeper concepts are unnecessary.`,
        ],
        correctAnswer: 0,
      },
    ],
    'data-ai': () => [
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 2 focuses on reasoning with evidence.`,
        question: `While working on ${skill.name}, what best proves you understood "${title}"?`,
        options: [
          `You can explain the logic, show the data or method used, and justify the result.`,
          `You only copy a final chart or model score without explaining it.`,
          `You skip checking whether the result makes sense.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 3 focuses on analysis quality.`,
        question: `A teammate asks why you used "${title}" in a ${track} task. Which answer is strongest?`,
        options: [
          `It fits the problem, supports clearer decisions, and you can explain the tradeoff.`,
          `It sounded advanced, so you used it without checking.`,
          `You picked it randomly because the output looked acceptable.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 4 focuses on validation.`,
        question: `What is the best next step after using "${title}" in ${skill.name}?`,
        options: [
          `Review the result, validate the reasoning, and note what could be improved.`,
          `Assume the first output is correct and move on immediately.`,
          `Hide the process and only keep the final answer.`,
        ],
        correctAnswer: 0,
      },
    ],
    professional: () => [
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 2 focuses on behavior in real situations.`,
        question: `In a real teamwork situation, what best shows you understood "${title}"?`,
        options: [
          `You apply ${title} in communication or collaboration and adjust based on feedback.`,
          `You describe the concept once but never use it with others.`,
          `You avoid practice because soft skills cannot be improved deliberately.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 3 focuses on reflection.`,
        question: `A mentor asks how "${title}" improved your ${track} work. Which answer is strongest?`,
        options: [
          `You describe the situation, the behavior you used, and the result it created.`,
          `You say improvement cannot be explained and is only a feeling.`,
          `You skip reflection because results do not matter in professional skills.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 4 focuses on growth evidence.`,
        question: `What is the strongest proof of progress for "${title}"?`,
        options: [
          `A real interaction, clear reflection, and visible improvement over time.`,
          `Only reading about the topic once.`,
          `Claiming confidence without showing any practice.`,
        ],
        correctAnswer: 0,
      },
    ],
    business: () => [
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 2 focuses on business outcomes.`,
        question: `In ${track}, what best shows you understood "${title}"?`,
        options: [
          `You connect ${title} to audience, metrics, decisions, or business results.`,
          `You discuss the concept without linking it to any outcome.`,
          `You pick actions randomly and do not measure anything.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 3 focuses on strategic thinking.`,
        question: `A manager asks why you used "${title}" for this business task. Which answer is strongest?`,
        options: [
          `It matches the goal, fits the audience or process, and can be evaluated with results.`,
          `It sounded impressive, so you used it without a plan.`,
          `It does not need any metric or review once started.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 4 focuses on improvement loops.`,
        question: `After using "${title}", what should a strong learner do next?`,
        options: [
          `Review the outcome, note what worked, and improve the next business decision.`,
          `Assume success without checking performance.`,
          `Ignore the audience response entirely.`,
        ],
        correctAnswer: 0,
      },
    ],
    creative: () => [
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 2 focuses on creative execution.`,
        question: `What best proves you understood "${title}" in a creative workflow?`,
        options: [
          `You create something with ${title}, review the quality, and refine it after feedback.`,
          `You only collect inspiration and never make an actual output.`,
          `You stop after the first rough attempt without revision.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 3 focuses on critique.`,
        question: `A reviewer gives feedback on your ${skill.name} work. What response is strongest?`,
        options: [
          `Use the feedback to improve composition, clarity, or craft and explain the changes.`,
          `Ignore feedback because creative work cannot be reviewed.`,
          `Change random details without understanding the issue.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 4 focuses on portfolio quality.`,
        question: `Which choice shows stronger mastery of "${title}" in ${track}?`,
        options: [
          `Produce a polished output and justify the creative choices behind it.`,
          `Keep only unfinished drafts without reflection.`,
          `Rely on copying style without understanding the principles used.`,
        ],
        correctAnswer: 0,
      },
    ],
    language: () => [
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 2 focuses on communication use.`,
        question: `What best proves progress in "${title}" for ${skill.name}?`,
        options: [
          `You use it in speaking, reading, listening, or writing and can explain your mistakes.`,
          `You only memorize words once without using them.`,
          `You avoid practice because understanding alone is enough.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 3 focuses on fluency and feedback.`,
        question: `A teacher asks how you improved "${title}". Which answer is strongest?`,
        options: [
          `You describe the practice, the correction you received, and how your output changed.`,
          `You say language skill cannot be measured in real use.`,
          `You only mention watching lessons without practicing.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 4 focuses on transfer to real communication.`,
        question: `Which choice shows stronger understanding of "${title}" in ${track}?`,
        options: [
          `Apply it clearly in a real conversation, message, or speaking task.`,
          `Keep it as a memorized rule without ever using it.`,
          `Skip correction because small mistakes never matter.`,
        ],
        correctAnswer: 0,
      },
    ],
    vocational: () => [
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 2 focuses on safe practical work.`,
        question: `In hands-on ${track} work, what best proves you understood "${title}"?`,
        options: [
          `You apply ${title} safely, accurately, and can explain the correct process.`,
          `You rush the task without checking safety or quality.`,
          `You avoid hands-on practice and rely only on theory.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 3 focuses on standards and consistency.`,
        question: `A trainer reviews your use of "${title}". Which response is strongest?`,
        options: [
          `Check the standard, correct the work, and repeat the process correctly.`,
          `Ignore the review if the task is finished quickly.`,
          `Change steps randomly without understanding the standard.`,
        ],
        correctAnswer: 0,
      },
      {
        difficultyLabel: baseQuiz.difficultyLabel,
        helperText: `${baseQuiz.helperText} Variant 4 focuses on repeatable competence.`,
        question: `What shows a strong learner has really learned "${title}"?`,
        options: [
          `They can repeat the task safely and accurately without step-by-step copying.`,
          `They complete it once by luck and cannot explain it.`,
          `They skip review because practice quality does not matter.`,
        ],
        correctAnswer: 0,
      },
    ],
  }

  return [baseQuiz, ...(categoryVariantBuilders[category]?.() ?? categoryVariantBuilders.technical())]
}

function getQuizDurationSeconds(difficultyLabel: string) {
  if (difficultyLabel === 'Beginner') return 45
  if (difficultyLabel === 'Developing') return 75
  if (difficultyLabel === 'Job-ready') return 105
  return 135
}

function getPracticeConfig(skill: Skill, lesson: LessonItem | undefined): PracticeConfig {
  const category = normalizeCategory(skill.category)
  const track = skill.track?.trim() || categoryTracks[category][0]
  const lessonTitle = lesson?.title ?? `${skill.name} practice`

  const configs: Record<string, PracticeConfig> = {
    technical: {
      mode: 'code',
      placeholder: 'Write your code here...',
      intro: 'Write and practice code for this lesson here. Your work is saved for this lesson.',
      actionLabel: 'Run Code Test',
      minLength: 40,
      successMessage: 'Practice code looks valid for this lesson.',
      failureMessage: 'Practice code is incomplete. Fix the failed checks below.',
    },
    'data-ai': {
      mode: 'analysis',
      placeholder: 'Write your dataset choice, method, reasoning, and result here...',
      intro: 'Write your analysis, method, or model reasoning here. Show your steps, not only the final answer.',
      actionLabel: 'Check Analysis',
      minLength: 160,
      successMessage: 'Analysis practice looks detailed enough for this lesson.',
      failureMessage: 'Add more detail about the method, evidence, and outcome before moving on.',
    },
    professional: {
      mode: 'reflection',
      placeholder: 'Describe the situation, what you said or did, what happened, and what you learned...',
      intro: 'Write a real communication, teamwork, or leadership reflection for this lesson.',
      actionLabel: 'Check Reflection',
      minLength: 140,
      successMessage: 'Reflection saved. You showed enough real practice for this lesson.',
      failureMessage: 'Write a more complete reflection with situation, action, and outcome.',
    },
    business: {
      mode: 'plan',
      placeholder: 'Write the goal, audience, decision, metric, and expected result here...',
      intro: 'Write your business plan, campaign idea, or decision framework for this lesson.',
      actionLabel: 'Check Plan',
      minLength: 150,
      successMessage: 'Business practice saved. Your plan is detailed enough for this lesson.',
      failureMessage: 'Add more detail about goal, audience/process, and expected result.',
    },
    creative: {
      mode: 'reflection',
      placeholder: 'Describe your concept, creative choices, feedback, revisions, and final output...',
      intro: 'Write the idea, design choices, revision notes, and outcome for this lesson.',
      actionLabel: 'Check Creative Work',
      minLength: 140,
      successMessage: 'Creative practice saved. You explained the work clearly enough.',
      failureMessage: 'Add more detail about the concept, revisions, and final creative decisions.',
    },
    language: {
      mode: 'reflection',
      placeholder: 'Write your speaking, reading, listening, or writing practice with corrections and improvements...',
      intro: 'Write your language practice, mistakes, corrections, and improved version for this lesson.',
      actionLabel: 'Check Language Practice',
      minLength: 130,
      successMessage: 'Language practice saved. You showed enough real use for this lesson.',
      failureMessage: 'Add more practice detail, correction notes, and an improved response.',
    },
    vocational: {
      mode: 'hands-on',
      placeholder: 'Describe the task, tools, safety steps, process, and final result here...',
      intro: 'Write the hands-on process, tools used, safety checks, and result for this lesson.',
      actionLabel: 'Check Task Review',
      minLength: 150,
      successMessage: 'Task review saved. Your hands-on process is detailed enough for this lesson.',
      failureMessage: 'Add more detail about the process, tools, safety, and result before moving on.',
    },
  }

  return {
    ...configs[category],
    placeholder: configs[category].placeholder.replace('this lesson', lessonTitle).replace('here...', `for ${lessonTitle} here...`),
    intro: configs[category].intro.replace('this lesson', lessonTitle).replace('for this lesson', `for ${lessonTitle}`),
  }
}

function hashSeed(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash
}

function shuffleQuizOptions(quiz: AdaptiveQuiz, seed: string): ShuffledQuiz {
  const indexedOptions = quiz.options.map((option, index) => ({
    option,
    index,
    rank: hashSeed(`${seed}:${option}:${index}`),
  }))

  indexedOptions.sort((a, b) => a.rank - b.rank)

  return {
    options: indexedOptions.map((item) => item.option),
    correctAnswer: indexedOptions.findIndex((item) => item.index === quiz.correctAnswer),
  }
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

function buildLearningPath(skill: Skill) {
  const category = normalizeCategory(skill.category)
  const track = skill.track?.trim() || categoryTracks[category][0]
  const progress = skill.targetLevel > 0 ? clamp(Math.round((skill.level / skill.targetLevel) * 100)) : 0

  return {
    track,
    progress,
    modules: [
      `Foundations of ${skill.name}`,
      `${track} core workflow`,
      `${skill.name} guided practice`,
      `${skill.name} real project`,
      `${skill.name} advanced review`,
    ],
  }
}

function getPracticeStarter(skill: Skill, lesson: LessonItem | undefined) {
  const skillKey = skill.name.trim().toLowerCase()
  if (skillKey === 'html' || skillKey === 'html5') {
    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8" />',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      `  <title>${lesson?.title ?? 'HTML Practice'}</title>`,
      '</head>',
      '<body>',
      '  <h1>Hello HTML</h1>',
      '  <p>Build this lesson example here.</p>',
      '</body>',
      '</html>',
    ].join('\n')
  }

  const config = getPracticeConfig(skill, lesson)
  const track = skill.track?.trim() || categoryTracks[normalizeCategory(skill.category)][0]
  const lessonTitle = lesson?.title ?? `${skill.name} practice`

  if (config.mode === 'analysis') {
    return [
      `Lesson: ${lessonTitle}`,
      `Track: ${track}`,
      '',
      'Goal:',
      `Explain what you are trying to understand or solve with ${skill.name}.`,
      '',
      'Method:',
      'Write the steps, logic, or tool choice you would use.',
      '',
      'Evidence:',
      'Add the data, indicators, or observations you would check.',
      '',
      'Result and Review:',
      'Write what result you expect and how you would validate it.',
    ].join('\n')
  }

  if (config.mode === 'plan') {
    return [
      `Lesson: ${lessonTitle}`,
      `Track: ${track}`,
      '',
      'Objective:',
      'Write the goal of this plan.',
      '',
      'Audience / Context:',
      'Describe who this is for and why it matters.',
      '',
      'Approach:',
      'Write the actions, decision, or workflow you would follow.',
      '',
      'Metric / Review:',
      'Explain how you would measure success or improve the result.',
    ].join('\n')
  }

  if (config.mode === 'hands-on') {
    return [
      `Lesson: ${lessonTitle}`,
      `Track: ${track}`,
      '',
      'Task:',
      'Describe the real task you would perform.',
      '',
      'Tools and Materials:',
      'List the tools, materials, or equipment needed.',
      '',
      'Safety / Standards:',
      'Write the safety checks or standards you must follow.',
      '',
      'Process and Result:',
      'Explain the steps and the final result you expect.',
    ].join('\n')
  }

  return [
    `Lesson: ${lessonTitle}`,
    `Track: ${track}`,
    '',
    'Situation:',
    'Describe the real situation or task.',
    '',
    'Action:',
    'Write what you said, wrote, designed, or decided.',
    '',
    'Result:',
    'Explain the outcome, feedback, or correction.',
    '',
    'Improvement:',
    'Write what you would improve next time.',
  ].join('\n')
}

function getCodeChecks(skill: Skill, lesson: LessonItem | undefined, code: string): PracticeCheck[] {
  const skillKey = skill.name.trim().toLowerCase()
  if (skillKey === 'html' || skillKey === 'html5') {
    const normalized = code.toLowerCase()
    return [
      { label: 'Has a valid HTML document structure', passed: normalized.includes('<html') && normalized.includes('</html>') },
      { label: 'Includes a page heading', passed: normalized.includes('<h1') || normalized.includes('<h2') },
      { label: 'Includes body content for this lesson', passed: normalized.includes('<p') || normalized.includes('<section') || normalized.includes('<main') },
    ]
  }

  if (skillKey === 'css') {
    const normalized = code.toLowerCase()
    return [
      { label: 'Defines at least one selector block', passed: normalized.includes('{') && normalized.includes('}') },
      { label: 'Uses a styling property', passed: /(color|display|margin|padding|font|background|border)\s*:/.test(normalized) },
      { label: 'Contains a class or element selector', passed: /^\s*([.#]?[a-z][\w-]*)\s*\{/m.test(normalized) },
    ]
  }

  if (skillKey === 'javascript') {
    const normalized = code.toLowerCase()
    return [
      { label: 'Declares a variable or function', passed: /(const|let|function)\s+/.test(normalized) },
      { label: 'Uses logic or output', passed: /(if\s*\(|console\.log|return\s+)/.test(normalized) },
      { label: 'Contains valid code structure', passed: normalized.trim().length > 20 },
    ]
  }

  if (skillKey === 'react') {
    const normalized = code.toLowerCase()
    return [
      { label: 'Defines a component', passed: /function\s+[a-z0-9_]+\s*\(|const\s+[a-z0-9_]+\s*=/.test(normalized) },
      { label: 'Returns JSX', passed: normalized.includes('return (') || normalized.includes('<div') || normalized.includes('<section') },
      { label: 'Uses props or state-like UI logic', passed: /(props|usestate|onclick|map\()/.test(normalized) },
    ]
  }

  return []
}

function getPracticeChecks(skill: Skill, lesson: LessonItem | undefined, content: string): PracticeCheck[] {
  const config = getPracticeConfig(skill, lesson)
  const normalized = content.toLowerCase()

  if (config.mode === 'code') {
    return getCodeChecks(skill, lesson, content)
  }

  const commonChecks: PracticeCheck[] = [
    { label: 'Includes a complete written response', passed: content.trim().length >= config.minLength },
    { label: 'Mentions the lesson topic or skill', passed: normalized.includes(skill.name.toLowerCase()) || normalized.includes((lesson?.title ?? '').toLowerCase()) },
  ]

  if (config.mode === 'analysis') {
    return [
      ...commonChecks,
      { label: 'Explains method or reasoning', passed: /(method|steps|reason|approach|analysis)/.test(normalized) },
      { label: 'Includes evidence or validation', passed: /(data|evidence|result|metric|validate)/.test(normalized) },
    ]
  }

  if (config.mode === 'plan') {
    return [
      ...commonChecks,
      { label: 'Defines an objective or goal', passed: /(goal|objective|target)/.test(normalized) },
      { label: 'Includes audience, metric, or business result', passed: /(audience|metric|result|customer|kpi)/.test(normalized) },
    ]
  }

  if (config.mode === 'hands-on') {
    return [
      ...commonChecks,
      { label: 'Describes process or steps', passed: /(step|process|procedure|task)/.test(normalized) },
      { label: 'Includes safety, tools, or standards', passed: /(safety|tool|standard|material|equipment)/.test(normalized) },
    ]
  }

  return [
    ...commonChecks,
    { label: 'Describes action or practice', passed: /(action|practice|said|wrote|did|created|designed)/.test(normalized) },
    { label: 'Includes result, feedback, or improvement', passed: /(result|feedback|improv|correction|outcome)/.test(normalized) },
  ]
}

function buildStructuredCourse(
  skill: Skill,
  overview: string,
  sections: {
    beginner: string[]
    intermediate: string[]
    advanced: string[]
  }
): DetailedCourse {
  const track = buildLearningPath(skill).track
  let lessonIndex = 1
  const toLessons = (group: string, titles: string[]) =>
    titles.map((title) => {
      const current = lessonIndex++
      return {
        id: `${normalizeSkillName(skill.name)}-${current}`,
        group,
        title,
        shortLabel: title,
        summary: `${title} is a core part of the ${skill.name} learning path for ${track}.`,
        paragraphs: [
          `${title} helps the learner understand one important area of ${skill.name}. This chapter should explain the core idea, where it is used, and why it matters for ${track}.`,
          `The learner should move beyond definitions and connect ${title} to practical usage. By the end of the lesson, they should know how to recognize the topic and use it in a realistic task.`,
          `This chapter should also help the learner avoid common mistakes and prepare them for the next lesson in the ${skill.name} sequence.`,
        ],
        takeaways: [
          `Understand the purpose of ${title}`,
          `Use ${title} in practical ${skill.name} work`,
          `Connect ${title} to the ${track} workflow`,
        ],
        exercise: `Complete one focused practice task for ${title} and save your output or notes in PathForge.`,
        checkpoint: `Move on when you can explain ${title}, use it once in practice, and review your own result clearly.`,
        quizQuestion: `What is the goal of the "${title}" lesson?`,
        quizOptions: [
          `Understand and apply ${title} in ${skill.name}`,
          'Skip practice and continue',
          'Memorize terms without using them',
        ],
        correctAnswer: 0,
      }
    })

  return {
    overview,
    lessons: [
      ...toLessons('Beginner', sections.beginner),
      ...toLessons('Intermediate', sections.intermediate),
      ...toLessons('Advanced', sections.advanced),
      {
        id: `${normalizeSkillName(skill.name)}-${lessonIndex++}`,
        group: 'Practice',
        title: `${skill.name} capstone practice`,
        shortLabel: `${skill.name} capstone`,
        summary: `Use the full ${skill.name} skill set in one realistic build or assignment.`,
        paragraphs: [
          `This capstone is where the learner combines the important parts of ${skill.name} in one place.`,
          `The work should connect directly to ${track} and should be strong enough to save as proof of progress.`,
          `A complete capstone shows that the learner can use the skill with less hand-holding and more independence.`,
        ],
        takeaways: [
          `Combine multiple ${skill.name} topics together`,
          `Create one real output`,
          `Prepare proof for a skill-level increase`,
        ],
        exercise: `Build one capstone task using ${skill.name} and save the result as a project submission.`,
        checkpoint: `Move on when you have one finished output that shows multiple ${skill.name} concepts working together.`,
        quizQuestion: `What is the purpose of the ${skill.name} capstone?`,
        quizOptions: [
          'Combine the learned topics into one practical output',
          'Skip implementation completely',
          'Only rewrite definitions',
        ],
        correctAnswer: 0,
      },
      {
        id: `${normalizeSkillName(skill.name)}-${lessonIndex}`,
        group: 'Update',
        title: `Update ${skill.name} skill level`,
        shortLabel: `Update ${skill.name}`,
        summary: `Review your completed work and decide if your ${skill.name} level should rise.`,
        paragraphs: [
          `Skill levels should increase only when there is real evidence. For ${skill.name}, that means lessons completed, practice work saved, and a capstone or project result.`,
          `This review lesson is where the learner checks their proof and decides if they are ready to move their skill forward.`,
          `The goal is honest progress. PathForge should reward real practice rather than random self-rating.`,
        ],
        takeaways: [
          `Review completed work carefully`,
          `Use evidence instead of guesswork`,
          `Update the skill only after real progress`,
        ],
        exercise: `Review your lessons, code or written practice, and capstone work before deciding whether your ${skill.name} level should increase.`,
        checkpoint: `Increase the skill level only when you can explain the work and show the result clearly.`,
        quizQuestion: `When should the learner increase the ${skill.name} level?`,
        quizOptions: [
          'After completing real work with evidence',
          'Before starting the practice',
          'Without any output',
        ],
        correctAnswer: 0,
      },
    ],
  }
}

function buildStudyKit(skill: Skill) {
  const category = normalizeCategory(skill.category)
  const track = skill.track?.trim() || categoryTracks[category][0]
  const stage = getStage(skill.level)

  return {
    categoryLabel: categoryLabels[category] ?? 'Technical',
    stage,
    overview: `${skill.name} is being studied inside PathForge through structured lessons, guided practice, and progress checkpoints for ${track}.`,
    beginner: [
      `Introduction to ${skill.name}`,
      `${skill.name} basics for ${track}`,
      `First guided task using ${skill.name}`,
    ],
    intermediate: [
      `${skill.name} workflow practice`,
      `${skill.name} problem solving`,
      `${skill.name} applied exercises in ${track}`,
    ],
    advanced: [
      `${skill.name} advanced scenarios`,
      `${skill.name} quality improvement`,
      `${skill.name} portfolio or case-study work`,
    ],
    concepts: [
      `${skill.name} fundamentals`,
      `${track} workflow`,
      'Common mistakes',
      'Real-world use cases',
    ],
    videos: [
      `PathForge ${skill.name} introduction`,
      `PathForge ${skill.name} guided practice`,
      `PathForge ${skill.name} deep dive`,
    ],
    checkpoints: [
      `You can explain the core ideas of ${skill.name}.`,
      `You completed at least one practical task in ${track}.`,
      `You can increase your level with proof such as notes, output, code, or a project.`,
    ],
  }
}

function buildHtmlCourse(skill: Skill): DetailedCourse {
  const lesson = (
    id: string,
    group: string,
    title: string,
    summary: string,
    paragraphs: string[],
    takeaways: string[],
    exercise: string,
    checkpoint: string,
    quizQuestion: string,
    quizOptions: string[],
    correctAnswer: number
  ): LessonItem => ({
    id,
    group,
    title,
    shortLabel: title,
    summary,
    paragraphs,
    takeaways,
    exercise,
    checkpoint,
    quizQuestion,
    quizOptions,
    correctAnswer,
  })

  return {
    overview:
      'This HTML course is designed as a full A to Z path. It covers structure, semantic markup, text, media, links, lists, tables, forms, accessibility, metadata, layout thinking, and real page building so the learner does not miss the foundation.',
    lessons: [
      lesson(
        'html-1',
        'Beginner',
        'HTML Home',
        'Understand what HTML is, why it exists, and how it forms the structure of the web.',
        [
          'HTML stands for HyperText Markup Language. It is the markup language used to describe the structure of a web page. It does not control advanced styling like CSS or behavior like JavaScript. Its job is to define meaning and structure.',
          'A browser reads HTML and turns it into the page that users see. Headings, paragraphs, links, forms, images, lists, tables, and sections all begin with HTML.',
          'When HTML is written well, the page becomes easier to read, style, maintain, and use with assistive technologies. Strong HTML is the base of strong frontend work.',
        ],
        ['HTML defines structure', 'Browsers render HTML into pages', 'Good HTML improves accessibility and maintainability'],
        'Open a simple webpage and identify which parts are headings, paragraphs, images, links, and sections.',
        'Move on when you can explain what HTML does and how it differs from CSS and JavaScript.',
        'What is HTML mainly used for?',
        ['Structuring web page content', 'Styling every page visually', 'Running backend servers'],
        0
      ),
      lesson(
        'html-2',
        'Beginner',
        'HTML Page Structure',
        'Learn the core skeleton of an HTML document and why each major part exists.',
        [
          'A basic HTML page contains `<!DOCTYPE html>`, `html`, `head`, and `body`. The doctype tells the browser to use modern HTML rules.',
          'The `html` element wraps the full document. The `head` stores metadata such as title, charset, viewport, and linked resources. The `body` contains visible content.',
          'This structure should become automatic. Without it, pages may behave inconsistently or be harder to maintain.',
        ],
        ['Know the role of doctype, html, head, and body', 'Separate metadata from visible content', 'Build a valid base document'],
        'Write a blank HTML page from scratch with a title and one heading in the body.',
        'Move on when you can write a complete minimal HTML document without copying.',
        'Which part of an HTML document holds visible page content?',
        ['head', 'body', 'title'],
        1
      ),
      lesson(
        'html-3',
        'Beginner',
        'HTML Editors and Workflow',
        'Understand how HTML is written, saved, opened, and tested during development.',
        [
          'HTML can be written in any text editor, but code editors like VS Code make work faster through syntax highlighting, file management, and extensions.',
          'A normal workflow is: create a `.html` file, write markup, save it, open it in the browser, then inspect it using DevTools.',
          'Good workflow habits matter. Learners should preview often, check the DOM in DevTools, and read errors carefully.',
        ],
        ['Use an editor effectively', 'Preview changes in the browser', 'Inspect structure with DevTools'],
        'Create an `index.html` file, open it in the browser, and inspect the DOM tree in DevTools.',
        'Move on when you can edit, save, preview, and inspect an HTML file independently.',
        'What is a common workflow step after saving an HTML file?',
        ['Delete the file', 'Preview it in the browser', 'Convert it to CSS'],
        1
      ),
      lesson(
        'html-4',
        'Beginner',
        'HTML Elements and Tags',
        'Learn how HTML tags work and how elements are opened, nested, and closed.',
        [
          'Most HTML uses opening and closing tags, such as `<p>Text</p>`. Together with content, that forms an element.',
          'Some elements are void elements, such as `img` and `br`, which do not wrap content in the same way.',
          'Correct nesting matters. If tags are mis-nested, the browser may attempt recovery, but the structure becomes harder to trust and maintain.',
        ],
        ['Understand tags vs elements', 'Use correct nesting', 'Recognize common void elements'],
        'Build a small section with a heading, paragraph, image, and link using valid nesting.',
        'Move on when you can explain how an element is formed and why nesting matters.',
        'Which is a void element in HTML?',
        ['section', 'img', 'p'],
        1
      ),
      lesson(
        'html-5',
        'Beginner',
        'HTML Attributes',
        'Use attributes to give elements more information and behavior.',
        [
          'Attributes are written inside start tags. They provide additional meaning or configuration, such as `href`, `src`, `alt`, `class`, `id`, and `type`.',
          'Some attributes are essential. For example, an anchor without `href` is not a real navigation link, and an image without useful `alt` text harms accessibility.',
          'Attributes should be chosen intentionally, not added randomly. Each one changes meaning, behavior, or how code is targeted later.',
        ],
        ['Use attributes correctly', 'Know common attributes', 'Choose attributes with purpose'],
        'Create an image with `src` and `alt`, a link with `href`, and a button with `type`.',
        'Move on when you can explain what each common attribute is doing.',
        'Which attribute gives a link its destination?',
        ['alt', 'href', 'class'],
        1
      ),
      lesson(
        'html-6',
        'Beginner',
        'Headings and Paragraphs',
        'Use text structure properly so content is clear and meaningful.',
        [
          'Headings range from `h1` to `h6` and should reflect content hierarchy, not just visual size. Usually a page has one main `h1` and then nested sections below it.',
          'Paragraphs are written with `p` and should represent real blocks of text, not be used only for spacing.',
          'Good text structure makes pages easier to scan for users, search engines, and assistive technologies.',
        ],
        ['Use heading levels logically', 'Write paragraphs as content blocks', 'Preserve content hierarchy'],
        'Write a page with one main heading, three subheadings, and paragraphs under each.',
        'Move on when your headings describe structure instead of appearance.',
        'What should heading levels represent?',
        ['Visual color only', 'Content hierarchy', 'Page animation'],
        1
      ),
      lesson(
        'html-7',
        'Beginner',
        'Text Formatting',
        'Learn inline text elements and when to use semantic emphasis.',
        [
          'HTML includes inline tags such as `strong`, `em`, `mark`, `small`, `sup`, `sub`, and `code` for meaning within text.',
          'These should not be used only to force appearance. For example, `strong` carries importance and `em` conveys emphasis.',
          'Choosing the right text element helps screen readers and improves clarity in technical and editorial content.',
        ],
        ['Use semantic inline text elements', 'Avoid presentational misuse', 'Add meaning inside paragraphs'],
        'Write one paragraph using `strong`, `em`, and `code` in sensible places.',
        'Move on when you can explain why semantic formatting is better than visual-only formatting.',
        'Which tag carries semantic importance in text?',
        ['strong', 'div', 'span only for layout'],
        0
      ),
      lesson(
        'html-8',
        'Beginner',
        'Links and Navigation',
        'Understand how links connect pages, sections, and external resources.',
        [
          'Links are built with the `a` tag and usually require `href`. They can point to internal pages, external pages, files, email addresses, or section IDs.',
          'Link text should be descriptive. Users should understand where the link goes without vague text such as `click here`.',
          'Good navigation is a major usability skill. Links should be meaningful, accessible, and easy to scan.',
        ],
        ['Create internal and external links', 'Use descriptive link text', 'Understand anchors and navigation'],
        'Build a small nav bar with three links and add one page-section jump link.',
        'Move on when you can create useful links and explain where each one leads.',
        'What makes link text better for users?',
        ['It is descriptive', 'It always says click here', 'It is hidden'],
        0
      ),
      lesson(
        'html-9',
        'Intermediate',
        'Images and Media',
        'Add images correctly and understand basic media embedding.',
        [
          'Images use the `img` tag with `src` and `alt`. The `alt` attribute is not decoration. It provides a text alternative when the image cannot be seen.',
          'Media can also include `audio`, `video`, and embedded content through iframes, but each should be used thoughtfully.',
          'When adding media, learners should think about meaning, accessibility, loading, and layout rather than just placing files on the page.',
        ],
        ['Use `img` correctly', 'Write meaningful alt text', 'Understand the basics of media embedding'],
        'Add two images: one informative with descriptive alt text and one decorative example with intentionally minimal alternative text reasoning.',
        'Move on when you can justify your alt text choices.',
        'What is the main purpose of alt text?',
        ['To change image size', 'To provide a text alternative', 'To add CSS styling'],
        1
      ),
      lesson(
        'html-10',
        'Intermediate',
        'Lists and Content Grouping',
        'Use ordered, unordered, and description lists for grouped information.',
        [
          'HTML has `ul`, `ol`, and `dl` for different types of grouped content. Each has a purpose and should match the meaning of the content.',
          'Lists are useful for navigation menus, steps, feature sets, definitions, and grouped details.',
          'Strong grouping improves readability and makes content easier to style later.',
        ],
        ['Use the correct list type', 'Group related information cleanly', 'Avoid fake list formatting'],
        'Build one unordered list, one ordered list, and one description list with meaningful content.',
        'Move on when you can choose the right list type without guessing.',
        'Which list type is best for ordered steps?',
        ['ul', 'ol', 'dl only'],
        1
      ),
      lesson(
        'html-11',
        'Intermediate',
        'Tables',
        'Understand when tables are appropriate and how to structure them clearly.',
        [
          'Tables are for tabular data, not for page layout. They are built with `table`, `thead`, `tbody`, `tr`, `th`, and `td`.',
          'Header cells should identify row or column meaning. Proper table structure helps users understand data relationships.',
          'If content is not true data in rows and columns, a table is usually the wrong choice.',
        ],
        ['Use tables only for data', 'Structure rows and headers properly', 'Avoid layout misuse'],
        'Create a table showing courses, durations, and skill levels with a clear header row.',
        'Move on when you can explain why a table is for data rather than layout.',
        'What should HTML tables mainly be used for?',
        ['Page layout', 'Tabular data', 'Animations'],
        1
      ),
      lesson(
        'html-12',
        'Intermediate',
        'Forms and Inputs',
        'Build forms that collect information clearly and accessibly.',
        [
          'Forms use `form`, `label`, `input`, `select`, `textarea`, and `button`. Labels should be connected correctly so users understand each field.',
          'Input types matter. Email, password, number, checkbox, radio, and date inputs each communicate different intent.',
          'A good form is clear, grouped logically, and easy to complete. Accessibility and validation should be considered early.',
        ],
        ['Use labels and inputs properly', 'Choose correct input types', 'Build accessible forms'],
        'Create a sign-up form with name, email, password, course interest, and submit button.',
        'Move on when each field in your form is clearly labeled and meaningful.',
        'Why are labels important in forms?',
        ['They connect fields to clear meaning', 'They replace all input types', 'They are only for color'],
        0
      ),
      lesson(
        'html-13',
        'Intermediate',
        'Semantic HTML',
        'Use elements that describe page meaning instead of generic containers everywhere.',
        [
          'Semantic HTML includes elements such as `header`, `nav`, `main`, `section`, `article`, `aside`, and `footer`.',
          'These elements improve structure and communicate meaning to browsers, developers, and assistive technologies.',
          'Learners often overuse `div`. A stronger skill level means choosing meaningful semantic elements when they actually fit the content.',
        ],
        ['Understand major semantic elements', 'Reduce unnecessary generic containers', 'Build clearer page structure'],
        'Rebuild a simple landing page with semantic sections instead of only `div` blocks.',
        'Move on when you can justify why each semantic element was chosen.',
        'What is a benefit of semantic HTML?',
        ['Clearer meaning and structure', 'It removes the need for content', 'It blocks accessibility'],
        0
      ),
      lesson(
        'html-14',
        'Intermediate',
        'Head Metadata and SEO Basics',
        'Learn the importance of title, meta tags, charset, viewport, and document metadata.',
        [
          'The `head` section is not visible on the page, but it is essential. It includes `title`, `meta charset`, `meta viewport`, and other information.',
          'Good metadata improves search visibility, browser behavior, and page clarity in tabs and sharing contexts.',
          'Learners should know that strong HTML includes more than visible body content. Metadata is part of a complete document.',
        ],
        ['Use title and core meta tags', 'Understand why metadata matters', 'Create a more complete document'],
        'Add title, charset, viewport, and description metadata to a page.',
        'Move on when you can explain why metadata affects real users.',
        'Where is page metadata usually placed?',
        ['Inside body', 'Inside head', 'Inside footer only'],
        1
      ),
      lesson(
        'html-15',
        'Advanced',
        'HTML Layout Thinking',
        'Understand how HTML structure supports page layout before CSS is added.',
        [
          'HTML alone does not create polished layout, but it creates the structure CSS depends on. Better HTML makes layout work easier.',
          'Sections, wrappers, cards, navigation groups, content regions, and repeated patterns should be reflected in the markup.',
          'When learners think in structure first, styling becomes cleaner and the page is easier to maintain.',
        ],
        ['Structure pages for later styling', 'Think in sections and content regions', 'Prepare markup for maintainable CSS'],
        'Outline a homepage in HTML first before adding any CSS classes for styling.',
        'Move on when your markup clearly describes the page architecture.',
        'Why does strong HTML help later CSS work?',
        ['It provides clearer structure', 'It replaces CSS completely', 'It disables layout issues automatically'],
        0
      ),
      lesson(
        'html-16',
        'Advanced',
        'Accessibility Fundamentals',
        'Use HTML in a way that supports more users and more devices.',
        [
          'Accessibility starts with correct HTML. Proper labels, headings, alt text, buttons, links, and semantic sections already solve many common problems.',
          'Learners should know that bad HTML harms keyboard users, screen-reader users, and users with different browsing conditions.',
          'A strong HTML developer thinks about clarity, navigation, meaning, and interaction from the start rather than treating accessibility as an afterthought.',
        ],
        ['Connect HTML to accessibility', 'Avoid common markup mistakes', 'Use semantics to support real users'],
        'Review one page and list three accessibility improvements based only on HTML changes.',
        'Move on when you can identify weak markup choices and improve them.',
        'Which practice improves accessibility directly in HTML?',
        ['Using proper labels and semantics', 'Removing headings', 'Avoiding alt text'],
        0
      ),
      lesson(
        'html-17',
        'Practice',
        'Build a Complete HTML Page',
        'Combine all major HTML concepts into one realistic page build.',
        [
          'This lesson is where the learner puts the HTML fundamentals together. The page should include semantic sections, text structure, navigation, media, lists, and a form or table where relevant.',
          'The goal is not to memorize isolated tags. The goal is to assemble a complete, meaningful page with confidence.',
          'A finished page is also strong evidence that the learner can move their HTML skill level upward.',
        ],
        ['Combine structure, semantics, text, links, and forms', 'Build a full page with intention', 'Create a proof-of-work artifact'],
        'Build a full HTML page for a course site, profile page, product page, or documentation page using semantic markup.',
        'Move on when you can build a complete page from a blank file without needing to copy a tutorial line by line.',
        'What is the goal of the complete page lesson?',
        ['Combine major HTML concepts in one build', 'Skip structure and only style', 'Avoid real page creation'],
        0
      ),
      lesson(
        'html-18',
        'Update',
        'Update Your HTML Skill Level',
        'Decide when your HTML progress is strong enough to increase your self-rating.',
        [
          'PathForge should help users update skills based on evidence, not just feeling. For HTML, evidence includes complete pages, clean semantic markup, accessible forms, and correct structure.',
          'If the learner can explain why elements were chosen and can rebuild the page structure independently, that is real progress.',
          'This step helps the user review what they built and decide whether they are still beginner, developing, or ready to move higher.',
        ],
        ['Use proof instead of guesswork', 'Review quality of markup', 'Increase level only after real progress'],
        'Review your HTML page and check structure, headings, semantics, links, alt text, and form labeling before updating your level.',
        'Update your HTML level only when you can explain your markup and build similar structure again without heavy help.',
        'When should the learner increase their HTML level?',
        ['After real proof of progress', 'Before studying any lesson', 'Without building anything'],
        0
      ),
    ],
  }
}

function buildSupplementaryLessons(skill: Skill, titles: string[], startIndex: number, group: string): LessonItem[] {
  const track = buildLearningPath(skill).track

  return titles.map((title, index) => ({
    id: `html-${startIndex + index}`,
    group,
    title,
    shortLabel: title,
    summary: `${title} extends the learner's understanding of HTML in a more complete A to Z study path.`,
    paragraphs: [
      `${title} is included so the learner does not miss a practical part of HTML. This chapter should explain the topic clearly, show where it appears in real pages, and connect it to the rest of the markup workflow.`,
      `While studying ${title}, the learner should focus on how the topic affects page structure, readability, accessibility, and maintainability inside ${track}.`,
      `By the end of the chapter, the learner should be able to explain the concept, use it correctly in markup, and avoid one or two common mistakes.`,
    ],
    takeaways: [
      `Understand the purpose of ${title}`,
      `Use ${title} in real HTML work`,
      `Connect ${title} to broader page structure`,
    ],
    exercise: `Create a short example that demonstrates ${title} and explain where it would be useful in a real web page.`,
    checkpoint: `Move on when you can explain ${title} clearly and use it in one practical example without copying blindly.`,
    quizQuestion: `What is the goal of the "${title}" chapter?`,
    quizOptions: [
      `Understand and apply ${title} in HTML`,
      'Skip the topic and continue',
      'Replace HTML with unrelated tools',
    ],
    correctAnswer: 0,
  }))
}

function buildCategoryDetailedCourse(skill: Skill): DetailedCourse {
  const category = normalizeCategory(skill.category)
  const track = skill.track?.trim() || categoryTracks[category][0]

  const trackCourseTemplates: Record<string, { overview: string; beginner: string[]; intermediate: string[]; advanced: string[] }> = {
    'Core CS Subjects': {
      overview: `This ${skill.name} course is built for college study, semester exams, concept revision, and practice from foundational theory to problem-solving and viva-style preparation.`,
      beginner: [
        `${skill.name} Syllabus Overview`,
        `${skill.name} Core Definitions`,
        `${skill.name} Fundamental Concepts`,
        `${skill.name} Short Notes and Theory Basics`,
        `${skill.name} First Worked Example`,
        `${skill.name} Common Exam Questions`,
      ],
      intermediate: [
        `${skill.name} Problem Solving Methods`,
        `${skill.name} Algorithms and Workflows`,
        `${skill.name} Important Numerical Questions`,
        `${skill.name} Unit-wise Revision`,
        `${skill.name} Previous Year Question Practice`,
      ],
      advanced: [
        `${skill.name} Long-form Answers`,
        `${skill.name} Comparison and Tradeoff Questions`,
        `${skill.name} Viva and Oral Review`,
        `${skill.name} Exam Strategy and Time Management`,
        `${skill.name} Final Mock Test Review`,
      ],
    },
    'Artificial Intelligence': {
      overview: `This ${skill.name} course is built for college students studying AI topics for exams and practice, covering theory, search, reasoning, models, and applied problem solving.`,
      beginner: [
        `${skill.name} Introduction and Scope`,
        `${skill.name} Intelligent Agents`,
        `${skill.name} Problem Formulation`,
        `${skill.name} Search Fundamentals`,
        `${skill.name} Knowledge Representation Basics`,
      ],
      intermediate: [
        `${skill.name} Informed and Uninformed Search`,
        `${skill.name} Reasoning Methods`,
        `${skill.name} Constraint Problems`,
        `${skill.name} Machine Learning Connections`,
        `${skill.name} Important AI Exam Problems`,
      ],
      advanced: [
        `${skill.name} Planning and Decision Making`,
        `${skill.name} AI Tradeoffs and Limitations`,
        `${skill.name} Applied AI Case Review`,
        `${skill.name} Viva and Theory Revision`,
        `${skill.name} Final Mock Test Review`,
      ],
    },
  }

  const categoryCourseTemplates: Record<string, { overview: string; beginner: string[]; intermediate: string[]; advanced: string[] }> = {
    technical: {
      overview: `This ${skill.name} course covers ${track} from foundations to applied workflow, debugging, quality review, and portfolio-level execution.`,
      beginner: [
        `${skill.name} Foundations`,
        `${skill.name} Setup and Core Workflow`,
        `${skill.name} Basic Concepts`,
        `${skill.name} First Guided Task`,
        `${skill.name} Common Errors`,
        `${skill.name} Essential Tools`,
      ],
      intermediate: [
        `${skill.name} Applied Workflow`,
        `${skill.name} Problem Solving`,
        `${skill.name} Reusable Patterns`,
        `${skill.name} Debugging Practice`,
        `${skill.name} Guided Project Task`,
      ],
      advanced: [
        `${skill.name} Quality and Performance`,
        `${skill.name} Collaboration Workflow`,
        `${skill.name} Production Patterns`,
        `${skill.name} Review and Refactoring`,
        `${skill.name} Portfolio Case Study`,
      ],
    },
    'data-ai': {
      overview: `This ${skill.name} course covers ${track} from foundations to analysis, evaluation, interpretation, and real decision-support workflow.`,
      beginner: [
        `${skill.name} Foundations`,
        `${skill.name} Data and Logic Basics`,
        `${skill.name} Core Methods`,
        `${skill.name} First Guided Analysis`,
        `${skill.name} Common Mistakes`,
      ],
      intermediate: [
        `${skill.name} Method Selection`,
        `${skill.name} Evaluation Workflow`,
        `${skill.name} Insight Development`,
        `${skill.name} Guided Case Practice`,
        `${skill.name} Reporting and Explanation`,
      ],
      advanced: [
        `${skill.name} Decision Support`,
        `${skill.name} Validation and Tradeoffs`,
        `${skill.name} Quality Review`,
        `${skill.name} Real-world Application`,
        `${skill.name} Case Study Portfolio`,
      ],
    },
    professional: {
      overview: `This ${skill.name} course covers ${track} from foundational behavior to stronger communication, teamwork, feedback, and professional judgment.`,
      beginner: [
        `${skill.name} Foundations`,
        `${skill.name} Basic Behavior Patterns`,
        `${skill.name} First Guided Scenario`,
        `${skill.name} Reflection Basics`,
        `${skill.name} Common Mistakes`,
      ],
      intermediate: [
        `${skill.name} Real Workplace Situations`,
        `${skill.name} Feedback and Adjustment`,
        `${skill.name} Communication Workflow`,
        `${skill.name} Guided Collaboration Task`,
        `${skill.name} Progress Reflection`,
      ],
      advanced: [
        `${skill.name} High-stakes Scenarios`,
        `${skill.name} Influence and Leadership`,
        `${skill.name} Professional Review`,
        `${skill.name} Improvement Workflow`,
        `${skill.name} Case Study Practice`,
      ],
    },
    business: {
      overview: `This ${skill.name} course covers ${track} from fundamentals to structured decisions, metrics, workflow design, and outcome-focused execution.`,
      beginner: [
        `${skill.name} Foundations`,
        `${skill.name} Goal and Context Basics`,
        `${skill.name} Audience and Process`,
        `${skill.name} First Guided Plan`,
        `${skill.name} Common Mistakes`,
      ],
      intermediate: [
        `${skill.name} Workflow Design`,
        `${skill.name} Metrics and Review`,
        `${skill.name} Decision Tradeoffs`,
        `${skill.name} Guided Business Task`,
        `${skill.name} Outcome Analysis`,
      ],
      advanced: [
        `${skill.name} Optimization Strategy`,
        `${skill.name} Business Judgment`,
        `${skill.name} Performance Review`,
        `${skill.name} Improvement Loop`,
        `${skill.name} Business Case Study`,
      ],
    },
    creative: {
      overview: `This ${skill.name} course covers ${track} from creative basics to production workflow, critique, refinement, and portfolio-quality output.`,
      beginner: [
        `${skill.name} Foundations`,
        `${skill.name} Visual and Concept Basics`,
        `${skill.name} First Guided Creative Task`,
        `${skill.name} Inspiration and Planning`,
        `${skill.name} Common Mistakes`,
      ],
      intermediate: [
        `${skill.name} Creative Workflow`,
        `${skill.name} Feedback and Revision`,
        `${skill.name} Style and Consistency`,
        `${skill.name} Guided Output Task`,
        `${skill.name} Review and Polish`,
      ],
      advanced: [
        `${skill.name} Portfolio Quality`,
        `${skill.name} Creative Tradeoffs`,
        `${skill.name} Professional Review`,
        `${skill.name} Refinement Workflow`,
        `${skill.name} Creative Case Study`,
      ],
    },
    language: {
      overview: `This ${skill.name} course covers ${track} from foundations to practical communication, correction, fluency, and real usage confidence.`,
      beginner: [
        `${skill.name} Foundations`,
        `${skill.name} Basic Vocabulary and Structure`,
        `${skill.name} First Guided Practice`,
        `${skill.name} Reading and Listening Basics`,
        `${skill.name} Common Mistakes`,
      ],
      intermediate: [
        `${skill.name} Conversation Workflow`,
        `${skill.name} Writing and Correction`,
        `${skill.name} Real-life Practice`,
        `${skill.name} Guided Communication Task`,
        `${skill.name} Review and Improvement`,
      ],
      advanced: [
        `${skill.name} Fluency and Precision`,
        `${skill.name} Professional Communication`,
        `${skill.name} Feedback Review`,
        `${skill.name} Confidence Building`,
        `${skill.name} Language Case Study`,
      ],
    },
    vocational: {
      overview: `This ${skill.name} course covers ${track} from foundational safety and process to repeatable hands-on performance and quality review.`,
      beginner: [
        `${skill.name} Foundations`,
        `${skill.name} Safety and Tools`,
        `${skill.name} Core Process Basics`,
        `${skill.name} First Guided Task`,
        `${skill.name} Common Mistakes`,
      ],
      intermediate: [
        `${skill.name} Hands-on Workflow`,
        `${skill.name} Standards and Accuracy`,
        `${skill.name} Problem Checking`,
        `${skill.name} Guided Practical Task`,
        `${skill.name} Review and Correction`,
      ],
      advanced: [
        `${skill.name} Reliable Execution`,
        `${skill.name} Quality and Consistency`,
        `${skill.name} Professional Standards`,
        `${skill.name} Improvement Workflow`,
        `${skill.name} Practical Case Study`,
      ],
    },
  }

  const template = trackCourseTemplates[track] ?? categoryCourseTemplates[category] ?? categoryCourseTemplates.technical
  return buildStructuredCourse(skill, template.overview, {
    beginner: template.beginner,
    intermediate: template.intermediate,
    advanced: template.advanced,
  })
}

function buildDetailedCourse(skill: Skill): DetailedCourse | null {
  const skillKey = normalizeSkillName(skill.name)

  if (skillKey === 'html' || skillKey === 'html5') {
    const baseCourse = buildHtmlCourse(skill)
    const extraBeginner = [
      'HTML Introduction',
      'HTML Basic',
      'HTML Styles',
      'HTML Formatting',
      'HTML Quotations',
      'HTML Comments',
      'HTML Colors',
      'HTML CSS',
      'HTML Favicon',
      'HTML Page Title',
    ]
    const extraIntermediate = [
      'HTML Block and Inline',
      'HTML Div',
      'HTML Classes',
      'HTML Id',
      'HTML Buttons',
      'HTML Iframes',
      'HTML JavaScript',
      'HTML File Paths',
      'HTML Responsive',
      'HTML Computer Code',
      'HTML Entities',
      'HTML Symbols',
      'HTML Emojis',
      'HTML Charsets',
      'HTML URL Encode',
      'HTML vs XHTML',
      'HTML Form Attributes',
      'HTML Form Elements',
      'HTML Input Types',
      'HTML Input Attributes',
      'Input Form Attributes',
    ]
    const extraAdvanced = [
      'HTML Canvas',
      'HTML SVG',
      'HTML Video',
      'HTML Audio',
      'HTML Plug-ins',
      'HTML YouTube',
      'HTML Web APIs',
      'HTML Geolocation',
      'HTML Drag and Drop',
      'HTML Web Storage',
      'HTML Web Workers',
      'HTML SSE',
      'HTML Accessibility',
      'HTML Style Guide',
      'HTML Browser Support',
      'HTML Global Attributes',
      'HTML Events',
      'HTML Doctypes',
      'HTML Character Sets',
      'HTML Lang Codes',
      'HTTP Messages',
      'HTTP Methods',
    ]

    return {
      overview: baseCourse.overview,
      lessons: [
        ...baseCourse.lessons,
        ...buildSupplementaryLessons(skill, extraBeginner, 19, 'Beginner'),
        ...buildSupplementaryLessons(skill, extraIntermediate, 29, 'Intermediate'),
        ...buildSupplementaryLessons(skill, extraAdvanced, 50, 'Advanced'),
      ],
    }
  }

  if (skillKey === 'css') {
    return buildStructuredCourse(
      skill,
      'This CSS course is built as a broad A to Z path from syntax and selectors through layout, responsive design, advanced effects, Flexbox, Grid, SASS, examples, and references so the learner does not miss core CSS topics.',
      {
        beginner: [
          'CSS Home',
          'CSS Introduction',
          'CSS Syntax',
          'CSS Selectors',
          'CSS How To',
          'CSS Comments',
          'CSS Errors',
          'CSS Colors',
          'CSS Backgrounds',
          'CSS Borders',
          'CSS Margins',
          'CSS Padding',
          'CSS Height / Width',
          'CSS Box Model',
          'CSS Outline',
          'CSS Text',
          'CSS Fonts',
          'CSS Icons',
          'CSS Links',
          'CSS Lists',
          'CSS Tables',
          'CSS Display',
          'CSS Max-width',
        ],
        intermediate: [
          'CSS Position',
          'CSS Position Offsets',
          'CSS Z-index',
          'CSS Overflow',
          'CSS Float',
          'CSS Inline-block',
          'CSS Align',
          'CSS Combinators',
          'CSS Pseudo-classes',
          'CSS Pseudo-elements',
          'CSS Opacity',
          'CSS Navigation Bars',
          'CSS Dropdowns',
          'CSS Image Gallery',
          'CSS Image Sprites',
          'CSS Attribute Selectors',
          'CSS Forms',
          'CSS Counters',
          'CSS Units',
          'CSS Inheritance',
          'CSS Specificity',
          'CSS !important',
          'CSS Math Functions',
          'CSS Optimization',
          'CSS Accessibility',
          'CSS Website Layout',
        ],
        advanced: [
          'CSS Rounded Corners',
          'CSS Border Images',
          'CSS Gradients',
          'CSS Shadows',
          'CSS Text Effects',
          'CSS Custom Fonts',
          'CSS 2D Transforms',
          'CSS 3D Transforms',
          'CSS Transitions',
          'CSS Animations',
          'CSS Tooltips',
          'CSS Image Styling',
          'CSS Image Modal',
          'CSS Image Centering',
          'CSS Image Filters',
          'CSS Image Shapes',
          'CSS object-fit',
          'CSS object-position',
          'CSS Masking',
          'CSS Buttons',
          'CSS Pagination',
          'CSS Multiple Columns',
          'CSS User Interface',
          'CSS Variables',
          'CSS @property',
          'CSS Box Sizing',
          'CSS Media Queries Advanced',
          'Flexbox Intro',
          'Flex Container',
          'Flex Items',
          'Flex Responsive',
          'Grid Intro',
          'Grid Container',
          'Grid Items',
          'Grid 12-column Layout',
          'CSS @supports',
          'RWD Intro',
          'RWD Viewport',
          'RWD Grid View',
          'RWD Media Queries',
          'RWD Images',
          'RWD Videos',
          'RWD Frameworks',
          'RWD Templates',
          'SASS Tutorial',
          'CSS Templates',
          'CSS Examples',
          'CSS Editor',
          'CSS Snippets',
          'CSS Quiz',
          'CSS Exercises',
          'CSS Code Challenges',
          'CSS Website',
          'CSS Syllabus',
          'CSS Study Plan',
          'CSS Interview Prep',
          'CSS Bootcamp',
          'CSS Certificate',
          'CSS Reference',
          'CSS Selectors Reference',
          'CSS Combinators Reference',
          'CSS Pseudo-classes Reference',
          'CSS Pseudo-elements Reference',
          'CSS Aural Reference',
          'CSS Web Safe Fonts',
          'CSS Animatable',
          'CSS Units Reference',
          'CSS PX-EM Converter',
          'CSS Colors Reference',
          'CSS Color Values',
          'CSS Default Values',
          'CSS Browser Support',
        ],
      }
    )
  }

  if (skillKey === 'javascript') {
    return buildStructuredCourse(
      skill,
      'This JavaScript course covers the language from foundations to DOM, asynchronous logic, application patterns, and practical interactive projects.',
      {
        beginner: [
          'JavaScript Introduction',
          'Variables and Data Types',
          'Operators and Conditions',
          'Loops',
          'Functions',
          'Arrays',
          'Objects',
          'Basic Problem Solving',
        ],
        intermediate: [
          'DOM Selection',
          'Events',
          'Form Handling',
          'Array Methods',
          'Object Patterns',
          'Modules',
          'Error Handling',
          'Fetch and APIs',
          'Promises and Async Await',
        ],
        advanced: [
          'State-driven UI Logic',
          'Code Organization',
          'Performance Basics',
          'Debugging Workflows',
          'Reusable Components without Frameworks',
          'Browser Storage',
          'Testing Logic Mentally and Practically',
          'Mini App Architecture',
        ],
      }
    )
  }

  if (skillKey === 'typescript') {
    return buildStructuredCourse(
      skill,
      'This TypeScript course covers typed JavaScript fundamentals, type design, interfaces, generics, tooling, and scalable application development.',
      {
        beginner: [
          'TypeScript Home',
          'What TypeScript Is',
          'TypeScript Setup',
          'tsconfig Introduction',
          'Basic Types',
          'Functions in TypeScript',
          'Arrays, Objects, and Tuples',
          'Union and Literal Types',
          'Type Inference Basics',
          'Type Assertions',
          'Readonly and Optional Properties',
          'Working with Enums and Constants',
          'Compiler Errors and Diagnostics',
        ],
        intermediate: [
          'Interfaces',
          'Type Aliases',
          'Enums',
          'Classes in TypeScript',
          'Generics Basics',
          'Narrowing and Type Guards',
          'Modules and Project Structure',
          'TypeScript with APIs',
          'Function Overloads',
          'Index Signatures',
          'Discriminated Unions',
          'Type-safe Forms and Events',
        ],
        advanced: [
          'Advanced Generics',
          'Utility Types',
          'Mapped and Conditional Types',
          'Type-safe State Design',
          'TypeScript with React',
          'tsconfig and Build Workflow',
          'Large-scale Code Organization',
          'Production TypeScript Review',
          'Declaration Files Basics',
          'Library Typing Strategy',
          'Refactoring with the Type System',
          'Monorepo and Shared Types',
        ],
      }
    )
  }

  if (skillKey === 'sql' || skillKey === 'mysql') {
    return buildStructuredCourse(
      skill,
      'This SQL course covers relational querying, joins, aggregation, schema work, transactions, and practical database problem solving.',
      {
        beginner: [
          `${skill.name} Home`,
          'Introduction to Relational Databases',
          'Tables, Rows, and Columns',
          'SELECT Queries',
          'Filtering and Sorting',
          'INSERT, UPDATE, and DELETE',
          'Primary Keys and Constraints',
          'Basic Table Design',
          'NULL Handling',
          'Operators and Expressions',
          'Basic Data Types',
        ],
        intermediate: [
          'Joins',
          'Aggregate Functions',
          'Group By and Having',
          'Subqueries',
          'Views',
          'Indexes Basics',
          'Transactions',
          'Reporting Queries',
          'Normalization Basics',
          'Stored Functions and Procedures',
          'Date and String Functions',
          'Window Functions Basics',
        ],
        advanced: [
          'Schema Design Tradeoffs',
          'Query Optimization',
          'Execution Plans Basics',
          'Concurrency and Locking',
          'Security and Permissions',
          'SQL in Applications',
          'Production Database Workflow',
          'Replication and Backup Concepts',
          'Partitioning Basics',
          'Migration Strategy',
          'Performance Tuning Review',
        ],
      }
    )
  }

  if (skillKey === 'java') {
    return buildStructuredCourse(
      skill,
      'This Java course covers core syntax, OOP, collections, exception handling, file I/O, multithreading, and application development workflow.',
      {
        beginner: [
          'Java Home',
          'Java Introduction',
          'JDK Setup and Compilation',
          'Variables and Data Types',
          'Operators and Conditions',
          'Loops',
          'Methods',
          'Arrays and Strings',
          'Scanner and Console Input',
          'Method Overloading',
          'Packages Basics',
          'Reading Compilation Errors',
        ],
        intermediate: [
          'Classes and Objects',
          'Constructors',
          'Inheritance',
          'Polymorphism',
          'Interfaces and Abstract Classes',
          'Exception Handling',
          'Collections Framework',
          'File Handling',
          'ArrayList and HashMap in Practice',
          'Object Equality and toString',
          'Enums and Wrapper Classes',
          'Project Structure and Packages',
        ],
        advanced: [
          'Generics in Java',
          'Streams API Basics',
          'Multithreading',
          'JDBC Basics',
          'Project Structure',
          'Testing Basics',
          'Application Design Patterns',
          'Production Java Review',
          'Lambda Expressions',
          'Concurrency Utilities',
          'Build Tools Basics',
          'Spring-ready Architecture Thinking',
        ],
      }
    )
  }

  if (skillKey === 'c') {
    return buildStructuredCourse(
      skill,
      'This C course covers procedural programming, memory basics, pointers, file handling, problem solving, and system-level coding foundations.',
      {
        beginner: [
          'C Home',
          'C Introduction',
          'Compiler Setup',
          'Variables and Data Types',
          'Operators and Conditions',
          'Loops',
          'Functions',
          'Arrays and Strings',
          'Input Output Basics',
          'Header Files Basics',
          'Scope and Storage Classes',
        ],
        intermediate: [
          'Pointers Basics',
          'Pointer Arithmetic',
          'Structures and Unions',
          'Dynamic Memory Allocation',
          'Problem Solving Patterns',
          'File Handling',
          'Error Handling',
          'Standard Library Workflow',
          'Function Pointers Basics',
        ],
        advanced: [
          'Memory and Performance Awareness',
          'Data Structures in Practice',
          'Modular Code Organization',
          'Debugging Workflows',
          'Testing and Refactoring',
          'System-level Programming Concepts',
          'Project Architecture',
          'Production Coding Review',
        ],
      }
    )
  }

  if (skillKey === 'c++') {
    return buildStructuredCourse(
      skill,
      'This C++ course covers syntax, OOP, STL, memory management, problem solving, modern language features, and application design.',
      {
        beginner: [
          'C++ Home',
          'C++ Introduction',
          'Compiler Setup',
          'Variables and Data Types',
          'Conditions and Loops',
          'Functions',
          'Arrays and Strings',
          'Input Output Streams',
          'Classes and Objects Basics',
          'Namespaces Basics',
        ],
        intermediate: [
          'Constructors and Destructors',
          'Inheritance and Polymorphism',
          'References and Pointers',
          'Operator Overloading',
          'Templates Basics',
          'STL Containers',
          'Algorithms in STL',
          'Exception Handling',
          'File Handling',
        ],
        advanced: [
          'Smart Pointers',
          'Move Semantics Basics',
          'Modern C++ Features',
          'Performance and Memory Awareness',
          'Design Patterns in C++',
          'Debugging and Profiling',
          'Project Architecture',
          'Production C++ Review',
        ],
      }
    )
  }

  if (skillKey === 'c#') {
    return buildStructuredCourse(
      skill,
      'This C# course covers object-oriented programming, collections, LINQ, async workflow, application structure, and modern .NET development basics.',
      {
        beginner: [
          'C# Home',
          'C# Introduction',
          '.NET Setup',
          'Variables and Types',
          'Conditions and Loops',
          'Methods',
          'Arrays and Collections Basics',
          'Classes and Objects',
          'Properties and Access Modifiers',
        ],
        intermediate: [
          'Inheritance and Interfaces',
          'Exception Handling',
          'Collections and Generics',
          'LINQ Basics',
          'Files and Serialization',
          'Async and Await Basics',
          'Dependency Injection Concepts',
          'Project Structure in .NET',
        ],
        advanced: [
          'Delegates and Events',
          'Task-based Concurrency',
          'Testing in C#',
          'Application Architecture',
          'Performance and Memory Awareness',
          'Entity Framework Concepts',
          'Deployment Workflow',
          'Production C# Review',
        ],
      }
    )
  }

  if (skillKey === 'bootstrap') {
    return buildStructuredCourse(
      skill,
      'This Bootstrap course covers responsive layout, utilities, components, forms, theming, and practical frontend page-building workflow.',
      {
        beginner: [
          'Bootstrap Home',
          'Bootstrap Introduction',
          'Including Bootstrap',
          'Containers and Grid Basics',
          'Spacing and Utility Classes',
          'Typography Basics',
          'Buttons and Cards',
          'Navbar Basics',
          'First Landing Page Layout',
        ],
        intermediate: [
          'Responsive Grid Workflow',
          'Forms in Bootstrap',
          'Modals, Alerts, and Toasts',
          'Tabs, Accordions, and Offcanvas',
          'Tables and Utility Helpers',
          'Component Composition',
          'Customization Basics',
          'Debugging Bootstrap Layouts',
        ],
        advanced: [
          'Theming and Variables',
          'Bootstrap with Real Framework Apps',
          'Accessibility Review',
          'Performance and CSS Overrides',
          'Design System Patterns',
          'Production Bootstrap Review',
        ],
      }
    )
  }

  if (skillKey === 'sass') {
    return buildStructuredCourse(
      skill,
      'This SASS course covers variables, nesting, mixins, partials, modular styling, and maintainable CSS architecture for real projects.',
      {
        beginner: [
          'SASS Home',
          'SASS Introduction',
          'Installing and Compiling SASS',
          'Variables',
          'Nesting',
          'Partials and Imports',
          'Basic Mixins',
          'First SASS Project',
        ],
        intermediate: [
          'Functions in SASS',
          'Loops and Conditionals',
          'Extends and Placeholders',
          'Maps and Lists',
          'Responsive Mixins',
          'Modular File Organization',
          'SASS with Component-based Apps',
          'Debugging Compiled CSS',
        ],
        advanced: [
          'Scalable SASS Architecture',
          'Design Token Strategy',
          'Theming with SASS',
          'Performance and Maintainability',
          'Migrating Large CSS Codebases',
          'Production SASS Review',
        ],
      }
    )
  }

  if (skillKey === 'w3.css') {
    return buildStructuredCourse(
      skill,
      'This W3.CSS course covers lightweight utility-based styling, layouts, navigation, cards, forms, and quick responsive page-building patterns.',
      {
        beginner: [
          'W3.CSS Home',
          'W3.CSS Introduction',
          'Adding W3.CSS to a Project',
          'Basic Utility Classes',
          'Containers and Layout Basics',
          'Typography and Colors',
          'Buttons and Cards',
          'First Responsive Page',
        ],
        intermediate: [
          'Navigation Bars',
          'Grid and Column Layouts',
          'Forms and Inputs',
          'Tables and Lists',
          'Modals and UI Components',
          'Responsive Helpers',
          'Composing Full Pages',
          'Debugging Utility-driven Layouts',
        ],
        advanced: [
          'Customization Strategy',
          'Integrating with Existing Apps',
          'Accessibility Review',
          'Maintainable Utility Patterns',
          'Performance and Simplicity Tradeoffs',
          'Production W3.CSS Review',
        ],
      }
    )
  }

  if (skillKey === 'intro to html & css') {
    return buildStructuredCourse(
      skill,
      'This Intro to HTML & CSS course is a beginner-friendly path through page structure, core styling, layout basics, and first web-page projects.',
      {
        beginner: [
          'Intro to HTML & CSS Home',
          'How Web Pages Work',
          'HTML Page Structure',
          'Headings, Paragraphs, and Links',
          'Images and Lists',
          'CSS Selectors Basics',
          'Colors, Fonts, and Spacing',
          'First Static Web Page',
        ],
        intermediate: [
          'Divs, Classes, and IDs',
          'Box Model Basics',
          'Display and Position Basics',
          'Flexbox Introduction',
          'Responsive Design Basics',
          'Simple Forms',
          'Multi-section Page Build',
          'Common Beginner Mistakes',
        ],
        advanced: [
          'Semantic HTML Basics',
          'Reusable Page Sections',
          'Accessibility Basics',
          'Polishing and Visual Consistency',
          'Mini Website Project',
          'Final HTML & CSS Review',
        ],
      }
    )
  }

  if (skillKey === 'xml') {
    return buildStructuredCourse(
      skill,
      'This XML course covers document structure, elements, attributes, namespaces, schemas, validation, and data-exchange workflow.',
      {
        beginner: [
          'XML Home',
          'What XML Is',
          'XML Syntax Basics',
          'Elements and Attributes',
          'Well-formed Documents',
          'Comments and Text Nodes',
          'Building Your First XML File',
        ],
        intermediate: [
          'Namespaces in XML',
          'DTD Basics',
          'XML Schema Basics',
          'Validation Workflow',
          'Parsing XML',
          'Transforming XML Data',
          'XML in Real Projects',
        ],
        advanced: [
          'Complex Schema Design',
          'XPath Basics',
          'XSLT Concepts',
          'Performance and Data Interchange',
          'Debugging XML Documents',
          'Production XML Review',
        ],
      }
    )
  }

  if (skillKey === 'angular' || skillKey === 'angularjs' || skillKey === 'vue') {
    return buildStructuredCourse(
      skill,
      `This ${skill.name} course covers component-driven UI development, routing, state, forms, data fetching, and scalable frontend project structure.`,
      {
        beginner: [
          `${skill.name} Home`,
          `${skill.name} Introduction`,
          'Project Setup',
          'Templates and Components',
          'Props or Inputs Basics',
          'Rendering and Directives',
          'Styling Components',
          'Template Syntax Basics',
          'Lifecycle Basics',
          'DevTools and Debugging Setup',
        ],
        intermediate: [
          'State and Reactivity',
          'Events and Forms',
          'Routing Basics',
          'Fetching API Data',
          'Computed or Derived UI',
          'Reusable Components',
          'Project Structure',
          'Form Validation',
          'Dependency Injection or Composition Patterns',
          'State Sharing Between Components',
        ],
        advanced: [
          'State Management Patterns',
          'Performance and Optimization',
          'Testing Components',
          'Design System Thinking',
          'Application Architecture',
          'Deployment Workflow',
          'Production Frontend Review',
          'SSR or Build Optimization Concepts',
          'Large-scale Component Libraries',
          'Refactoring and Maintainability',
        ],
      }
    )
  }

  if (skillKey === 'git') {
    return buildStructuredCourse(
      skill,
      'This Git course covers version control fundamentals, branching, merging, collaboration, history management, debugging changes, and professional development workflow.',
      {
        beginner: [
          'Git Home',
          'What Git Is',
          'Installing Git',
          'Configuring Your Identity',
          'Repositories and Working Tree',
          'git init and git clone',
          'Status, Add, and Commit',
          'Commit Messages',
          'Viewing History',
          'Basic Restore and Undo',
          'Ignoring Files with .gitignore',
          'Your First Local Workflow',
        ],
        intermediate: [
          'Branches and Checkout',
          'Merging Branches',
          'Resolving Merge Conflicts',
          'Remote Repositories',
          'Push and Pull Workflow',
          'Fetch vs Pull',
          'Rebase Basics',
          'Cherry-pick Basics',
          'Stash Workflow',
          'Tags and Releases',
          'Collaborative Team Workflow',
          'Git with GitHub Projects',
        ],
        advanced: [
          'Reset, Revert, and Recovery',
          'Interactive Rebase Concepts',
          'Reflog and History Recovery',
          'Bisect Basics',
          'Hooks Basics',
          'Monorepo and Branch Strategy',
          'Code Review Workflow',
          'Release Branching Models',
          'Debugging Project History',
          'Production-safe Git Habits',
          'Open Source Git Workflow',
          'Professional Git Review',
        ],
      }
    )
  }

  if (skillKey === 'php') {
    return buildStructuredCourse(
      skill,
      'This PHP course covers syntax, forms, sessions, files, databases, authentication, and dynamic server-side web application workflow.',
      {
        beginner: [
          'PHP Home',
          'PHP Introduction',
          'Setting Up PHP',
          'PHP Syntax and Variables',
          'Conditions and Loops',
          'Functions in PHP',
          'Working with Forms',
          'Strings and Arrays',
          'Superglobals Basics',
        ],
        intermediate: [
          'Sessions and Cookies',
          'Server-side Validation',
          'Working with Files',
          'MySQL Integration in PHP',
          'CRUD Application Basics',
          'Authentication Basics',
          'Template and View Patterns',
          'Error Handling',
          'Reusable PHP Modules',
        ],
        advanced: [
          'Application Structure',
          'Security Basics',
          'Performance and Caching',
          'Object-oriented PHP',
          'Routing and MVC Concepts',
          'Testing and Maintenance',
          'Deployment Workflow',
          'Production PHP Review',
        ],
      }
    )
  }

  if (skillKey === 'django') {
    return buildStructuredCourse(
      skill,
      'This Django course covers project setup, apps, models, views, templates, forms, authentication, admin, APIs, and full-stack backend workflow.',
      {
        beginner: [
          'Django Home',
          'What Django Is',
          'Environment Setup',
          'Creating a Django Project',
          'Apps in Django',
          'URLs, Views, and Templates',
          'Static Files Basics',
          'Forms Basics',
          'Admin Panel Basics',
        ],
        intermediate: [
          'Models and ORM Basics',
          'Migrations Workflow',
          'Template Inheritance',
          'Class-based Views',
          'Authentication Basics',
          'CRUD App Development',
          'Working with Forms and Validation',
          'Project Structure',
          'Django REST Concepts',
        ],
        advanced: [
          'Permissions and Security',
          'Performance and Query Optimization',
          'Background Tasks Concepts',
          'Testing Django Apps',
          'Deployment Workflow',
          'Scaling Django Projects',
          'API Architecture',
          'Production Django Review',
        ],
      }
    )
  }

  if (skillKey === 'mongodb') {
    return buildStructuredCourse(
      skill,
      'This MongoDB course covers document databases, collections, CRUD, schema design, aggregation, indexing, and backend integration workflow.',
      {
        beginner: [
          'MongoDB Home',
          'What MongoDB Is',
          'Installation and Setup',
          'Documents and Collections',
          'Mongo Shell Basics',
          'CRUD Operations',
          'Data Types in MongoDB',
          'Filtering and Sorting',
          'Basic Update Operators',
        ],
        intermediate: [
          'Schema Design Basics',
          'Embedding vs Referencing',
          'Indexes in MongoDB',
          'Aggregation Pipeline Basics',
          'Working with Mongoose',
          'Validation Rules',
          'Relationships in MongoDB',
          'Project Integration',
          'Backup and Export Basics',
        ],
        advanced: [
          'Performance Tuning',
          'Replication Basics',
          'Sharding Concepts',
          'Security and Access Control',
          'Transactions in MongoDB',
          'Monitoring and Debugging',
          'Production Data Modeling',
          'Production MongoDB Review',
        ],
      }
    )
  }

  if (skillKey === 'asp') {
    return buildStructuredCourse(
      skill,
      'This ASP course covers server-side application basics, request handling, state management, database integration, and structured web app workflow.',
      {
        beginner: [
          'ASP Home',
          'ASP Introduction',
          'Environment Setup',
          'Syntax and Server Pages',
          'Variables and Conditions',
          'Forms and Requests',
          'Basic Output Rendering',
        ],
        intermediate: [
          'Sessions and State',
          'Validation and Input Handling',
          'Working with Databases',
          'CRUD Application Workflow',
          'Project Structure',
          'Error Handling and Debugging',
          'Reusable Server Logic',
        ],
        advanced: [
          'Authentication and Security',
          'Performance and Maintainability',
          'Architecture Patterns',
          'Deployment Workflow',
          'Monitoring and Logs',
          'Production ASP Review',
        ],
      }
    )
  }

  if (skillKey === 'jquery') {
    return buildStructuredCourse(
      skill,
      'This jQuery course covers selectors, DOM manipulation, events, AJAX, effects, plugins, and practical frontend enhancement workflow.',
      {
        beginner: [
          'jQuery Home',
          'What jQuery Is',
          'Including jQuery',
          'Selectors Basics',
          'DOM Ready',
          'Events in jQuery',
          'Changing HTML and CSS',
          'Traversing the DOM',
        ],
        intermediate: [
          'Effects and Animations',
          'Form Handling',
          'AJAX Basics',
          'Working with JSON',
          'Event Delegation',
          'Reusable jQuery Utilities',
          'UI Interaction Patterns',
        ],
        advanced: [
          'Plugin Basics',
          'Performance and Maintainability',
          'Legacy Codebase Workflow',
          'Debugging jQuery Apps',
          'Migration Strategy',
          'Production jQuery Review',
        ],
      }
    )
  }

  if (skillKey === 'excel' || skillKey === 'r') {
    return buildStructuredCourse(
      skill,
      `This ${skill.name} course covers data handling, formulas or scripting, analysis workflow, visualization, and practical reporting tasks.`,
      {
        beginner: [
          `${skill.name} Home`,
          `${skill.name} Basics`,
          'Data Entry and Cleanup',
          'Core Functions or Syntax',
          'Tables and Simple Analysis',
          'First Practice Task',
          'Formatting and Presentation Basics',
          'Sorting and Filtering Basics',
          'Reading Real-world Data',
        ],
        intermediate: [
          'Filtering and Sorting',
          'Data Transformation',
          'Charts and Visualization',
          'Working with External Data',
          'Analysis Workflow',
          'Reporting Patterns',
          'Lookup and Reference Logic',
          'Pivot Tables or Grouped Analysis',
          'Error Checking and Data Validation',
        ],
        advanced: [
          'Automation and Reuse',
          'Statistical Thinking',
          'Dashboards or Scripts',
          'Performance and Accuracy',
          'Case Study Analysis',
          'Professional Review',
          'Scenario Analysis',
          'Reusable Templates',
          'End-to-end Reporting Project',
        ],
      }
    )
  }

  if (skillKey === 'numpy' || skillKey === 'pandas' || skillKey === 'scipy' || skillKey === 'data science') {
    return buildStructuredCourse(
      skill,
      `This ${skill.name} course covers data processing, analysis workflow, practical computation, visualization context, and project-based data problem solving.`,
      {
        beginner: [
          `${skill.name} Home`,
          `${skill.name} Introduction`,
          'Setup and Environment',
          'Core Data Structures',
          'First Analysis Workflow',
          'Common Beginner Mistakes',
          'Reading CSV and External Data',
          'Basic Exploration and Summaries',
          'Working in Notebooks',
        ],
        intermediate: [
          'Cleaning and Transforming Data',
          'Working with Real Datasets',
          'Aggregation and Analysis',
          'Visualization Workflow',
          'Statistics in Practice',
          'Project-style Exercises',
          'Feature Preparation Basics',
          'Exploratory Data Analysis',
          'Communicating Findings',
        ],
        advanced: [
          'Reusable Analysis Pipelines',
          'Performance and Scaling',
          'Experiment Design',
          'Reporting and Storytelling',
          'End-to-end Data Project',
          'Production Review',
          'Modeling Workflow Context',
          'Data Quality and Validation',
          'Portfolio-ready Case Study',
        ],
      }
    )
  }

  if (skillKey === 'aws') {
    return buildStructuredCourse(
      skill,
      'This AWS course covers cloud fundamentals, IAM, compute, storage, databases, networking, monitoring, and practical deployment workflow.',
      {
        beginner: [
          'AWS Home',
          'What AWS Is',
          'AWS Account and Console Basics',
          'Regions and Availability Zones',
          'IAM Basics',
          'EC2 Introduction',
          'S3 Basics',
          'First Cloud Deployment',
          'Security Basics in AWS',
        ],
        intermediate: [
          'VPC and Networking Basics',
          'RDS Basics',
          'Lambda Introduction',
          'CloudWatch Basics',
          'IAM Roles and Policies',
          'Route 53 Basics',
          'Load Balancers Basics',
          'Deploying a Web Application',
          'Cost Awareness and Billing Basics',
        ],
        advanced: [
          'Scalable Architecture Patterns',
          'High Availability Concepts',
          'Infrastructure as Code Concepts',
          'CI/CD on AWS',
          'Monitoring and Incident Response',
          'Security Best Practices',
          'Serverless Architecture Basics',
          'Production AWS Review',
        ],
      }
    )
  }

  if (skillKey === 'cybersecurity') {
    return buildStructuredCourse(
      skill,
      'This Cybersecurity course covers threat awareness, network and web security basics, identity, defensive workflow, incident response, and security best practices.',
      {
        beginner: [
          'Cybersecurity Home',
          'Introduction to Cybersecurity',
          'Threats, Risks, and Vulnerabilities',
          'Password and Identity Basics',
          'Network Security Basics',
          'Web Security Basics',
          'Social Engineering Awareness',
          'Safe System Practices',
          'First Security Checklist',
        ],
        intermediate: [
          'Authentication and Authorization',
          'OWASP Basics',
          'Encryption Fundamentals',
          'Endpoint and System Hardening',
          'Security Monitoring Basics',
          'Incident Response Workflow',
          'Logging and Evidence Basics',
          'Vulnerability Management',
          'Security Testing Concepts',
        ],
        advanced: [
          'Defensive Architecture',
          'Cloud Security Basics',
          'Risk Assessment Workflow',
          'Policy and Compliance Concepts',
          'Threat Modeling',
          'Security Operations Workflow',
          'Case Study Investigation',
          'Professional Cybersecurity Review',
        ],
      }
    )
  }

  if (skillKey === 'bash') {
    return buildStructuredCourse(
      skill,
      `This ${skill.name} course covers shell basics, command-line workflow, scripting, automation, troubleshooting, and practical system tasks.`,
      {
        beginner: [
          `${skill.name} Home`,
          `${skill.name} Introduction`,
          'Terminal Basics',
          'Files and Directories',
          'Navigation and File Commands',
          'Pipes and Redirection',
          'First Guided Practice',
          'Safety and Common Mistakes',
        ],
        intermediate: [
          'Shell Variables',
          'Conditionals and Loops',
          'Shell Scripts',
          'Working with Real Systems',
          'Automation and Repetition',
          'Troubleshooting Basics',
          'Text Processing Basics',
          'Project Practice',
        ],
        advanced: [
          'Reusable Automation Scripts',
          'System Maintenance Workflow',
          'Debugging Shell Scripts',
          'Production Workflow',
          'Case Study Review',
          'Professional Readiness',
        ],
      }
    )
  }

  if (skillKey === 'kotlin' || skillKey === 'swift') {
    return buildStructuredCourse(
      skill,
      `This ${skill.name} course covers language basics, object-oriented programming, app-development foundations, and production-ready coding workflow.`,
      {
        beginner: [
          `${skill.name} Home`,
          `${skill.name} Basics`,
          'Variables and Types',
          'Conditions and Loops',
          'Functions',
          'Classes and Objects',
          'Collections Basics',
          'Optionals or Null Safety Basics',
          'First App Project Setup',
          'Language Tooling Basics',
        ],
        intermediate: [
          'Protocols or Interfaces',
          'UI and App Structure Basics',
          'Working with APIs',
          'State and Data Flow',
          'Testing Basics',
          'Project Workflow',
          'Navigation and Screens',
          'Architecture Patterns Basics',
          'Persistence and Local Data',
        ],
        advanced: [
          'Architecture Patterns',
          'Concurrency Basics',
          'Performance Awareness',
          'Debugging and Refactoring',
          'Deployment Workflow',
          'Production App Review',
          'App Lifecycle and Background Work',
          'Modular Code Organization',
          'Scaling Mobile Codebases',
        ],
      }
    )
  }

  if (skillKey === 'node.js' || skillKey === 'nodejs') {
    return buildStructuredCourse(
      skill,
      'This Node.js course covers backend runtime fundamentals, modules, APIs, async flow, database integration, authentication, debugging, and production backend workflow.',
      {
        beginner: [
          'Node.js Home',
          'What Node.js Is',
          'Node Installation and Setup',
          'Node Version Manager Basics',
          'Node.js REPL',
          'Your First Node Program',
          'Runtime and Event Loop Basics',
          'Blocking vs Non-blocking I/O',
          'Modules and npm',
          'package.json Basics',
          'npm Scripts',
          'npx Workflow',
          'Core Modules',
          'File System Basics',
          'Path Module',
          'OS Module',
          'Process Module',
          'Process and CLI Arguments',
          'HTTP Module Basics',
          'Streams and Buffers',
          'Readable and Writable Streams',
          'Working with JSON Files',
          'Asynchronous JavaScript in Node.js',
          'Callbacks, Promises, and Async Await in Node',
          'Events and EventEmitter',
          'Debugging Node Applications',
          'Node Inspector and Logging',
        ],
        intermediate: [
          'Express Fundamentals',
          'Setting Up an Express App',
          'Routing and Middleware',
          'Request and Response Objects',
          'Static Files and Templating Basics',
          'REST API Design',
          'Route Parameters and Query Strings',
          'Controllers and Service Layers',
          'Request Validation',
          'Error Handling',
          'Mongoose Basics',
          'Working with MongoDB',
          'Working with Databases',
          'SQL and PostgreSQL in Node',
          'CRUD APIs End to End',
          'Authentication Basics',
          'JWT and Sessions',
          'Environment Variables',
          'Cookies and CORS',
          'File Uploads',
          'API Documentation Basics',
          'Unit and Integration Testing',
          'Testing API Endpoints',
        ],
        advanced: [
          'Project Structure for Backend Apps',
          'Architecture Patterns for Node Backends',
          'Layered Backend Design',
          'Logging and Monitoring',
          'Performance and Scalability',
          'Caching and Rate Limiting',
          'Security in Node.js',
          'Input Sanitization and Secure Headers',
          'Queues and Background Jobs',
          'WebSockets and Real-time Features',
          'Microservices Basics',
          'Node with Docker',
          'Node with Redis',
          'Message Brokers and Worker Design',
          'Deployment Workflow',
          'Environment-specific Configuration',
          'CI/CD for Backend Apps',
          'Observability and Health Checks',
          'Real Backend Case Study',
          'Production Review and Refactoring',
        ],
      }
    )
  }

  if (skillKey === 'rust') {
    return buildStructuredCourse(
      skill,
      'This Rust course covers syntax, ownership, borrowing, error handling, collections, traits, concurrency, and practical systems and backend development workflow.',
      {
        beginner: [
          'Rust Home',
          'Rust Introduction',
          'Toolchain and Cargo',
          'Creating Your First Cargo Project',
          'Variables and Data Types',
          'Scalar and Compound Types',
          'Functions and Control Flow',
          'Ownership vs Borrowing Overview',
          'Ownership Basics',
          'Borrowing and References',
          'Slices and Strings',
          'Structs and Enums',
          'Pattern Matching',
          'if let and while let',
          'Packages, Crates, and Modules',
          'Collections in Rust',
          'Vectors, Strings, and HashMaps',
          'Common Compiler Errors',
          'Reading Compiler Messages',
        ],
        intermediate: [
          'Error Handling with Result and Option',
          'panic vs Result',
          'Traits and Generics',
          'Trait Bounds',
          'Lifetimes Basics',
          'Smart Borrowing Patterns',
          'Closures in Practice',
          'Testing in Rust',
          'Iterators and Closures',
          'File and Input Output',
          'Command Line Programs',
          'Pattern Matching Deep Dive',
          'Cargo Workspaces',
          'Project Organization in Rust',
          'Serde and Data Parsing',
          'Building Real CLI Utilities',
        ],
        advanced: [
          'Smart Pointers',
          'Interior Mutability',
          'Reference Counting',
          'Concurrency in Rust',
          'Threads and Message Passing',
          'Shared State Concurrency',
          'Async Rust Basics',
          'Tokio Basics',
          'Unsafe Rust Concepts',
          'FFI Basics',
          'Performance and Memory Safety',
          'Error Design in Larger Apps',
          'Macros Basics',
          'Building CLI or Backend Tools',
          'Web Services in Rust',
          'Testing and Benchmarking at Scale',
          'Project Architecture in Rust',
          'Production Case Study',
        ],
      }
    )
  }

  if (skillKey === 'go' || skillKey === 'golang') {
    return buildStructuredCourse(
      skill,
      'This Go course covers syntax, functions, structs, interfaces, goroutines, channels, APIs, testing, and scalable backend development workflow.',
      {
        beginner: [
          'Go Home',
          'Go Introduction',
          'Go Setup and Modules',
          'Go Toolchain Basics',
          'Variables and Data Types',
          'Constants and Zero Values',
          'Functions and Control Flow',
          'Arrays, Slices, and Maps',
          'Strings and Runes',
          'Structs and Methods',
          'Pointers in Go',
          'Packages and Imports',
          'Input Output Basics',
          'Error Values in Go',
          'Formatting and Logging Basics',
          'Your First CLI Program',
          'Reading Go Compiler Errors',
        ],
        intermediate: [
          'Interfaces in Go',
          'Composition Patterns',
          'File Handling',
          'JSON and HTTP Basics',
          'Building REST APIs',
          'Routing and Handlers',
          'Middleware in Go',
          'Testing in Go',
          'Concurrency Basics',
          'Goroutines and Channels',
          'Select Statements',
          'Synchronization Primitives',
          'Working with Databases',
          'Configuration Management',
          'Project Layout in Go',
          'Error Handling in Services',
        ],
        advanced: [
          'Context and Cancellation',
          'Service Layer Architecture',
          'Project Structure',
          'Performance Profiling',
          'Database Integration',
          'Caching and Background Tasks',
          'Deployment and Tooling',
          'gRPC Basics',
          'Observability and Monitoring',
          'Microservice Thinking',
          'Concurrency Patterns at Scale',
          'Testing and Benchmarking APIs',
          'Production Configuration and Secrets',
          'Production Go Case Study',
          'Production Review and Refactoring',
        ],
      }
    )
  }

  if (skillKey === 'react') {
    return buildStructuredCourse(
      skill,
      'This React course takes the learner from JSX and components to state, forms, composition, data flow, and production-ready UI thinking.',
      {
        beginner: [
          'React Home',
          'React Introduction',
          'Why React Is Used',
          'Setting Up a React Project',
          'JSX Basics',
          'Components',
          'Props',
          'Rendering UI',
          'Lists and Keys',
          'Conditional Rendering',
          'Styling React Components',
          'Component Folder Structure',
          'React Developer Tools Basics',
        ],
        intermediate: [
          'State Basics',
          'Events',
          'Forms',
          'Component Composition',
          'Lifting State',
          'Derived UI',
          'Effects and Side Effects',
          'Fetching Data',
          'Custom Hooks Basics',
          'Context API Basics',
          'Routing Basics',
          'Managing Async UI States',
          'Form Validation Patterns',
        ],
        advanced: [
          'State Design',
          'Reusable Patterns',
          'Performance Awareness',
          'App Structure',
          'Accessibility in React',
          'Complex UI Flows',
          'Debugging React Features',
          'Real Product Components',
          'Server State Patterns',
          'Code Splitting and Lazy Loading',
          'Testing React Components',
          'Design Systems and Reusable UI',
          'Production React Review',
        ],
      }
    )
  }

  if (skillKey === 'docker') {
    return buildStructuredCourse(
      skill,
      'This Docker course covers container fundamentals, images, Dockerfiles, networking, volumes, Compose, debugging, and deployment-ready container workflows.',
      {
        beginner: [
          'Docker Home',
          'Introduction to Docker',
          'Containers vs Virtual Machines',
          'Installing Docker',
          'Docker Desktop and CLI',
          'Images and Containers',
          'Basic Docker Commands',
          'Pull, Run, Stop, and Remove',
          'Docker Hub Basics',
          'Running Your First Container',
          'Interactive Containers',
          'Container Lifecycle Commands',
          'Inspecting Images and Containers',
          'Port Mapping Basics',
          'Environment Variables in Containers',
          'Docker Logs',
          'Running Apps Locally in Docker',
        ],
        intermediate: [
          'Writing Dockerfiles',
          'Dockerfile Instructions',
          'Building Custom Images',
          'Docker Build Context',
          'Image Layers and Caching',
          'Volumes and Persistent Data',
          'Bind Mounts vs Named Volumes',
          'Docker Networking Basics',
          'Bridge Networks and Service Discovery',
          'Environment Variables and Configuration',
          'Docker Compose',
          'Multi-container Applications',
          'Debugging Containers',
          'Container Logs and Exec',
          'Health Checks',
          'Docker Compose for Full-stack Apps',
          'Containerizing a Web App',
        ],
        advanced: [
          'Multi-stage Builds',
          'Image Optimization',
          'Security Best Practices',
          'Secrets Handling',
          'Private Registries',
          'Image Tagging Strategy',
          'Logging and Monitoring',
          'Registry Workflow',
          'Deployment Patterns',
          'CI/CD with Docker',
          'Docker in Kubernetes Workflow',
          'Docker in Cloud Environments',
          'Production Compose and Scaling',
          'Backup and Recovery Concepts',
          'Production Container Review',
        ],
      }
    )
  }

  if (skillKey === 'kubernetes' || skillKey === 'k8s') {
    return buildStructuredCourse(
      skill,
      'This Kubernetes course covers cluster fundamentals, pods, deployments, services, configuration, scaling, debugging, and production orchestration workflows.',
      {
        beginner: [
          'Kubernetes Home',
          'Introduction to Kubernetes',
          'Why Kubernetes Exists',
          'Cluster Architecture',
          'Control Plane vs Worker Nodes',
          'Pods Basics',
          'Pod Lifecycle',
          'Deployments Basics',
          'ReplicaSets',
          'Services Basics',
          'kubectl Workflow',
          'YAML Fundamentals',
          'Labels and Selectors',
          'Namespaces Basics',
          'Annotations Basics',
          'Rolling Updates Basics',
          'Your First Deployment',
        ],
        intermediate: [
          'ConfigMaps and Secrets',
          'Managing Configuration in Clusters',
          'Ingress Basics',
          'Persistent Volumes',
          'Persistent Volume Claims',
          'StatefulSets',
          'Init Containers',
          'Sidecar Patterns',
          'Scaling and Rolling Updates',
          'Jobs and CronJobs',
          'DaemonSets',
          'Resource Requests and Limits',
          'Health Probes',
          'Debugging Workloads',
          'Cluster Networking Basics',
          'Service Discovery and DNS',
        ],
        advanced: [
          'Helm Basics',
          'RBAC and Security',
          'Service Accounts and Permissions',
          'Observability and Monitoring',
          'Network Policies',
          'Autoscaling',
          'Service Mesh Concepts',
          'GitOps Workflow',
          'Deployment Strategies',
          'Multi-environment Cluster Management',
          'Production Deployment Strategy',
          'Cluster Operations Workflow',
          'Disaster Recovery Basics',
          'Backup and Restore Workflows',
          'Real Kubernetes Case Study',
        ],
      }
    )
  }

  if (skillKey === 'postgresql' || skillKey === 'postgres') {
    return buildStructuredCourse(
      skill,
      'This PostgreSQL course covers relational database foundations, SQL querying, indexing, transactions, optimization, schema design, and production database workflow.',
      {
        beginner: [
          'PostgreSQL Home',
          'PostgreSQL Introduction',
          'Installing PostgreSQL',
          'Database and Table Basics',
          'Data Types in PostgreSQL',
          'CRUD Queries',
          'Filtering and Sorting',
          'Joins Basics',
          'Constraints and Keys',
          'Basic Aggregations',
          'Group By and Having',
          'psql Workflow',
          'Import and Export Basics',
          'Default Values and Sequences',
        ],
        intermediate: [
          'Schema Design',
          'Normalization in Practice',
          'Indexes Basics',
          'Unique and Composite Indexes',
          'Transactions and ACID',
          'Isolation Levels Basics',
          'Views and Stored Procedures Basics',
          'Subqueries and CTEs',
          'Window Functions',
          'Working with JSON',
          'User and Role Management',
          'Backups and Restore Basics',
          'Connecting PostgreSQL to Applications',
          'Database Migration Basics',
          'Querying for Reports',
        ],
        advanced: [
          'Query Optimization',
          'Execution Plans',
          'Advanced Indexing',
          'Partitioning Basics',
          'Replication Basics',
          'Security and Permissions',
          'Locking and Concurrency',
          'Migration Workflows',
          'Monitoring PostgreSQL',
          'High Availability Concepts',
          'Connection Pooling',
          'Performance Tuning Workflow',
          'PostgreSQL in Applications',
          'Production Database Review',
        ],
      }
    )
  }

  if (skillKey === 'redis') {
    return buildStructuredCourse(
      skill,
      'This Redis course covers in-memory data basics, key patterns, caching, pub-sub, queues, persistence, scaling, and practical backend integration.',
      {
        beginner: [
          'Redis Home',
          'Redis Introduction',
          'Installing Redis',
          'Keys and Strings',
          'Lists, Sets, and Hashes',
          'Sorted Sets Basics',
          'Expiration and TTL',
          'Basic Redis Commands',
          'Using Redis CLI',
          'Serialization Patterns',
          'Common Redis Use Cases',
          'Counters and Simple Analytics',
          'Session Storage Basics',
        ],
        intermediate: [
          'Caching Patterns',
          'Cache Invalidation Basics',
          'Pub/Sub Basics',
          'Queues and Streams',
          'Transactions in Redis',
          'Lua Scripting Basics',
          'Persistence Basics',
          'Redis with Backend Apps',
          'Session Storage Workflow',
          'Rate Limiting Patterns',
          'Background Job Patterns',
          'Leaderboard Patterns',
          'Distributed Locks Basics',
          'Using Redis with Node or Python',
        ],
        advanced: [
          'Performance and Memory Management',
          'Replication and High Availability',
          'Redis Sentinel Basics',
          'Redis Cluster Basics',
          'Security Best Practices',
          'Monitoring and Debugging',
          'Distributed Cache Design',
          'Scaling Read and Write Workloads',
          'Persistence Tradeoffs',
          'Failover and Recovery Patterns',
          'Eviction Policies',
          'Production Redis Case Study',
        ],
      }
    )
  }

  if (skillKey === 'system design') {
    return buildStructuredCourse(
      skill,
      'This System Design course covers requirements, scale, components, databases, caching, messaging, consistency, reliability, and interview-style architecture thinking.',
      {
        beginner: [
          'System Design Home',
          'Introduction to System Design',
          'Functional and Non-functional Requirements',
          'Scalability Basics',
          'Latency and Throughput',
          'Client Server Architecture',
          'Load Balancing Basics',
          'Database Choices Overview',
          'Storage Basics',
          'Caching Overview',
          'Networking Concepts for System Design',
          'Vertical vs Horizontal Scaling',
          'Availability Basics',
          'Designing for Growth',
        ],
        intermediate: [
          'Caching Strategies',
          'Message Queues Basics',
          'API Gateway and Service Communication',
          'Consistency and Availability',
          'Sharding and Partitioning',
          'CDN Basics',
          'Rate Limiting',
          'Designing Common Systems',
          'Monitoring and Logging Basics',
          'Security Fundamentals',
          'Search and Indexing Concepts',
          'File Storage Design',
          'Notification System Design',
        ],
        advanced: [
          'Reliability and Fault Tolerance',
          'Observability and Monitoring',
          'Security in Distributed Systems',
          'Tradeoff Analysis',
          'Microservices vs Monoliths',
          'Event-driven Architectures',
          'Disaster Recovery and Backups',
          'Interview Design Workflow',
          'Designing at Global Scale',
          'Consistency Tradeoff Deep Dive',
          'Data Pipeline Design',
          'Large Scale Architecture Case Study',
          'System Review and Improvement',
        ],
      }
    )
  }

  if (skillKey === 'python') {
    return buildStructuredCourse(
      skill,
      'This Python course covers syntax, core programming, scripting, data handling, automation, and practical project building from beginner to advanced use.',
      {
        beginner: [
          'Python Home',
          'Python Introduction',
          'Python Installation and Setup',
          'Variables and Data Types',
          'Conditions',
          'Loops',
          'Functions',
          'Lists and Tuples',
          'Dictionaries and Sets',
          'Strings in Python',
          'Input Output Basics',
          'Python Operators',
          'Reading Error Messages',
        ],
        intermediate: [
          'Files and Input Output',
          'Modules and Imports',
          'Error Handling',
          'String and Data Processing',
          'Problem Solving',
          'Object Basics',
          'Working with CSV and JSON',
          'Small Scripts',
          'Comprehensions',
          'Functions Deep Dive',
          'Virtual Environments',
          'Working with APIs',
          'Testing Basics in Python',
        ],
        advanced: [
          'Automation Tasks',
          'Project Structure',
          'Command Line Tools',
          'Debugging and Refactoring',
          'Testing Mindset',
          'Reusable Utilities',
          'Track-specific Projects',
          'Professional Python Habits',
          'Decorators and Generators',
          'Concurrency Basics',
          'Performance and Optimization',
          'Packaging Python Projects',
          'Production Python Review',
        ],
      }
    )
  }

  if (skillKey === 'prompt engineering') {
    return buildStructuredCourse(
      skill,
      'This Prompt Engineering course covers prompt structure, context design, evaluation, iterative improvement, task decomposition, safety, and real LLM workflow design.',
      {
        beginner: [
          'Prompt Engineering Home',
          'Introduction to Prompt Engineering',
          'How LLMs Respond to Prompts',
          'Prompt Structure Basics',
          'Clear Instructions and Constraints',
          'Few-shot Prompting Basics',
          'Role and Context Prompts',
          'Common Prompt Mistakes',
          'Prompting for Summaries',
          'Prompting for Explanations',
          'Prompting for Structured Output',
          'Prompting for Classification',
          'Prompting for Idea Generation',
        ],
        intermediate: [
          'Prompt Iteration Workflow',
          'Task Decomposition',
          'Chain of Thought Usage',
          'Evaluation of Outputs',
          'Prompt Templates',
          'Structured Output Prompts',
          'Prompting for Research and Coding',
          'Safety and Guardrails Basics',
          'Prompt Versioning',
          'Prompt A/B Comparison',
          'Prompt Debugging Workflow',
          'Prompting for Tool Use',
          'Writing Reusable Prompt Libraries',
        ],
        advanced: [
          'Prompt Systems Design',
          'RAG-aware Prompting',
          'Multi-step Agent Workflows',
          'Failure Analysis',
          'Prompt Optimization Tradeoffs',
          'Prompt Testing and Benchmarks',
          'Tool Use and Function Calling Prompts',
          'Human Review Loops',
          'Real AI Product Use Cases',
          'Production Prompt Review',
          'Prompt Governance and Quality Control',
          'Latency and Cost Tradeoffs',
          'Enterprise Prompt Patterns',
        ],
      }
    )
  }

  if (skillKey === 'langchain') {
    return buildStructuredCourse(
      skill,
      'This LangChain course covers chains, prompts, memory, retrieval, tools, agents, evaluation, and building production-style LLM applications.',
      {
        beginner: [
          'LangChain Home',
          'Introduction to LangChain',
          'LangChain Setup',
          'Prompt Templates',
          'Simple Chains',
          'Models and Output Parsing',
          'Basic Retrieval Concepts',
          'Common LangChain Workflow',
          'Prompt Template Variables',
          'Running Simple Chat Pipelines',
          'Messages and Chat Models',
          'Basic Document Loading',
        ],
        intermediate: [
          'Sequential Chains',
          'Memory Basics',
          'Vector Stores and Retrieval',
          'RAG Workflow',
          'Embeddings Basics',
          'Tools and Tool Calling',
          'Agents Basics',
          'Document Loaders and Splitters',
          'Conversation Chains',
          'Debugging Chains',
          'Retriever Strategies',
          'Chunking and Context Windows',
          'Prompt and Chain Composition',
        ],
        advanced: [
          'Advanced Agent Patterns',
          'Evaluation and Tracing',
          'Production RAG Design',
          'Performance and Cost Tradeoffs',
          'Guardrails and Safety',
          'LangServe and Deployment Ideas',
          'Multi-tool Workflows',
          'State and Memory Strategy',
          'Real AI Application Case Study',
          'Production LangChain Review',
          'Caching and Response Reuse',
          'Observability for LLM Apps',
          'Architecture for Scalable LangChain Systems',
        ],
      }
    )
  }

  if (skillKey === 'english') {
    return buildStructuredCourse(
      skill,
      'This English course covers vocabulary, grammar, reading, listening, speaking, writing, interview communication, and professional fluency in a structured path.',
      {
        beginner: [
          'Basic Sentence Building',
          'Everyday Vocabulary',
          'Reading Basics',
          'Listening Basics',
          'Speaking Confidence',
          'Grammar Foundations',
        ],
        intermediate: [
          'Conversation Practice',
          'Writing Clear Messages',
          'Workplace English',
          'Interview English',
          'Pronunciation Practice',
          'Presentation Language',
        ],
        advanced: [
          'Professional Writing',
          'Fluent Explanations',
          'Advanced Vocabulary',
          'Structured Discussions',
          'Public Speaking in English',
          'Career Communication',
        ],
      }
    )
  }

  if (skillKey === 'digital marketing' || skillKey === 'marketing') {
    return buildStructuredCourse(
      skill,
      'This digital marketing course covers audience research, channels, content, SEO, email, ads, analytics, campaign planning, optimization, and reporting from start to finish.',
      {
        beginner: [
          'Marketing Fundamentals',
          'Audience Research',
          'Messaging and Positioning',
          'Content Basics',
          'Social Media Basics',
          'SEO Basics',
        ],
        intermediate: [
          'Email Marketing',
          'Landing Pages',
          'Conversion Basics',
          'Paid Ads Introduction',
          'Campaign Planning',
          'Analytics and KPIs',
          'Funnels and User Journey',
        ],
        advanced: [
          'Optimization Strategy',
          'Growth Experiments',
          'Reporting and Insights',
          'Attribution Thinking',
          'Retention and Lifecycle',
          'Channel Integration',
          'Campaign Review and Improvement',
        ],
      }
    )
  }

  if (skillKey === 'artificial intelligence' || skillKey === 'ai') {
    return buildStructuredCourse(
      skill,
      'This Artificial Intelligence course is built for college study and exam preparation, covering intelligent agents, search, knowledge representation, reasoning, learning, and applied AI problem solving.',
      {
        beginner: [
          'Introduction to Artificial Intelligence',
          'History and Scope of AI',
          'Intelligent Agents',
          'Environment and Rationality',
          'Problem Solving in AI',
          'State Space Representation',
          'Production Systems',
          'Characteristics of AI Problems',
          'Uninformed Search Basics',
          'Blind Search Strategies',
          'Problem Formulation',
          'Generate and Test',
          'Hill Climbing Basics',
          'Common AI Exam Definitions',
        ],
        intermediate: [
          'Breadth First Search',
          'Depth First Search',
          'Uniform Cost Search',
          'Informed Search and Heuristics',
          'Best First Search',
          'A* Search',
          'AO* Search',
          'Minimax Algorithm',
          'Alpha Beta Pruning',
          'Constraint Satisfaction Problems',
          'Knowledge Representation',
          'Semantic Networks',
          'Frames and Scripts',
          'Predicate Logic Basics',
          'Propositional Logic in AI',
          'Forward Chaining',
          'Backward Chaining',
          'Reasoning Systems',
          'Resolution Method',
          'Handling Uncertainty',
          'Bayesian Reasoning Basics',
          'Important AI Numerical Problems',
        ],
        advanced: [
          'Planning in AI',
          'Game Playing and Adversarial Search',
          'Means End Analysis',
          'Non-monotonic Reasoning',
          'Machine Learning Connections',
          'Expert Systems',
          'Natural Language Processing Basics',
          'Computer Vision Basics',
          'Neural Network Introduction',
          'Fuzzy Logic Basics',
          'Robotics Basics',
          'AI Ethics and Limitations',
          'Applications of AI',
          'Advantages and Disadvantages of AI',
          'AI Viva Questions',
          'AI Previous Year Paper Review',
          'AI Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'dsa' || skillKey === 'data structures and algorithms' || skillKey === 'data structures') {
    return buildStructuredCourse(
      skill,
      'This DSA course is designed for college exams, coding practice, and placement preparation from core data structures to algorithms and complexity analysis.',
      {
        beginner: [
          'Introduction to DSA',
          'Algorithm Analysis and Complexity',
          'Asymptotic Notations',
          'Arrays',
          'Strings',
          'Recursion Basics',
          'Pointers Basics',
          'Linked Lists',
          'Circular Linked Lists',
          'Doubly Linked Lists',
          'Stacks',
          'Queues',
          'Deque Basics',
          'Important DSA Theory Questions',
        ],
        intermediate: [
          'Trees and Binary Trees',
          'Binary Search Trees',
          'AVL Trees',
          'Heap Basics',
          'Priority Queues',
          'Hashing',
          'Searching Algorithms',
          'Sorting Algorithms',
          'Merge Sort',
          'Quick Sort',
          'Heap Sort',
          'Two Pointer Technique',
          'Sliding Window Technique',
          'Graphs Introduction',
          'Graph Traversal BFS and DFS',
          'Topological Sorting',
          'Shortest Path Basics',
          'Union Find Basics',
          'Practice Problem Solving',
        ],
        advanced: [
          'Greedy Algorithms',
          'Dynamic Programming Basics',
          'Memoization and Tabulation',
          'Backtracking',
          'Shortest Path Algorithms',
          'Minimum Spanning Tree',
          'Disjoint Set Union',
          'Trie and Advanced Structures',
          'Segment Tree Basics',
          'Fenwick Tree Basics',
          'Bit Manipulation',
          'String Matching Basics',
          'Graph Problem Patterns',
          'DSA Viva and Interview Questions',
          'Previous Year DSA Questions',
          'Mock Coding and Revision',
        ],
      }
    )
  }

  if (skillKey === 'daa' || skillKey === 'design and analysis of algorithms') {
    return buildStructuredCourse(
      skill,
      'This DAA course is structured for semester exams and concept mastery, covering asymptotic analysis, recurrence relations, and major algorithm design paradigms.',
      {
        beginner: [
          'Introduction to DAA',
          'Asymptotic Notations',
          'Best, Average, and Worst Case',
          'Recurrence Relations',
          'Substitution Method',
          'Recursion Tree Method',
          'Master Theorem',
          'Algorithm Correctness Basics',
          'Time Space Tradeoff',
          'Basic Algorithm Analysis Questions',
        ],
        intermediate: [
          'Divide and Conquer',
          'Merge Sort and Quick Sort Analysis',
          'Binary Search Analysis',
          'Greedy Method',
          'Activity Selection',
          'Knapsack Concepts',
          'Huffman Coding',
          'Job Sequencing',
          'Dynamic Programming',
          'Longest Common Subsequence',
          'Matrix Chain Multiplication',
          'Optimal Binary Search Trees',
          'Floyd Warshall Basics',
          'Backtracking',
          'Branch and Bound',
          'N Queen Problem',
          'Travelling Salesman Basics',
          'Important DAA Problem Solving',
        ],
        advanced: [
          'Graph Algorithms in DAA',
          'Shortest Paths',
          'Minimum Spanning Trees',
          'Max Flow Basics',
          'Complexity Classes P, NP, NP-Complete',
          'Cooks Theorem Overview',
          'Approximation Algorithms',
          'Proof and Correctness Ideas',
          'Randomized Algorithms Basics',
          'Amortized Analysis Basics',
          'Long Answer Exam Questions',
          'DAA Viva Questions',
          'Previous Year DAA Paper Practice',
          'Final Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'operating systems' || skillKey === 'os') {
    return buildStructuredCourse(
      skill,
      'This Operating Systems course is built for university exams and concept practice, covering processes, scheduling, synchronization, memory, storage, and system fundamentals.',
      {
        beginner: [
          'Introduction to Operating Systems',
          'Functions and Types of OS',
          'Process Concepts',
          'Threads Basics',
          'Process States and PCB',
          'CPU Scheduling Introduction',
          'Scheduling Criteria',
          'System Calls',
          'OS Structure and Services',
          'Multiprogramming and Multitasking',
          'Important OS Definitions',
        ],
        intermediate: [
          'FCFS Scheduling',
          'SJF and SRTF Scheduling',
          'Priority Scheduling',
          'Round Robin Scheduling',
          'Process Synchronization',
          'Critical Section Problem',
          'Semaphores and Monitors',
          'Deadlocks',
          'Deadlock Prevention and Avoidance',
          'Bankers Algorithm',
          'Memory Management Basics',
          'Paging and Segmentation',
          'Swapping',
          'Contiguous Memory Allocation',
          'OS Numerical Practice',
        ],
        advanced: [
          'Virtual Memory',
          'Page Replacement Algorithms',
          'Thrashing',
          'File Systems',
          'Disk Scheduling',
          'I/O Systems',
          'RAID Basics',
          'Protection and Security',
          'Distributed Operating Systems Basics',
          'Real Time Operating Systems',
          'Linux and Unix Concepts',
          'OS Case-based Theory Answers',
          'OS Viva Questions',
          'Previous Year OS Questions',
          'OS Diagram and Long Answer Revision',
          'Final Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'dbms' || skillKey === 'database management systems') {
    return buildStructuredCourse(
      skill,
      'This DBMS course is built for college exams and practical preparation, covering data models, SQL, normalization, transactions, indexing, and system architecture.',
      {
        beginner: [
          'Introduction to DBMS',
          'Database System Concepts',
          'Advantages of DBMS',
          'ER Model Basics',
          'Entities, Attributes, and Relationships',
          'Relational Model',
          'Keys and Constraints',
          'Schema and Instance',
          'Three Schema Architecture',
          'DBMS Architecture',
          'Important DBMS Definitions',
        ],
        intermediate: [
          'Relational Algebra',
          'Tuple Relational Calculus',
          'Domain Relational Calculus',
          'SQL Basics',
          'Joins and Nested Queries',
          'DDL DML TCL DCL',
          'Functional Dependencies',
          'Normalization 1NF, 2NF, 3NF',
          'BCNF',
          '4NF and 5NF Basics',
          'Transactions Basics',
          'ACID Properties',
          'Concurrency Control',
          'Serializability',
          'Locking Protocols',
          'Important DBMS Numericals and Queries',
        ],
        advanced: [
          'Indexing and Hashing',
          'Query Processing and Optimization',
          'Recovery Techniques',
          'Log Based Recovery',
          'Checkpointing',
          'Database Security',
          'Distributed Databases Basics',
          'NoSQL Basics',
          'Data Warehousing Basics',
          'DBMS Long Answer Questions',
          'DBMS Viva Questions',
          'Previous Year DBMS Questions',
          'SQL and Theory Revision',
          'Final Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'computer networks' || skillKey === 'cn') {
    return buildStructuredCourse(
      skill,
      'This Computer Networks course is designed for semester exams and practical understanding, covering network models, protocols, layers, addressing, routing, and security basics.',
      {
        beginner: [
          'Introduction to Computer Networks',
          'Types of Networks',
          'OSI Model',
          'TCP/IP Model',
          'Physical Layer Basics',
          'Data Link Layer Basics',
          'Framing and Error Detection',
          'Error Control and Flow Control',
          'Transmission Media',
          'Network Devices Basics',
          'Important CN Definitions',
        ],
        intermediate: [
          'MAC and Flow Control',
          'Switching Techniques',
          'Network Layer Basics',
          'IP Addressing and Subnetting',
          'IPv4 and IPv6',
          'Routing Algorithms',
          'Distance Vector Routing',
          'Link State Routing',
          'Transport Layer Basics',
          'TCP and UDP',
          'Application Layer Basics',
          'HTTP, DNS, and Email Protocols',
          'Congestion Control Basics',
          'Important CN Numericals',
        ],
        advanced: [
          'Congestion Control',
          'Wireless and Mobile Networks',
          'Network Security Basics',
          'Cryptography Overview',
          'Firewalls and Secure Communication',
          'Socket Programming Basics',
          'Network Management Basics',
          'Multimedia Networks',
          'CN Long Answer Questions',
          'CN Viva Questions',
          'Previous Year CN Questions',
          'Diagram and Protocol Revision',
          'Final Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'oop' || skillKey === 'oops' || skillKey === 'object oriented programming') {
    return buildStructuredCourse(
      skill,
      'This OOP course is built for college study and practical programming, covering classes, objects, inheritance, polymorphism, abstraction, and design thinking.',
      {
        beginner: [
          'Introduction to OOP',
          'Procedural vs Object Oriented Programming',
          'Classes and Objects',
          'Attributes and Methods',
          'Constructors',
          'Encapsulation',
          'Access Specifiers',
          'this and super Concepts',
          'Important OOP Definitions',
        ],
        intermediate: [
          'Inheritance',
          'Method Overloading',
          'Method Overriding',
          'Polymorphism',
          'Abstraction',
          'Interfaces and Abstract Classes',
          'Association, Aggregation, and Composition',
          'Exception Handling Basics',
          'Packages and Namespaces',
          'Static Members',
          'Object Passing and Returning',
          'Important OOP Coding Practice',
        ],
        advanced: [
          'Design Principles in OOP',
          'Access Modifiers and Scope',
          'Object Lifecycle and Memory Ideas',
          'Collections and Reusability',
          'Generics Basics',
          'File Handling in OOP Workflow',
          'UML and Class Diagrams',
          'OOP Viva Questions',
          'Previous Year OOP Questions',
          'Coding and Theory Revision',
          'Final Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'computer architecture' || skillKey === 'coa' || skillKey === 'computer organization and architecture') {
    return buildStructuredCourse(
      skill,
      'This Computer Architecture course is built for exam preparation and concept understanding, covering digital representation, CPU organization, memory hierarchy, and instruction execution.',
      {
        beginner: [
          'Introduction to Computer Architecture',
          'Data Representation',
          'Number Systems',
          'Boolean Algebra Basics',
          'Logic Gates and Combinational Circuits',
          'Registers and Bus Structure',
          'Sequential Circuits Basics',
          'Flip Flops and Registers',
          'Important COA Definitions',
        ],
        intermediate: [
          'Instruction Cycle',
          'CPU Organization',
          'Addressing Modes',
          'Arithmetic and Logic Unit',
          'Control Unit Basics',
          'Pipeline Basics',
          'Memory Hierarchy',
          'Cache Memory',
          'Main Memory Organization',
          'Associative Memory',
          'Microprogrammed Control',
          'Important COA Numericals',
        ],
        advanced: [
          'Input Output Organization',
          'Interrupts and DMA',
          'Parallel Processing Basics',
          'Performance and Speedup Concepts',
          'RISC vs CISC',
          'Multiprocessors Basics',
          'Instruction Set Design Basics',
          'COA Long Answer Questions',
          'COA Viva Questions',
          'Previous Year COA Questions',
          'Diagram and Theory Revision',
          'Final Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'discrete mathematics' || skillKey === 'dm') {
    return buildStructuredCourse(
      skill,
      'This Discrete Mathematics course is designed for college exams and concept mastery, covering logic, sets, relations, functions, combinatorics, graph theory, and proof techniques.',
      {
        beginner: [
          'Introduction to Discrete Mathematics',
          'Propositional Logic',
          'Truth Tables',
          'Predicate Logic Basics',
          'Sets and Set Operations',
          'Relations',
          'Functions',
          'Partial Order and Equivalence Relations',
          'Basic Proof Techniques',
          'Important Discrete Math Definitions',
        ],
        intermediate: [
          'Mathematical Induction',
          'Recurrence Relations',
          'Permutations and Combinations',
          'Pigeonhole Principle',
          'Graph Theory Basics',
          'Trees Basics',
          'Boolean Algebra',
          'Lattices Basics',
          'Posets Basics',
          'Counting Principles',
          'Important Discrete Math Problems',
        ],
        advanced: [
          'Advanced Counting Techniques',
          'Graph Algorithms Basics',
          'Proof Strategies',
          'Generating Functions Basics',
          'Planar Graphs Basics',
          'Discrete Probability Basics',
          'Discrete Math Long Answer Questions',
          'Viva Questions',
          'Previous Year Question Practice',
          'Formula and Concept Revision',
          'Final Mock Test and Revision',
        ],
      }
    )
  }

  if (skillKey === 'github') {
    return buildStructuredCourse(
      skill,
      'This GitHub course covers repository basics, commits, branches, pull requests, collaboration, issues, project boards, release workflows, and portfolio-ready open-source habits from beginner to advanced.',
      {
        beginner: [
          'GitHub Home',
          'What GitHub Is',
          'Create Your Account',
          'GitHub Profile Basics',
          'Repository Basics',
          'Public vs Private Repositories',
          'README Files',
          'Markdown Basics',
          'Commits and History',
          'Uploading a Project',
          'Cloning a Repository',
          'Branch Basics',
          'Basic Collaboration Workflow',
          'Managing Files on GitHub',
        ],
        intermediate: [
          'Pull Requests',
          'Code Review Basics',
          'Merging Branches',
          'Resolving Merge Conflicts',
          'Issues and Labels',
          'Milestones',
          'GitHub Projects',
          'Releases and Tags',
          'GitHub Discussions',
          'Managing Collaborators',
          'Repository Settings',
          'GitHub Pages',
          'Project Boards and Planning',
          'Templates for Repos and Docs',
          'Wiki and Documentation Workflow',
        ],
        advanced: [
          'Open Source Contribution Flow',
          'Forking and Upstream Sync',
          'Protected Branches',
          'Pull Request Templates',
          'Issue Templates',
          'GitHub Actions Basics',
          'Continuous Integration with GitHub Actions',
          'Secret Management',
          'Security Alerts and Dependabot',
          'Code Owners',
          'Release Workflow Design',
          'Portfolio Repositories',
          'Professional GitHub Profile',
          'Maintainer Workflow',
          'GitHub Organization Basics',
          'Advanced Automation Workflow',
          'Community and OSS Maintenance',
        ],
      }
    )
  }

  return buildCategoryDetailedCourse(skill)
}

function buildLessons(skill: Skill): LessonItem[] {
  const detailedCourse = buildDetailedCourse(skill)
  if (detailedCourse) {
    return detailedCourse.lessons
  }

  const path = buildLearningPath(skill)
  const studyKit = buildStudyKit(skill)
  const stage = getStage(skill.level)
  const lessonSeeds = [
    ...studyKit.beginner.map((title) => ({ group: 'Beginner', title })),
    ...studyKit.intermediate.map((title) => ({ group: 'Intermediate', title })),
    ...studyKit.advanced.map((title) => ({ group: 'Advanced', title })),
    { group: 'Practice', title: `${skill.name} practice lab` },
    { group: 'Update', title: `Update ${skill.name} skill level` },
  ]

  return lessonSeeds.map((seed, index) => {
    const lessonNumber = index + 1
    const conceptA = studyKit.concepts[index % studyKit.concepts.length]
    const conceptB = studyKit.concepts[(index + 1) % studyKit.concepts.length]
    const moduleRef = path.modules[index % path.modules.length]

    if (seed.group === 'Practice') {
      return {
        id: `lesson-${lessonNumber}`,
        group: seed.group,
        title: seed.title,
        shortLabel: `Practice ${skill.name}`,
        summary: `Use what you learned in ${skill.name} on a realistic task inside PathForge.`,
        paragraphs: [
          `This practice lab is where the learner turns ${skill.name} knowledge into output. Instead of only reading theory, the user should build, write, present, or solve something using ${skill.name}.`,
          `The task should connect directly to ${path.track}. That keeps the learning useful and makes it easier for the user to update their skill level with actual evidence.`,
          `When this lesson is complete, the learner should have one visible artifact: notes, code, copy, a design, a recording, or a project section.`,
        ],
        takeaways: [
          `Apply ${skill.name} in a real context`,
          `Use ${conceptA} and ${conceptB} together`,
          `Prepare one proof-of-work item`,
        ],
        exercise: `Complete one small but real ${skill.name} assignment connected to ${path.track}, then save the result in your notes or project list.`,
      checkpoint: `You are ready to move forward when you can show one completed ${skill.name} task without step-by-step copying.`,
      quizQuestion: `What proves progress in ${skill.name} best at this stage?`,
      quizOptions: [
        'Only reading about the topic once',
        'A practical output connected to the skill',
        'Skipping directly to the next chapter',
      ],
      correctAnswer: 1,
      }
    }

    if (seed.group === 'Update') {
      return {
        id: `lesson-${lessonNumber}`,
        group: seed.group,
        title: seed.title,
        shortLabel: `Update ${skill.name}`,
        summary: `Know when progress in ${skill.name} is strong enough to raise your level.`,
        paragraphs: [
          `Skill levels should move only when the learner has proof. PathForge should encourage honest progress based on completed work, not guesswork.`,
          `For ${skill.name}, proof can be a finished task, a clean explanation of the concept, or a project result tied to ${path.track}.`,
          `This lesson helps the learner review evidence and decide whether they are still in ${stage} or ready for the next level.`,
        ],
        takeaways: studyKit.checkpoints,
        exercise: `Review your latest ${skill.name} work and decide if it proves enough progress to move your current level upward.`,
        checkpoint: `Update the skill only when you can explain the work, repeat the workflow, and show the output.`,
        quizQuestion: `When should you raise your ${skill.name} level?`,
        quizOptions: [
          'When you have real proof of progress',
          'As soon as you open the lesson',
          'Only after watching a video title',
        ],
        correctAnswer: 0,
      }
    }

    return {
      id: `lesson-${lessonNumber}`,
      group: seed.group,
      title: seed.title,
      shortLabel: seed.title,
      summary: `${seed.title} teaches one focused part of ${skill.name} for ${path.track}.`,
      paragraphs: [
        `${seed.title} is one chapter in the ${skill.name} study path. The goal of this lesson is to help the learner understand how ${skill.name} is actually used inside ${path.track}.`,
        `While studying this topic, the user should focus on ${conceptA} and ${conceptB}. These ideas connect directly to ${moduleRef} and move the learner closer to the target level.`,
        `At the end of the lesson, the learner should be able to explain the topic simply, use it on a small task, and recognize common mistakes before moving on.`,
      ],
      takeaways: [
        `Understand the purpose of ${seed.title}`,
        `Practice ${conceptA} in context`,
        `Connect the lesson to ${path.track}`,
      ],
      exercise: `Do one focused exercise for ${seed.title} and write down what you understood, what confused you, and what you need to practice again.`,
      checkpoint: `You are ready for the next lesson when you can explain ${seed.title} in simple words and use it in one practical example.`,
      quizQuestion: `What is the goal of "${seed.title}"?`,
      quizOptions: [
        `Understand and apply ${seed.title} in ${path.track}`,
        'Memorize words without using them',
        'Skip the concept and move ahead',
      ],
      correctAnswer: 0,
    }
  })
}

function buildAssessedLessonIds(lessons: LessonItem[], level: number) {
  if (lessons.length === 0 || level <= 0) return []
  const completedCount = Math.max(0, Math.min(lessons.length, Math.round((level / 100) * lessons.length)))
  return lessons.slice(0, completedCount).map((lesson) => lesson.id)
}

function SidebarSection({
  title,
  lessons,
  activeLessonId,
  unlockedLessonIndex,
  onSelect,
}: {
  title: string
  lessons: LessonItem[]
  activeLessonId: string
  unlockedLessonIndex: number
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {lessons.map((lesson) => {
          const isActive = lesson.id === activeLessonId
          const lessonIndex = Number(lesson.id.split('-').pop()) - 1
          const isLocked = Number.isFinite(lessonIndex) && lessonIndex > unlockedLessonIndex
          return (
            <button
              key={lesson.id}
              onClick={() => {
                if (!isLocked) onSelect(lesson.id)
              }}
              disabled={isLocked}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/80 hover:bg-muted/20',
                isLocked && 'hover:bg-transparent'
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{lesson.shortLabel}</span>
                {isLocked && <span className="text-[10px] uppercase tracking-[0.18em]">Locked</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function SkillDetailPage() {
  const params = useParams<{ skillId: string }>()
  const { skills, updateSkill } = useDashboardStore()
  const { user } = useAuthStore()
  const [activeLessonId, setActiveLessonId] = useState<string>('')
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizFeedback, setQuizFeedback] = useState<string>('')
  const [answerExplanation, setAnswerExplanation] = useState('')
  const [quizStartedAt, setQuizStartedAt] = useState<number>(Date.now())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [suspiciousAttempt, setSuspiciousAttempt] = useState('')
  const [lessonAttempts, setLessonAttempts] = useState<LessonAttemptMap>({})
  const [progressHydrated, setProgressHydrated] = useState(false)
  const [practiceContent, setPracticeContent] = useState('')
  const [practiceFeedback, setPracticeFeedback] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectLink, setProjectLink] = useState('')
  const [projectFeedback, setProjectFeedback] = useState('')
  const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(false)
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({})
  const [assessmentEvidence, setAssessmentEvidence] = useState('')
  const [assessmentFeedback, setAssessmentFeedback] = useState('')

  const skill = useMemo(
    () => skills.find((item) => item.id === params.skillId) ?? null,
    [skills, params.skillId]
  )

  const path = useMemo(() => (skill ? buildLearningPath(skill) : null), [skill])
  const studyKit = useMemo(() => (skill ? buildStudyKit(skill) : null), [skill])
  const lessons = useMemo(() => (skill ? buildLessons(skill) : []), [skill])
  const detailedCourse = useMemo(() => (skill ? buildDetailedCourse(skill) : null), [skill])
  const assessmentQuestions = useMemo(() => (skill ? buildAssessmentQuestions(skill) : []), [skill])

  useEffect(() => {
    if (!activeLessonId && lessons.length > 0) {
      setActiveLessonId(lessons[0].id)
    }
  }, [activeLessonId, lessons])

  const activeLessonIndex = lessons.findIndex((lesson) => lesson.id === activeLessonId)
  const activeLesson = activeLessonIndex >= 0 ? lessons[activeLessonIndex] : lessons[0]
  const unlockedLessonIndex = useMemo(() => {
    let unlocked = 0
    for (let i = 0; i < lessons.length - 1; i += 1) {
      if (completedLessonIds.includes(lessons[i].id)) {
        unlocked = i + 1
      } else {
        break
      }
    }
    return unlocked
  }, [completedLessonIds, lessons])

  const progressStorageKey = useMemo(() => {
    if (!skill || !user) return null
    return `pathforge-study-progress:${user.id}:${skill.id}`
  }, [skill, user])
  const assessmentStorageKey = useMemo(() => {
    if (!skill || !user) return null
    return getAssessmentStorageKey(user.id, skill.id)
  }, [skill, user])
  const quizAttemptStorageKey = useMemo(() => {
    if (!skill || !user) return null
    return getQuizAttemptStorageKey(user.id, skill.id)
  }, [skill, user])
  const practiceStorageKey = useMemo(() => {
    if (!skill || !user || !activeLesson) return null
    return `pathforge-practice:${user.id}:${skill.id}:${activeLesson.id}`
  }, [activeLesson, skill, user])
  const projectStorageKey = useMemo(() => {
    if (!skill || !user) return null
    return `pathforge-project:${user.id}:${skill.id}`
  }, [skill, user])

  const groupedLessons = useMemo(() => ({
    beginner: lessons.filter((lesson) => lesson.group === 'Beginner'),
    intermediate: lessons.filter((lesson) => lesson.group === 'Intermediate'),
    advanced: lessons.filter((lesson) => lesson.group === 'Advanced'),
    practice: lessons.filter((lesson) => lesson.group === 'Practice' || lesson.group === 'Update'),
  }), [lessons])

  useEffect(() => {
    setProgressHydrated(false)
    if (!progressStorageKey) return

    let persistedCompletedIds: string[] = []
    const rawProgress = localStorage.getItem(progressStorageKey)
    if (rawProgress) {
      try {
        const parsed = JSON.parse(rawProgress) as { completedLessonIds?: string[] }
        persistedCompletedIds = parsed.completedLessonIds ?? []
      } catch {
        persistedCompletedIds = []
      }
    }

    let persistedAssessmentLevel = 0
    let persistedAnswers: Record<string, number> = {}
    let persistedEvidence = ''
    if (assessmentStorageKey) {
      const rawAssessment = localStorage.getItem(assessmentStorageKey)
      if (rawAssessment) {
        try {
          const parsed = JSON.parse(rawAssessment) as {
            level?: number
            answers?: Record<string, number>
            evidence?: string
          }
          persistedAssessmentLevel = parsed.level ?? 0
          persistedAnswers = parsed.answers ?? {}
          persistedEvidence = parsed.evidence ?? ''
        } catch {
          persistedAssessmentLevel = 0
        }
      }
    }

    setAssessmentAnswers(persistedAnswers)
    setAssessmentEvidence(persistedEvidence)
    if (quizAttemptStorageKey) {
      const rawAttempts = localStorage.getItem(quizAttemptStorageKey)
      if (rawAttempts) {
        try {
          const parsed = JSON.parse(rawAttempts) as LessonAttemptMap
          setLessonAttempts(parsed)
        } catch {
          setLessonAttempts({})
        }
      } else {
        setLessonAttempts({})
      }
    } else {
      setLessonAttempts({})
    }

    const assessedLessonIds = buildAssessedLessonIds(lessons, persistedAssessmentLevel)
    const mergedCompletedIds = Array.from(new Set([...assessedLessonIds, ...persistedCompletedIds]))
    setCompletedLessonIds(mergedCompletedIds)
    setProgressHydrated(true)
  }, [assessmentStorageKey, lessons, progressStorageKey, quizAttemptStorageKey])

  useEffect(() => {
    if (!progressHydrated) return
    if (!progressStorageKey) return
    localStorage.setItem(progressStorageKey, JSON.stringify({ completedLessonIds }))
  }, [completedLessonIds, progressHydrated, progressStorageKey])

  useEffect(() => {
    if (!progressHydrated) return
    if (!quizAttemptStorageKey) return
    localStorage.setItem(quizAttemptStorageKey, JSON.stringify(lessonAttempts))
  }, [lessonAttempts, progressHydrated, quizAttemptStorageKey])

  useEffect(() => {
    if (lessons.length === 0) return
    const defaultLesson = lessons[Math.min(unlockedLessonIndex, lessons.length - 1)]
    if (!activeLessonId || !lessons.some((lesson) => lesson.id === activeLessonId)) {
      setActiveLessonId(defaultLesson.id)
    }
  }, [activeLessonId, lessons, unlockedLessonIndex])

  useEffect(() => {
    if (!progressHydrated) return
    setSelectedAnswer(null)
    setQuizFeedback('')
    setAnswerExplanation('')
    setSuspiciousAttempt('')
  }, [activeLessonId, progressHydrated])

  useEffect(() => {
    if (!progressHydrated) return
    if (!skill || !activeLesson) return
    if (!practiceStorageKey) return

    const raw = localStorage.getItem(practiceStorageKey)
    if (raw !== null) {
      setPracticeContent(raw)
      setPracticeFeedback('')
      return
    }

    setPracticeContent(getPracticeStarter(skill, activeLesson))
    setPracticeFeedback('')
  }, [activeLesson, practiceStorageKey, progressHydrated, skill])

  useEffect(() => {
    if (!progressHydrated) return
    if (!practiceStorageKey) return
    localStorage.setItem(practiceStorageKey, practiceContent)
  }, [practiceContent, practiceStorageKey, progressHydrated])

  useEffect(() => {
    if (!progressHydrated) return
    if (!projectStorageKey) return
    const raw = localStorage.getItem(projectStorageKey)
    if (!raw) {
      setProjectTitle('')
      setProjectDescription('')
      setProjectLink('')
      return
    }

    try {
      const parsed = JSON.parse(raw) as { title?: string; description?: string; link?: string }
      setProjectTitle(parsed.title ?? '')
      setProjectDescription(parsed.description ?? '')
      setProjectLink(parsed.link ?? '')
    } catch {
      setProjectTitle('')
      setProjectDescription('')
      setProjectLink('')
    }
  }, [projectStorageKey, progressHydrated])

  useEffect(() => {
    if (!progressHydrated) return
    if (!projectStorageKey) return
    localStorage.setItem(projectStorageKey, JSON.stringify({
      title: projectTitle,
      description: projectDescription,
      link: projectLink,
    }))
  }, [projectDescription, projectLink, projectStorageKey, projectTitle, progressHydrated])

  const completedLessonsCount = completedLessonIds.filter((id) => lessons.some((lesson) => lesson.id === id)).length
  const studyProgress = lessons.length > 0 ? Math.round((completedLessonsCount / lessons.length) * 100) : 0
  const derivedSkillLevel = lessons.length > 0
    ? Math.min(skill?.targetLevel ?? 100, Math.round(((completedLessonsCount / lessons.length) * (skill?.targetLevel ?? 100))))
    : skill?.level ?? 0
  const hasStartedLearning = completedLessonsCount > 0 || studyProgress > 0 || (skill?.level ?? 0) > 0
  const showFullAssessment = !hasStartedLearning || isAssessmentExpanded

  useEffect(() => {
    if (!progressHydrated) return
    if (!skill) return
    if (derivedSkillLevel === skill.level) return

    updateSkill(skill.id, {
      level: derivedSkillLevel,
      lastUpdated: new Date().toISOString(),
    })
  }, [derivedSkillLevel, progressHydrated, skill, updateSkill])

  if (!skill || !path || !studyKit) {
    return (
      <div className="p-6 lg:p-8">
        <GlassCard>
          <GlassCardContent className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-foreground">Skill not found</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This study page could not find the selected skill. Go back to the skills roadmap and choose a skill again.
            </p>
            <Link
              href="/dashboard/skills"
              className="mt-5 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/20"
            >
              Back to skills
            </Link>
          </GlassCardContent>
        </GlassCard>
      </div>
    )
  }

  const isCurrentLessonPassed = activeLesson ? completedLessonIds.includes(activeLesson.id) : false
  const practiceConfig = getPracticeConfig(skill, activeLesson)
  const practiceChecks = activeLesson ? getPracticeChecks(skill, activeLesson, practiceContent) : []
  const allPracticeChecksPassed = practiceChecks.length > 0 && practiceChecks.every((check) => check.passed)
  const canSubmitLessonTest = allPracticeChecksPassed
  const effectiveQuizProgress = Math.max(skill.level, studyProgress)
  const lessonAttemptState = activeLesson
    ? lessonAttempts[activeLesson.id] ?? { failedAttempts: 0, totalAttempts: 0, cooldownUntil: 0 }
    : { failedAttempts: 0, totalAttempts: 0, cooldownUntil: 0 }
  const quizPool = useMemo(
    () => buildQuizPool(activeLesson, skill, effectiveQuizProgress),
    [activeLesson, effectiveQuizProgress, skill]
  )
  const adaptiveQuiz = quizPool[lessonAttemptState.totalAttempts % quizPool.length] ?? quizPool[0] ?? buildAdaptiveQuiz(activeLesson, skill, effectiveQuizProgress)
  const shuffledQuiz = useMemo(
    () => shuffleQuizOptions(adaptiveQuiz, `${activeLesson?.id ?? 'no-lesson'}:${adaptiveQuiz.difficultyLabel}:${lessonAttemptState.totalAttempts}`),
    [activeLesson?.id, adaptiveQuiz, lessonAttemptState.totalAttempts]
  )
  const quizDurationSeconds = getQuizDurationSeconds(adaptiveQuiz.difficultyLabel)
  const requiresExplanation = adaptiveQuiz.difficultyLabel !== 'Beginner'
  const now = Date.now()
  const cooldownRemaining = Math.max(0, Math.ceil((lessonAttemptState.cooldownUntil - now) / 1000))
  const isInCooldown = cooldownRemaining > 0
  const badgeMilestones = [
    { label: 'Starter Badge', threshold: 25 },
    { label: 'Momentum Badge', threshold: 50 },
    { label: 'Skilled Badge', threshold: 75 },
    { label: 'Mastery Badge', threshold: 100 },
  ]
  const earnedBadges = badgeMilestones.filter((badge) => studyProgress >= badge.threshold)
  const hasCertificate = studyProgress === 100

  useEffect(() => {
    if (!progressHydrated) return
    setQuizStartedAt(Date.now())
    setTimeRemaining(quizDurationSeconds)
  }, [activeLessonId, progressHydrated, quizDurationSeconds])

  useEffect(() => {
    if (!progressHydrated) return
    if (isCurrentLessonPassed) return
    if (isInCooldown) return
    if (timeRemaining <= 0) return

    const timer = window.setInterval(() => {
      setTimeRemaining((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isCurrentLessonPassed, isInCooldown, progressHydrated, timeRemaining])

  const registerFailedAttempt = (reason: string) => {
    if (!activeLesson) return

    setLessonAttempts((prev) => {
      const current = prev[activeLesson.id] ?? { failedAttempts: 0, totalAttempts: 0, cooldownUntil: 0 }
      const failedAttempts = current.failedAttempts + 1
      const totalAttempts = current.totalAttempts + 1
      const reachedCooldown = failedAttempts >= 3
      const cooldownUntil = reachedCooldown ? Date.now() + 5 * 60 * 1000 : 0

      return {
        ...prev,
        [activeLesson.id]: {
          failedAttempts: reachedCooldown ? 0 : failedAttempts,
          totalAttempts,
          cooldownUntil,
        },
      }
    })

    setSelectedAnswer(null)
    setAnswerExplanation('')
    setQuizStartedAt(Date.now())
    setTimeRemaining(quizDurationSeconds)
    setQuizFeedback(reason)
  }

  const handleResetQuiz = () => {
    if (activeLesson) {
      setLessonAttempts((prev) => {
        const current = prev[activeLesson.id] ?? { failedAttempts: 0, totalAttempts: 0, cooldownUntil: 0 }
        return {
          ...prev,
          [activeLesson.id]: {
            ...current,
            totalAttempts: current.totalAttempts + 1,
          },
        }
      })
    }
    setSelectedAnswer(null)
    setAnswerExplanation('')
    setSuspiciousAttempt('')
    setQuizFeedback('')
    setQuizStartedAt(Date.now())
    setTimeRemaining(quizDurationSeconds)
  }

  const handleQuizSubmit = () => {
    if (!activeLesson || selectedAnswer === null) return
    if (isInCooldown) {
      setQuizFeedback(`Retry locked. Wait ${cooldownRemaining}s before trying this lesson test again.`)
      return
    }
    if (!canSubmitLessonTest) {
      setQuizFeedback(`Complete the ${practiceConfig.actionLabel.toLowerCase()} step first.`)
      return
    }
    if (timeRemaining <= 0) {
      registerFailedAttempt('Time expired. Review the lesson and try the test again.')
      return
    }

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - quizStartedAt) / 1000))
    const submittedTooFast = elapsedSeconds < Math.max(10, Math.floor(quizDurationSeconds * 0.25))
    if (submittedTooFast) {
      setSuspiciousAttempt('Attempt flagged as suspicious because the test was submitted too quickly.')
      registerFailedAttempt('Review the lesson and try again without rushing.')
      return
    }

    if (requiresExplanation && answerExplanation.trim().length < 40) {
      setQuizFeedback('Explain your answer in more detail before submitting this test.')
      return
    }

    if (selectedAnswer !== shuffledQuiz.correctAnswer) {
      registerFailedAttempt('Wrong answer. Review the lesson and try again.')
      return
    }

    setSuspiciousAttempt('')
    setQuizFeedback('Test passed. The next lesson is now unlocked.')
    setLessonAttempts((prev) => {
      if (!activeLesson) return prev
      const current = prev[activeLesson.id] ?? { failedAttempts: 0, totalAttempts: 0, cooldownUntil: 0 }
      return {
        ...prev,
        [activeLesson.id]: {
          failedAttempts: 0,
          totalAttempts: current.totalAttempts + 1,
          cooldownUntil: 0,
        },
      }
    })
    setCompletedLessonIds((prev) => (prev.includes(activeLesson.id) ? prev : [...prev, activeLesson.id]))
  }

  const handlePracticeCheck = () => {
    if (!activeLesson) return
    setPracticeFeedback(allPracticeChecksPassed ? practiceConfig.successMessage : practiceConfig.failureMessage)
  }

  const handleProjectSubmit = () => {
    const hasTitle = projectTitle.trim().length > 2
    const hasDescription = projectDescription.trim().length > 40

    if (!hasTitle || !hasDescription) {
      setProjectFeedback('Add a project title and a more complete description before submitting.')
      return
    }

    setProjectFeedback('Project submission saved for this skill.')
  }

  const handleAssessmentSubmit = () => {
    if (!skill || !user || !assessmentStorageKey) return

    const allQuestionsAnswered = assessmentQuestions.every((question) => assessmentAnswers[question.id] !== undefined)
    if (!allQuestionsAnswered) {
      setAssessmentFeedback('Answer all assessment questions first.')
      return
    }

    const totalScore = assessmentQuestions.reduce((sum, question) => sum + (assessmentAnswers[question.id] ?? 0), 0)
    const assessedLevel = calculateAssessmentLevel(totalScore, assessmentEvidence.trim().length)
    const assessedLessonIds = buildAssessedLessonIds(lessons, assessedLevel)

    updateSkill(skill.id, {
      level: assessedLevel,
      targetLevel: 100,
      lastUpdated: new Date().toISOString(),
    })

    localStorage.setItem(
      assessmentStorageKey,
      JSON.stringify({
        level: assessedLevel,
        assessedAt: new Date().toISOString(),
        answers: assessmentAnswers,
        evidence: assessmentEvidence.trim(),
      })
    )

    setCompletedLessonIds((prev) => Array.from(new Set([...assessedLessonIds, ...prev])))
    if (assessedLessonIds.length > 0) {
      const targetLesson = lessons[Math.min(assessedLessonIds.length, lessons.length - 1)]
      if (targetLesson) {
        setActiveLessonId(targetLesson.id)
      }
    }
    setAssessmentFeedback(`Assessment complete. ${skill.name} now starts at ${assessedLevel}%. ${getAssessmentRecommendation(assessedLevel)}`)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/skills"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Skills Roadmap
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{studyKit.categoryLabel}</p>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{skill.name} Tutorial</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {detailedCourse?.overview ?? `Study ${skill.name} chapter by chapter inside PathForge, then update your skill when you finish real work.`}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-[360px]">
            <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{skill.level}%</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{skill.targetLevel}%</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stage</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{studyKit.stage}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{getStageDescription(studyKit.stage)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <GlassCard className="xl:sticky xl:top-6 xl:h-[calc(100vh-6rem)]" hover={false}>
          <GlassCardContent className="flex h-full flex-col gap-5 overflow-hidden">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Lesson Menu</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose a chapter and study it on this page.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>Study Progress</span>
                <span>{studyProgress}%</span>
              </div>
              <Progress value={studyProgress} className="h-2" />
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              <SidebarSection
                title="Beginner"
                lessons={groupedLessons.beginner}
                activeLessonId={activeLesson?.id ?? ''}
                unlockedLessonIndex={unlockedLessonIndex}
                onSelect={setActiveLessonId}
              />
              <SidebarSection
                title="Intermediate"
                lessons={groupedLessons.intermediate}
                activeLessonId={activeLesson?.id ?? ''}
                unlockedLessonIndex={unlockedLessonIndex}
                onSelect={setActiveLessonId}
              />
              <SidebarSection
                title="Advanced"
                lessons={groupedLessons.advanced}
                activeLessonId={activeLesson?.id ?? ''}
                unlockedLessonIndex={unlockedLessonIndex}
                onSelect={setActiveLessonId}
              />
              <SidebarSection
                title="Practice"
                lessons={groupedLessons.practice}
                activeLessonId={activeLesson?.id ?? ''}
                unlockedLessonIndex={unlockedLessonIndex}
                onSelect={setActiveLessonId}
              />
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard hover={false}>
            <GlassCardContent className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary">{activeLesson?.group}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">{activeLesson?.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{activeLesson?.summary}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    Lesson {activeLessonIndex + 1} of {lessons.length}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Track</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{path.track}</p>
                </div>
                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Video Lesson</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {studyKit.videos[activeLessonIndex % studyKit.videos.length]}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Stage</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{studyKit.stage}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{getStageDescription(studyKit.stage)}</p>
                </div>
                <div className="rounded-xl bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Test Status</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {isCurrentLessonPassed ? 'Passed' : 'Pass this test to unlock the next lesson'}
                  </p>
                </div>
              </div>

              {showFullAssessment ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <p className="text-xs uppercase tracking-[0.18em] text-primary">Starting Level Assessment</p>
                      </div>
                      <p className="mt-3 text-sm text-foreground">
                        If this learner already knows the beginner material, run the assessment to start from the right level and unlock the matching lessons.
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Assessment can place the learner at 0%, 10%, 20%, 34%, 50%, or 70%.
                      </p>
                    </div>
                    {hasStartedLearning && (
                      <button
                        type="button"
                        onClick={() => setIsAssessmentExpanded(false)}
                        className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/20"
                      >
                        Hide reassessment
                      </button>
                    )}
                  </div>

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
                        Write what the learner already built, practiced, or understands. Stronger evidence supports a higher starting level.
                      </p>
                      <textarea
                        value={assessmentEvidence}
                        onChange={(e) => setAssessmentEvidence(e.target.value)}
                        placeholder={`Example: I already finished beginner ${skill.name} tasks and can explain the basic workflow.`}
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
                </div>
              ) : (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <p className="text-xs uppercase tracking-[0.18em] text-primary">Reassess Starting Level</p>
                      </div>
                      <p className="mt-3 text-sm text-foreground">
                        The learner already started this skill. Use reassessment only if the current starting point needs to be re-evaluated.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAssessmentExpanded(true)}
                      className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      Open reassessment
                    </button>
                  </div>
                  {assessmentFeedback && (
                    <p className={cn('mt-4 text-sm', assessmentFeedback.includes('complete') ? 'text-emerald-500' : 'text-amber-500')}>
                      {assessmentFeedback}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-primary">Badges and Certificate</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {badgeMilestones.map((badge) => {
                    const earned = studyProgress >= badge.threshold
                    return (
                      <div
                        key={badge.label}
                        className={cn(
                          'rounded-xl border px-4 py-4',
                          earned ? 'border-primary/40 bg-primary/10' : 'border-border/60 bg-background/20'
                        )}
                      >
                        <p className="text-sm font-medium text-foreground">{badge.label}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{badge.threshold}% progress</p>
                        <p className={cn('mt-3 text-xs font-medium', earned ? 'text-primary' : 'text-muted-foreground')}>
                          {earned ? 'Earned' : 'Locked'}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 rounded-xl border border-border/60 bg-background/20 px-4 py-4">
                  <p className="text-sm font-medium text-foreground">Completion Certificate</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {hasCertificate
                      ? `Certificate unlocked for ${skill.name}. The learner completed the full PathForge study path.`
                      : 'Finish the full study path and pass all required lessons to unlock the certificate.'}
                  </p>
                  {earnedBadges.length > 0 && (
                    <p className="mt-2 text-xs text-primary">
                      Earned: {earnedBadges.map((badge) => badge.label).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-muted/20 p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Lesson Detail</p>
                <div className="space-y-4">
                  {activeLesson?.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-foreground/90">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl bg-muted/20 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">What You Will Learn</p>
                  </div>
                  <div className="space-y-3">
                    {activeLesson?.takeaways.map((item) => (
                      <div key={item} className="rounded-lg border border-border/60 px-4 py-3 text-sm text-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/20 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Practice Task</p>
                  </div>
                  <p className="text-sm leading-7 text-foreground/90">{activeLesson?.exercise}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                  {practiceConfig.mode === 'code' ? 'Practice Workspace' : 'Practice Studio'}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {practiceConfig.intro}
                </p>

                <div className="mt-4">
                  <textarea
                    value={practiceContent}
                    onChange={(e) => setPracticeContent(e.target.value)}
                    spellCheck={false}
                    className={cn(
                      'min-h-[260px] w-full rounded-xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40',
                      practiceConfig.mode === 'code' && 'font-mono'
                    )}
                    placeholder={practiceConfig.placeholder}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {practiceConfig.mode === 'code' ? 'Code Test Checks' : 'Practice Checks'}
                  </p>
                  {practiceChecks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
                      <span className="text-foreground">{check.label}</span>
                      <span className={check.passed ? 'text-emerald-500' : 'text-amber-500'}>
                        {check.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handlePracticeCheck}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/20"
                  >
                    {practiceConfig.actionLabel}
                  </button>
                  {practiceFeedback && (
                    <p className={cn('text-sm', practiceFeedback === practiceConfig.successMessage ? 'text-emerald-500' : 'text-amber-500')}>
                      {practiceFeedback}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-primary">Ready To Move On</p>
                <p className="mt-3 text-sm leading-7 text-foreground/90">{activeLesson?.checkpoint}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary">Lesson Test</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Difficulty: {adaptiveQuiz.difficultyLabel}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Attempts in current streak: {lessonAttemptState.failedAttempts}/3
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{adaptiveQuiz.helperText}</p>
                    <p className={cn('mt-2 text-xs font-medium', timeRemaining <= 10 ? 'text-amber-500' : 'text-muted-foreground')}>
                      Time left: {timeRemaining}s
                    </p>
                    {isInCooldown && (
                      <p className="mt-2 text-xs font-medium text-amber-500">
                        Cooldown active: {cooldownRemaining}s
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-base font-semibold text-foreground">{adaptiveQuiz.question}</p>
                <div className="mt-4 space-y-3">
                  {shuffledQuiz.options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => setSelectedAnswer(index)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                        selectedAnswer === index
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/60 bg-background/20 text-foreground hover:bg-muted/20'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {requiresExplanation && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Explain Your Answer</p>
                    <textarea
                      value={answerExplanation}
                      onChange={(e) => setAnswerExplanation(e.target.value)}
                      placeholder="Explain why this option is correct and how you would apply it in a real task."
                      className="mt-3 min-h-[120px] w-full rounded-xl border border-border/60 bg-background/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}
                {suspiciousAttempt && (
                  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                    <p className="text-sm text-amber-500">{suspiciousAttempt}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick={handleQuizSubmit}
                      disabled={selectedAnswer === null || isCurrentLessonPassed || !canSubmitLessonTest || timeRemaining <= 0 || isInCooldown}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCurrentLessonPassed ? 'Test Completed' : 'Submit Test'}
                    </button>
                    {!isCurrentLessonPassed && !isInCooldown && (
                      <button
                        type="button"
                        onClick={handleResetQuiz}
                        className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/20"
                      >
                        Retry with next question
                      </button>
                    )}
                  </div>
                  {quizFeedback && (
                    <p className={cn('text-sm', isCurrentLessonPassed ? 'text-emerald-500' : 'text-amber-500')}>
                      {quizFeedback}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-primary">Project Submission</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Save a final project or assignment for this skill so the learner has proof of work inside PathForge.
                </p>
                <div className="mt-4 grid gap-4">
                  <input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Project title"
                    className="w-full rounded-xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe what was built, what was learned, and how this proves skill progress."
                    className="min-h-[140px] w-full rounded-xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    placeholder="Optional project link"
                    className="w-full rounded-xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleProjectSubmit}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/20"
                  >
                    Save Project Submission
                  </button>
                  {projectFeedback && (
                    <p className={cn('text-sm', projectFeedback.includes('saved') ? 'text-emerald-500' : 'text-amber-500')}>
                      {projectFeedback}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  onClick={() => {
                    if (activeLessonIndex > 0) {
                      setActiveLessonId(lessons[activeLessonIndex - 1].id)
                    }
                  }}
                  disabled={activeLessonIndex <= 0}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous lesson
                </button>

                <button
                  onClick={() => {
                    if (activeLessonIndex < lessons.length - 1 && isCurrentLessonPassed) {
                      setActiveLessonId(lessons[activeLessonIndex + 1].id)
                    }
                  }}
                  disabled={activeLessonIndex >= lessons.length - 1 || !isCurrentLessonPassed}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next lesson
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
