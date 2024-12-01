import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface AIOrderResponse {
  size: string;
  toppings: string[];
  placement: string;
  customerName?: string;
  phoneNumber?: string;
}

interface Topping {
  name: string;
}

const toppings: Topping[] = [
  { name: 'Pepperoni' },
  { name: 'Mushrooms' },
  { name: 'Onions' }
  // Add other toppings as needed
];

export async function processAIOrder(userInput: string): Promise<AIOrderResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a pizza ordering assistant. Available sizes: S, M, L. 
                   Available toppings: ${toppings.map((t: Topping) => t.name).join(', ')}.
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

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response content from AI');
    return JSON.parse(content) as AIOrderResponse;
  } catch (error) {
    console.error('Error processing AI order:', error);
    throw error;
  }
} 