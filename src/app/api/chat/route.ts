import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { message, userId, history } = await req.json();

    const systemPrompt = `You are a compassionate AI therapy assistant for the Unwind app. 
    Your role is to provide emotional support, active listening, and gentle guidance. 
    You are not a replacement for professional therapy but a supportive companion.
    
    Guidelines:
    - Be empathetic and non-judgmental
    - Ask thoughtful follow-up questions
    - Validate the user's feelings
    - Offer coping strategies when appropriate
    - Encourage professional help for serious issues
    - Keep responses concise but meaningful
    - Never provide medical diagnoses or prescriptions`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://unwind-therapy.vercel.app',
        'X-Title': 'Unwind Therapy App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    // Store the conversation in Supabase
    // Implementation here...

    return NextResponse.json({
      response: data.choices[0].message.content,
      success: true
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
