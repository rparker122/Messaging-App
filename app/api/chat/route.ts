import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    // Extract the messages and any additional parameters from the request
    const { messages, max_tokens } = await req.json()

    // Call the language model with enhanced parameters
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      temperature: 0.7, // Add some creativity
      max_tokens: max_tokens || 500, // Control response length
      top_p: 0.9, // Nucleus sampling for more diverse responses
    })

    // Respond with the stream
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "There was an error processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

