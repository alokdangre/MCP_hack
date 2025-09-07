'use client';
import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import styles from '../styles/Home.module.css';

type ToolCallResponse = { ok: boolean; result?: any; error?: string };

// We don't destructure append directly because in some SDK versions the TypeScript type
// doesn't include `append`. Instead we grab the whole helper object and use a safe fallback.
export default function Home() {
  const chat = useChat();              // full helper object
  const messages = chat.messages ?? []; // official messages array managed by useChat
  // localMessages holds any messages we programmatically add when `append` isn't typed/available
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  // safeAppend tries to call the SDK append method if available, otherwise it pushes to localMessages
  function safeAppend(message: any) {
    // prefer append if it exists (some versions expose it)
    if ((chat as any).append) {
      try {
        (chat as any).append(message);
        return;
      } catch (e) {
        // fall back to local below
      }
    }
    // fallback: push into localMessages state so UI shows it
    setLocalMessages((m) => [...m, message]);
  }

  function parseToolCommand(input: string) {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/tool ')) return null;
    const rest = trimmed.slice(6).trim();
    const firstSpace = rest.indexOf(' ');
    if (firstSpace === -1) {
      return { tool: rest, args: {} };
    }
    const tool = rest.slice(0, firstSpace);
    const argsStr = rest.slice(firstSpace + 1).trim();
    try {
      const args = argsStr ? JSON.parse(argsStr) : {};
      return { tool, args };
    } catch (e) {
      return { tool, args: { text: argsStr } };
    }
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const content = text.trim();
    if (!content) return;

    // send the user message via the SDK if possible (useChat provides sendMessage/handleSubmit)
    if ((chat as any).sendMessage) {
      (chat as any).sendMessage({ role: 'user', content: [{ type: 'text', text: content }] });
    } else {
      // fallback: show locally
      safeAppend({ role: 'user', content: [{ type: 'text', text: content }] });
    }

    setText('');
    const parsed = parseToolCommand(content);
    if (!parsed) {
      // fallback echo
      safeAppend({ role: 'assistant', content: [{ type: 'text', text: `Echo: ${content}` }] });
      return;
    }

    setBusy(true);
    try {
      const body = { name: parsed.tool, arguments: parsed.args };
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json: ToolCallResponse = await res.json();

      if (!json.ok) {
        safeAppend({
          role: 'assistant',
          content: [{ type: 'text', text: `Tool error: ${json.error ?? 'unknown'}` }],
        });
      } else {
        const pretty = JSON.stringify(json.result, null, 2);
        // Append assistant message with result (use SDK append if available, else local)
        safeAppend({
          role: 'assistant',
          content: [{ type: 'text', text: `Tool result:\n${pretty}` }],
        });
      }
    } catch (err: any) {
      safeAppend({
        role: 'assistant',
        content: [{ type: 'text', text: `Call failed: ${err?.message ?? String(err)}` }],
      });
    } finally {
      setBusy(false);
    }
  }

  // Render: prefer official messages, then localMessages appended
  const renderedMessages = [...(messages ?? []), ...localMessages];

  return (
    <main className={styles.container}>
      <h1>Unified MCP — Chat UI (Vercel useChat)</h1>

      <div className={styles.chatWindow}>
        {renderedMessages.map((m: any, i: number) => {
          const role = m.role ?? m.author ?? 'assistant';
          const id = m.id ?? `msg-${i}`;
          const textContent = Array.isArray(m.content) ? m.content.map((c:any)=>c.text || '').join('') : (m.content ?? '');
          return (
            <div key={id} className={role === 'user' ? styles.userMsg : styles.assistantMsg}>
              <div className={styles.role}>{role}</div>
              <pre className={styles.msgText}>{textContent}</pre>
            </div>
          );
        })}
      </div>

      <form className={styles.form} onSubmit={handleSend}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Type a message, or /tool slack_list_channels {"limit":3}'
          className={styles.input}
        />
        <button type='submit' disabled={busy} className={styles.button}>
          {busy ? 'Running...' : 'Send'}
        </button>
      </form>

      <small style={{ marginTop: 12, display: 'block' }}>
        Tip: tool syntax — <code>/tool &lt;tool_name&gt; &lt;json_args&gt;</code>
      </small>
    </main>
  );
}
