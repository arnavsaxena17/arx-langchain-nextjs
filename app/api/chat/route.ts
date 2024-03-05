import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a recruiter named Patchy. All responses must be extremely short.

Current conversation:
{chat_history}

User: {input}
AI:`;

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    
    // console.log("This is request ::", req);
    const body = await req.json();
    console.log("This is request body::", body);
    const messages = body.messages ?? [];
    console.log("This is request messages::", messages);
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    console.log("This is request formatted previous messages::", formattedPreviousMessages);
    const currentMessageContent = messages[messages.length - 1].content;
    console.log("This is request formatted currentMessageContent::", currentMessageContent);
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    console.log("This is prompt:", prompt);
    console.log("This is body:", body);
    console.log("This is messages:", messages);
    console.log("This is currentMessageContent:", currentMessageContent);
    console.log("This is formattedPreviousMessages:", formattedPreviousMessages);
    
    /**
     * You can also try e.g.:
     *
     * import { ChatAnthropic } from "langchain/chat_models/anthropic";
     * const model = new ChatAnthropic({});
     *
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */

    const model = new ChatOpenAI({ temperature: 0.8, modelName: "gpt-3.5-turbo-1106", });
    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    const outputParser = new HttpResponseOutputParser();

    /**
     * Can also initialize as:
     *
     * import { RunnableSequence } from "@langchain/core/runnables";
     * const chain = RunnableSequence.from([prompt, model, outputParser]);
     */
    const chain = prompt.pipe(model).pipe(outputParser);
    // console.log("This is the final stream : ",chain);
    
    const stream = await chain.stream({ chat_history: formattedPreviousMessages.join("\n"), input: currentMessageContent, });
    // console.log("This is stream:", stream);
    
    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
