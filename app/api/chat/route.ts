import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const reqJson = await req.json()

    const { messages, max_tokens } = reqJson

    // Validate 'messages' is an array
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "'messages' must be an array of message objects" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Set defaults for parameters or use client provided values
    const maxTokens = typeof max_tokens === "number" && max_tokens > 0 ? max_tokens : 500
    const temperature = typeof reqJson.temperature === "number" ? reqJson.temperature : 0.7
    const top_p = typeof reqJson.top_p === "number" ? reqJson.top_p : 0.9

    // Call the OpenAI model with streaming response
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p,
    })

    // Return the streaming response to the client
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error.stack || error)

    return new Response(
      JSON.stringify({ error: "There was an error processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
