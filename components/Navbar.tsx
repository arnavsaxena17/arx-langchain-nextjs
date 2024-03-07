"use client";

import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="mb-4">
      <a className={`mr-4 ${pathname === "/" ? "text-white border-b" : ""}`} href="/">🏴‍☠️ Chat</a>
      <a className={`mr-4 ${pathname === "/app/structured_output" ? "text-white border-b" : ""}`} href="/app/structured_output">🧱 Structured Output</a>
      <a className={`mr-4 ${pathname === "/app/agents" ? "text-white border-b" : ""}`} href="/app/agents">🦜 Agents</a>
      <a className={`mr-4 ${pathname === "/app/retrieval" ? "text-white border-b" : ""}`} href="/app/retrieval">🐶 Retrieval</a>
      <a className={`mr-4 ${pathname === "/app/retrieval_agents" ? "text-white border-b" : ""}`} href="/app/retrieval_agents">🤖 Retrieval Agents</a>
      <a className={`mr-4 ${pathname === "/app/arxchat" ? "text-white border-b" : ""}`} href="/app/arxchat">🛸 Arx Chat</a>
    </nav>
  );
}