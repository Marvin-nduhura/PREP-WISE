import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { subject, topics, examDate } = await request.json();

    if (!subject || !topics || !examDate) {
      return NextResponse.json(
        { error: "Subject, topics, and exam date are required." },
        { status: 400 }
      );
    }

    const today = new Date();
    const exam = new Date(examDate);
    const daysUntilExam = Math.ceil(
      (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExam <= 0) {
      return NextResponse.json(
        { error: "Exam date must be in the future." },
        { status: 400 }
      );
    }

    const prompt = `You are PrepWise AI, an expert study planner. Create a detailed, structured study schedule for a student.

Student Details:
- Subject: ${subject}
- Topics to cover: ${topics}
- Exam Date: ${examDate}
- Days until exam: ${daysUntilExam} days
- Today's Date: ${today.toISOString().split("T")[0]}

Generate a comprehensive day-by-day study plan. Format your response with clear sections:

## 📋 Study Overview
Brief summary of the plan strategy.

## 📅 Daily Study Schedule
Break down topics across ${Math.min(daysUntilExam, 14)} days (day by day). Each day should have:
- **Day X (Date):** Topic focus + specific tasks + estimated time

## 🎯 Key Focus Areas
List the most important concepts to master.

## 💡 Study Tips
3-5 personalized tips for this subject.

## ⏰ Recommended Daily Routine
Suggested time blocks for study sessions.

Keep it practical, motivating, and achievable. Use emojis to make it visually engaging.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are PrepWise AI, a helpful and motivating study planner assistant. You create structured, practical, and personalized study schedules.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const planContent =
      completion.choices[0]?.message?.content ||
      "Unable to generate plan. Please try again.";

    return NextResponse.json({ plan: planContent });
  } catch (error: unknown) {
    console.error("Error generating study plan:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate study plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
