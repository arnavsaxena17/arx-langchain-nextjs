"use client";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";
import type { AgentStep } from "langchain/schema";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { UploadDocumentsForm } from "@/components/UploadDocumentsForm";
import { IntermediateStep } from "./IntermediateStep";
import { ButtonSubmit } from "./ButtonSubmit";
// import { InputBar } from "./InputBar";

export function ChatWindow(props: { endpoint: string, emptyStateComponent: ReactElement, placeholder?: string, titleText?: string, emoji?: string; showIngestForm?: boolean, showIntermediateStepsToggle?: boolean }) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  console.log("This is the messageContainerRef::", messageContainerRef);
  const {endpoint, emptyStateComponent, placeholder, titleText = "An LLM", showIngestForm, showIntermediateStepsToggle, emoji} = props;
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(false);
  const [intermediateStepsLoading, setIntermediateStepsLoading] = useState(false);
  const ingestForm = showIngestForm && <UploadDocumentsForm></UploadDocumentsForm>;
  const intemediateStepsToggle = showIntermediateStepsToggle && (
    <div>
      <input type="checkbox" id="show_intermediate_steps" name="show_intermediate_steps" checked={showIntermediateSteps} onChange={(e) => setShowIntermediateSteps(e.target.checked)}></input>
      <label htmlFor="show_intermediate_steps"> Show intermediate steps</label>
    </div>
  );

  const [sourcesForMessages, setSourcesForMessages] = useState<Record<string, any>>({});
  console.log("This is the endpoint::", endpoint);

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading, setMessages } =
    useChat({ api: endpoint, onResponse(response) {
        const sourcesHeader = response.headers.get("x-sources");
        const sources = sourcesHeader ? JSON.parse((Buffer.from(sourcesHeader, 'base64')).toString('utf8')) : [];
        const messageIndexHeader = response.headers.get("x-message-index");
        
        console.log("This is the sources::", sources);
        console.log("This is the sourcesHeader::", sourcesHeader);
        console.log("This is the messageIndexHeader::", messageIndexHeader);
        
        if (sources.length && messageIndexHeader !== null) {
          setSourcesForMessages({...sourcesForMessages, [messageIndexHeader]: sources});
        }
        console.log("sourcesForMessages::", sourcesForMessages);
        
      }, onError: (e) => { toast(e.message, { theme: "dark" }); }
    });
  
    console.log("Messages ::::", messages);

  
  const chatMessages = messages.length > 0 ? ([...messages].reverse().map((m, i) => {
    const sourceKey = (messages.length - 1 - i).toString();
    return (m.role === "system" ? <IntermediateStep key={m.id} message={m}></IntermediateStep> : <ChatMessageBubble key={m.id} message={m} aiEmoji={emoji} sources={sourcesForMessages[sourceKey]}></ChatMessageBubble>)
  })) : ( "" )

  
  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    console.log("Going to enter send message on the form event");
    console.log("e::", e);
    e.preventDefault();
    console.log("messageContainerRef:",messageContainerRef);
    
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (!messages.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading ?? intermediateStepsLoading) {
      console.log("Returning for some reason");
      return;
    }
    if (!showIntermediateSteps) {
      console.log("Haven't returned so will handle submit");
      handleSubmit(e);
    // Some extra work to show intermediate steps properly
    } else {
      console.log("Else have to do intermediate steps also"); 
      setIntermediateStepsLoading(true);
      // await sendMessageSteps()
    }
  }

  const sendMessageSequence = async (messagesSequence: string[]) => {
    console.log("Got to send message Sequence");

    for (const messageText of messagesSequence) {
      setInput(messageText); // Set the input value to the current message in the sequence
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 2 seconds
      const buttonToClick = document.querySelector('[type="submit"]') as HTMLButtonElement;
      if (buttonToClick) {
        buttonToClick.click();
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
      // await sendMessage( <> what to send there!!!</>); // Submit the form
      // await sendMessageProgrammatically(); // Send the message programmatically
    }
    console.log("Completed the send message sequence");
    
  };



  const quickSubmit = async () => sendMessageSequence(["Hey what is it like to be a recruiter", "Hey what is like to be a hiring manager", "Hey what is like to be a candidate"])

  return (
    <div className={`flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden ${(messages.length > 0 ? "border" : "")}`}>
      <h2 className={`${messages.length > 0 ? "" : "hidden"} text-2xl`}>{emoji} {titleText}</h2>
      {messages.length === 0 ? emptyStateComponent : ""}
      <div className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out" ref={messageContainerRef}>
        {chatMessages}
      </div>
      {messages.length === 0 && ingestForm}
      <form onSubmit={sendMessage} className="flex flex-col w-full">
        <div className="flex">
          {intemediateStepsToggle}
        </div>
        <div className="flex w-full mt-4">
            <input className="p-4 mr-8 rounded grow" value={input} placeholder={placeholder ?? "What's it like to be a pirate?"} onChange={handleInputChange} />
            {/* <ButtonSubmit chatEndpointIsLoading={chatEndpointIsLoading} intermediateStepsLoading={intermediateStepsLoading} /> */}
            <button type="submit" className="px-8 py-4 rounded shrink-0 bg-sky-600 w-28">
              <div role="status" className={`${(chatEndpointIsLoading || intermediateStepsLoading) ? "" : "hidden"} flex justify-center`}>
                <span className="text-white sr-only" >Loading...</span>
              </div>
              <span className={(chatEndpointIsLoading || intermediateStepsLoading) ? "hidden" : ""}>Send</span>
            </button>

            <button type="button" className="px-4 py-2 ml-2 text-white bg-blue-500 rounded" onClick={quickSubmit}>Quick Submit</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
}
