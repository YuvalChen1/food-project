import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const toppings = [
  'Pepperoni', 'Mushrooms', 'Onions'
];

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const { userInput } = await req.json();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a pizza ordering assistant. Available sizes: S, M, L. 
                   Available toppings: ${toppings.join(', ')}.
                   Placement options: full, left, right.
                   Extract order details from user input and respond in JSON format.`
        },
        {
          role: "user",
          content: userInput
        }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(response.choices[0].message.content);
  } catch (error) {
    console.error('Error processing AI order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process order', details: errorMessage },
      { status: 500 }
    );
  }
} 