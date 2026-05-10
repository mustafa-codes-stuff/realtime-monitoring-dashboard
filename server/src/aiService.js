/**
 * aiService.js
 * 
 * Handles integration with Anthropic Claude API to generate plain-English
 * explanations for detected anomalies.
 */

const { Anthropic } = require('@anthropic-ai/sdk');

// Ensure apiKey is provided, otherwise initialization fails
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key', // Fallback for setup without key
});

async function explainAnomaly(anomalyData) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_key_here') {
    // Mock response if no real key is provided for easier local testing
    return {
      likelyCause: "Mock likely cause since no API key was provided.",
      impact: "Mock impact description.",
      recommendation: "Please set ANTHROPIC_API_KEY in .env to enable real AI analysis."
    };
  }

  const systemPrompt = `You are a systems monitoring expert. Analyse the provided metric spike and return ONLY a JSON object with exactly these keys: likelyCause (string), impact (string), recommendation (string). Be concise and technical. No extra text outside the JSON.`;
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Model requested by user
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: JSON.stringify(anomalyData)
        }
      ]
    });

    const textOutput = response.content[0].text;
    
    // Clean up potential markdown formatting wrapping the JSON
    const cleanJsonStr = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJsonStr);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    
    // If we get an error (like model not found), fallback to 3-5-sonnet just in case
    if (error.status === 404 || error.message.includes('model')) {
       console.log('Falling back to claude-3-5-sonnet-20241022');
       try {
         const fallbackResponse = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: "user", content: JSON.stringify(anomalyData) }]
         });
         const textOutput = fallbackResponse.content[0].text;
         const cleanJsonStr = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
         return JSON.parse(cleanJsonStr);
       } catch (fallbackError) {
         throw fallbackError;
       }
    }
    
    throw new Error('Failed to generate AI explanation');
  }
}

module.exports = { explainAnomaly };
