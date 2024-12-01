interface AIOrderResponse {
  size: string;
  toppings: string[];
  placement: string;
  customerName?: string;
  phoneNumber?: string;
}

export async function processAIOrder(userInput: string): Promise<AIOrderResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput })
    });

    if (!response.ok) throw new Error('Failed to process order');
    const content = await response.json();
    return content as AIOrderResponse;
  } catch (error) {
    console.error('Error processing AI order:', error);
    throw error;
  }
} 