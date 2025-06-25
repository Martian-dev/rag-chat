import { google } from "@ai-sdk/google";
import { appendResponseMessages, streamText, tool, Message } from "ai";
import { z } from "zod";
// import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import { NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { saveChat } from "@/lib/actions/queries";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await req.json();
  const { userId } = await auth();

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Use `currentUser()` to get the Backend API User object
  const userPh = (await currentUser())?.phoneNumbers[0];

  if (!userPh) {
    return new NextResponse("No Phone Number", { status: 403 });
  }

  const result = streamText({
    model: google("gemini-2.0-flash"),
    maxRetries: 4,
    system: `You are a helpful assistant, who is supposed to aid the user in their queries. The user's phone number is ${userPh.phoneNumber}. Read, understand what the user is trying to ask, frame a better phrased sentence/keywords for those sentences, and then call the getInformation tool with that to get the required information for the user.
    Only respond to questions using information from the get information tool call, do not use your own knowledge, but you should reason with the given knowledge.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know.". Respond to the user in Markdown format.`,
    messages,
    onFinish: async ({ response }) => {
      if (userId) {
        try {
          await saveChat({
            id,
            messages: appendResponseMessages({
              messages,
              responseMessages: response.messages,
            }),
            userId: userId,
          });
        } catch (error) {
          console.error("Failed to save chat: ", error);
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
    tools: {
      // addResource: tool({
      //   description: `add a resource to your knowledge base.
      //     If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
      //   parameters: z.object({
      //     content: z
      //       .string()
      //       .describe("the content or resource to add to the knowledge base"),
      //   }),
      //   execute: async ({ content }) => createResource({ content }),
      // }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z
            .string()
            .describe(
              "Keywords, better phrased sentence about the information needed to answer the user's query.",
            ),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
      checkStatus: tool({
        description: `get the service status of the user, returns validity and related information of the active service`,
        parameters: z.object({}),
        execute: async () => {
          return "The service is active for the next 75 days.";
        },
      }),
      raiseComplaint: tool({
        description: `notify customer service representatives after trying to solve the problem yourself, only if you fail do this, regarding the issue the user is facing along with their details and connect the representatives with the user.`,
        parameters: z.object({}),
        execute: async () => {
          return "We have notified the representatives with your issue. your ticket id is #42069, they will contact you soon.";
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
