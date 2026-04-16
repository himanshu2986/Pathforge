import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, moduleTitle, moduleContent } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: "System Notice: My AI Neural Engine is currently offline. Please ask your administrator to add a valid `GEMINI_API_KEY` to the environment variables so I can process your dynamic questions!"
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a helpful, encouraging "Mentor AI" embedded inside an educational platform named Pathforge. 
Your goal is to help the user understand the concepts in their current chapter.

Current Module Title: ${moduleTitle}
Module Context: ${moduleContent.substring(0, 1500)} // truncate to prevent huge loads

User's Question: "${message}"

Write a concise, directly helpful response. Keep it under 3-4 sentences. Use a slightly high-tech, professional Mentor tone (e.g., 'Analysis complete.', 'Excellent question, recruit.'). Focus on answering the user's specific question using the module context.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ reply: text })

  } catch (error) {
    console.error("AI Chat Generation Error:", error)
    return NextResponse.json({ 
      reply: "My neural network encountered interference and couldn't process that query. Could you try rephrasing it?" 
    }, { status: 500 })
  }
}
