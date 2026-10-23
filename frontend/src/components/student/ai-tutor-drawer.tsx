'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Minimize2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
  contextTag?: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'tutor',
    text: "Hello Alex! I'm your Campus AI Socratic Tutor. How can I help you master CS-204 concepts today?",
    timestamp: 'Just now',
    contextTag: 'CS-204 & General Support',
  },
  {
    id: 'm-2',
    sender: 'student',
    text: "I have Quiz 8 on AVL Trees tonight. What's the main trigger for a Left-Right (LR) double rotation?",
    timestamp: '2m ago',
  },
  {
    id: 'm-3',
    sender: 'tutor',
    text: "Great question! An LR rotation is required when a node is left-heavy (balance factor > +1), but its left child is right-heavy (balance factor < 0). You first perform a left rotation on the left child, followed by a right rotation on the root node to rebalance.",
    timestamp: '1m ago',
    contextTag: 'AVL Tree Rotations',
  },
];

const PROMPT_SUGGESTIONS = [
  'Review Quiz 8: AVL Trees',
  'Explain Left-Right (LR) double rotation',
  'Difference between BFS and DFS',
  'Tips for Binary Search Tree deletion',
];

interface AiTutorDrawerProps {
  currentCourse?: string;
  isQuizActive?: boolean;
  isVisible?: boolean;
}

export default function AiTutorDrawer({
  currentCourse = 'CS-204: Data Structures & Algorithms',
  isQuizActive = false,
  isVisible = true,
}: AiTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dismissBubble, setDismissBubble] = useState(false);
  const msgCountRef = useRef(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;

    msgCountRef.current += 1;
    const newStudentMsg: ChatMessage = {
      id: `msg-${msgCountRef.current}`,
      sender: 'student',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newStudentMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate Socratic AI Response
    setTimeout(() => {
      let reply = "Let's analyze that concept step by step. What invariant must hold true after each insertion or rotation?";
      let contextTag = 'Algorithmic Invariants';

      const lower = text.toLowerCase();
      if (lower.includes('avl') || lower.includes('rotation')) {
        reply = "In AVL Trees, the height difference between left and right subtrees must strictly be -1, 0, or +1. If a node has balance factor +2 and child -1, an LR double rotation restores full balance.";
        contextTag = 'AVL Tree Rotations';
      } else if (lower.includes('bfs') || lower.includes('dfs')) {
        reply = "BFS explores vertices level by level using a FIFO Queue, optimal for unweighted shortest paths. DFS explores deeply down a branch using a LIFO Stack or recursion, ideal for topological sort and cycle detection.";
        contextTag = 'Graph Traversals';
      }

      msgCountRef.current += 1;
      const newTutorMsg: ChatMessage = {
        id: `msg-${msgCountRef.current}`,
        sender: 'tutor',
        text: reply,
        timestamp: 'Just now',
        contextTag,
      };

      setMessages((prev) => [...prev, newTutorMsg]);
      setIsTyping(false);
    }, 600);
  };

  // Anti-Cheat Rule: AI Tutor is completely hidden & disabled during active quiz attempt
  if (isQuizActive || !isVisible) {
    return null;
  }

  return (
    <>
      {/* 1. Trigger Icon & Attention Dialog Speech Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {/* Pulsing Speech Bubble Attention Dialog */}
          {!dismissBubble && (
            <div
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-blue-200 shadow-xl cursor-pointer hover:scale-102 transition-all duration-200 animate-bounce group relative text-slate-800"
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  Need help with CS-204 quizzes?
                </p>
                <p className="text-[10px] text-blue-600 font-semibold">
                  Ask me anytime! &rarr;
                </p>
              </div>

              {/* Close mini bubble */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissBubble(true);
                }}
                className="text-slate-400 hover:text-slate-700 ml-1 p-0.5 rounded cursor-pointer"
                title="Dismiss hint"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Dialog speech bubble arrow pointing right */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-blue-200 rotate-45" />
            </div>
          )}

          {/* Glowing Floating Action Button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Campus AI Tutor"
            className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-tight text-white">AI Tutor</span>
          </button>
        </div>
      )}

      {/* 2. Slide-in Right Drawer (Exactly 1/4 (25%) of Viewport Width on Desktop) */}
      {isOpen && (
        <div
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-1/4 bg-white border-l border-slate-200 shadow-2xl flex flex-col font-sans transition-all duration-300 ease-in-out animate-in slide-in-from-right text-slate-800"
          role="complementary"
          aria-label="Campus AI Tutor Drawer"
        >
          {/* Drawer Header */}
          <div className="px-5 py-4 bg-slate-50 text-slate-900 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-slate-900">
                    Campus AI Tutor
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Socratic
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>Online &bull; Ready to help</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Minimize drawer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close AI Tutor"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close AI Tutor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-[11px] text-slate-700 shrink-0">
            <span className="font-medium truncate max-w-[200px]">
              Active Course: <span className="font-bold text-slate-900">{currentCourse}</span>
            </span>
            <span className="text-blue-700 font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200 text-[10px]">
              Anti-Cheat Locked
            </span>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {isTutor ? 'Campus AI' : 'Alex (You)'}
                    </span>
                    <span className="text-[10px] text-slate-400">&bull; {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isTutor
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        : 'bg-blue-600 text-white rounded-tr-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.contextTag && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        <span>Topic: {msg.contextTag}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-2xl px-3 py-2 w-fit shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>AI Tutor is reasoning...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Context Prompts */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-2">
              <HelpCircle className="w-3 h-3 text-blue-600" />
              <span>Suggested Questions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about Data Structures, quizzes..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>Socratic Guidance &bull; Anti-Cheat</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-blue-600" /> Grounded in Syllabus
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
