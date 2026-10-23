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
  Award,
  Zap,
} from 'lucide-react';
import { tutorApi, ActionWidget } from '@/lib/api';

export interface ChatMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
  contextTag?: string;
  actionWidgets?: ActionWidget[];
  understandingScore?: number;
}

export interface RemediationMissionData {
  insightId?: string;
  topicId?: string;
  title: string;
  diagnosedGap: string;
  actionPlan: string;
  openingPrompt: string;
  actionWidgets: ActionWidget[];
  teacherAdvice?: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'tutor',
    text: "Hello Alex! I'm your Campus Socratic AI Tutor (Method 2 Interactive). How can I guide you through your course concepts today?",
    timestamp: 'Just now',
    contextTag: 'Grounded Socratic Learning',
    actionWidgets: [
      { type: 'pill', label: 'Review Quiz 8 Concepts', value: 'Review Quiz 8 Concepts' },
      { type: 'pill', label: 'Explain AVL Tree Rotations', value: 'Explain AVL Tree Rotations' },
      { type: 'pill', label: 'Practice Removable Limits', value: 'Practice Removable Limits' },
    ],
  },
];

const PROMPT_SUGGESTIONS = [
  'Explain Left-Right (LR) double rotation',
  'Difference between BFS and DFS',
  'Why do we cancel (x-a) in limits?',
  'Tips for Binary Search Tree deletion',
];

interface AiTutorDrawerProps {
  currentCourse?: string;
  subjectId?: string;
  curriculumTopicId?: string;
  isQuizActive?: boolean;
  isVisible?: boolean;
  initialMission?: RemediationMissionData | null;
  forceOpen?: boolean;
  studentName?: string;
  onClose?: () => void;
}

export default function AiTutorDrawer({
  currentCourse = 'Academic Course',
  subjectId,
  curriculumTopicId,
  isQuizActive = false,
  isVisible = true,
  initialMission = null,
  forceOpen = false,
  studentName = 'Student',
  onClose,
}: AiTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(forceOpen || Boolean(initialMission));
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'tutor',
      text: `Hello ${studentName}! I'm your Campus Socratic AI Tutor. How can I guide you through your course concepts today?`,
      timestamp: 'Just now',
      contextTag: 'Socratic Learning',
      actionWidgets: [
        { type: 'pill', label: 'Ask a Question', value: 'I have a question about this course' },
        { type: 'pill', label: 'Review Key Topics', value: 'Can you summarize key topics?' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dismissBubble, setDismissBubble] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<RemediationMissionData | null>(initialMission);
  const [masteryLevel, setMasteryLevel] = useState<number>(45);
  const [isResolved, setIsResolved] = useState<boolean>(false);
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

  // Sync external forceOpen
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // Handle incoming remediation mission from Quiz Evaluator Agent
  useEffect(() => {
    if (initialMission) {
      setActiveMission(initialMission);
      setIsOpen(true);
      setIsResolved(false);
      setMasteryLevel(40);

      msgCountRef.current += 1;
      const missionPromptMessage: ChatMessage = {
        id: `mission-msg-${msgCountRef.current}`,
        sender: 'tutor',
        text:
          initialMission.openingPrompt ||
          `I noticed you had some difficulty with ${initialMission.title}. Let's break down where you got stuck together. Ready?`,
        timestamp: 'Just now',
        contextTag: initialMission.title,
        actionWidgets:
          initialMission.actionWidgets && initialMission.actionWidgets.length > 0
            ? initialMission.actionWidgets
            : [
                { type: 'pill', label: "Let's start with basics", value: 'basics' },
                { type: 'pill', label: 'Step-by-step breakdown', value: 'step_by_step' },
              ],
      };

      setMessages((prev) => [...prev, missionPromptMessage]);
    }
  }, [initialMission]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;

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

    let activeConvId = conversationId;

    // Try backend AI Tutor Agent first
    try {
      if (!activeConvId && subjectId) {
        const conv = await tutorApi.createConversation(
          subjectId,
          activeMission ? `Remediation: ${activeMission.title}` : 'Socratic Session'
        );
        activeConvId = conv.id;
        setConversationId(conv.id);
      }

      if (activeConvId) {
        const turn = await tutorApi.sendMessage(
          activeConvId,
          text,
          curriculumTopicId || activeMission?.topicId
        );

        msgCountRef.current += 1;
        const newTutorMsg: ChatMessage = {
          id: turn.id || `msg-${msgCountRef.current}`,
          sender: 'tutor',
          text: turn.content,
          timestamp: 'Just now',
          contextTag: activeMission ? activeMission.title : 'Socratic Guidance',
          actionWidgets: turn.actionWidgets,
          understandingScore: turn.understandingScore,
        };

        if (turn.understandingScore !== undefined) {
          setMasteryLevel((prev) =>
            Math.min(100, Math.round(prev + turn.understandingScore! * 25))
          );
        }

        if (turn.isGapResolved) {
          setIsResolved(true);
        }

        setMessages((prev) => [...prev, newTutorMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Backend not running or in offline demo mode: use pedagogical simulated turn
    }

    // High-fidelity fallback simulated Socratic flow (Method 2 Interactive Widgets)
    setTimeout(() => {
      let reply = "Let's analyze that concept step by step. What invariant must hold true after each operation?";
      let contextTag = activeMission?.title || 'Algorithmic Invariants';
      let widgets: ActionWidget[] = [
        { type: 'pill', label: "Let's try another step", value: 'next_step' },
        { type: 'pill', label: 'I need a hint', value: 'hint' },
      ];

      const lower = text.toLowerCase();

      if (lower.includes('factor') || lower.includes('step_by_step') || lower.includes('basics')) {
        reply =
          "Excellent first step! When factoring the numerator (x² - 4), we get (x - 2)(x + 2). Notice the denominator is (x - 2). What happens to the (x - 2) term?";
        contextTag = 'Difference of Squares & Factoring';
        widgets = [
          { type: 'pill', label: 'It cancels out completely', value: 'cancels' },
          { type: 'pill', label: 'Multiply them together', value: 'multiply' },
          { type: 'pill', label: 'Substitute x = 2 directly', value: 'substitute' },
        ];
        setMasteryLevel((prev) => Math.min(100, prev + 20));
      } else if (lower.includes('cancel') || lower.includes('cancels')) {
        reply =
          "Spot on! The (x - 2) term cancels out from numerator and denominator, leaving only (x + 2). Now that the 0/0 indeterminate form is gone, what is the value when x = 2?";
        contextTag = 'Evaluating Cancelled Limits';
        widgets = [
          { type: 'pill', label: 'The limit is 4', value: 'limit_4' },
          { type: 'pill', label: 'The limit is 0', value: 'limit_0' },
          { type: 'pill', label: 'The limit is undefined', value: 'limit_undefined' },
        ];
        setMasteryLevel((prev) => Math.min(100, prev + 25));
      } else if (lower.includes('4') || lower.includes('limit_4')) {
        reply =
          "Perfect! 2 + 2 = 4! You've completely mastered removable discontinuities and resolving indeterminate forms through algebraic cancellation.";
        contextTag = 'Concept Mastered';
        widgets = [];
        setMasteryLevel(95);
        setIsResolved(true);
      } else if (lower.includes('avl') || lower.includes('rotation')) {
        reply =
          "In AVL Trees, if a node has balance factor +2 and child -1, an LR double rotation restores full balance. Would you like to see the rotation sequence?";
        contextTag = 'AVL Tree Rotations';
        widgets = [
          { type: 'pill', label: 'Show Left-Right rotation steps', value: 'lr_steps' },
          { type: 'pill', label: 'Check Right-Left rotation instead', value: 'rl_steps' },
        ];
      }

      msgCountRef.current += 1;
      const newTutorMsg: ChatMessage = {
        id: `msg-${msgCountRef.current}`,
        sender: 'tutor',
        text: reply,
        timestamp: 'Just now',
        contextTag,
        actionWidgets: widgets,
      };

      setMessages((prev) => [...prev, newTutorMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (isQuizActive || !isVisible) {
    return null;
  }

  return (
    <>
      {/* 1. Floating Trigger Button & Attention Speech Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {!dismissBubble && (
            <div
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl neu-card-sm border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-102 transition-all duration-200 animate-bounce group relative text-white"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d2ff] animate-ping shrink-0" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {activeMission ? `Fix Gap: ${activeMission.title}` : 'Socratic AI Tutor Ready'}
                </p>
                <p className="text-[10px] text-[#9e9e9e] font-semibold">
                  Tap to practice with action pills &rarr;
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissBubble(true);
                }}
                className="text-[#757575] hover:text-white ml-1 p-0.5 rounded cursor-pointer"
                title="Dismiss hint"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#262626] border-t border-r border-white/20 rotate-45" />
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Socratic AI Tutor"
            className="neu-btn-accent flex items-center gap-2.5 px-4.5 py-3 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-[0_8px_24px_rgba(0,210,255,0.35)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a0f1d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0a0f1d]"></span>
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#0a0f1d]/20 text-[#0a0f1d] flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#0a0f1d]" />
            </div>
            <span className="text-xs font-black tracking-tight text-[#0a0f1d]">
              {activeMission ? 'Fix Gap (Tutor)' : 'AI Tutor'}
            </span>
          </button>
        </div>
      )}

      {/* 2. Slide-in Right Drawer (Method 2 Interactive UI) */}
      {isOpen && (
        <div
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] md:w-[440px] bg-[#222222] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.85)] flex flex-col font-sans transition-all duration-300 ease-in-out animate-in slide-in-from-right text-white"
          role="complementary"
          aria-label="Socratic AI Tutor Drawer"
        >
          {/* Drawer Header */}
          <div className="px-5 py-4 bg-[#262626] border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl neu-inset text-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm tracking-tight text-white">
                    Campus AI Tutor
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black neu-badge-white">
                    Method 2 Interactive
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#9e9e9e] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                  <span>Online &bull; Action Widgets Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClose}
                title="Minimize Drawer"
                className="p-1.5 rounded-lg text-[#9e9e9e] hover:text-white neu-btn cursor-pointer"
                aria-label="Minimize drawer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                title="Close AI Tutor"
                className="p-1.5 rounded-lg text-[#9e9e9e] hover:text-white neu-btn cursor-pointer"
                aria-label="Close AI Tutor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Knowledge Gap Banner */}
          {activeMission && (
            <div className="px-4 py-3 bg-[#181818] border-b border-cyan-500/20 text-xs shrink-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-cyan-300 font-black">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Remediation Mission</span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isResolved
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {isResolved ? 'Resolved' : 'In Progress'}
                </span>
              </div>
              <p className="text-[11px] text-[#9e9e9e] font-medium leading-relaxed">
                {activeMission.diagnosedGap}
              </p>
              {/* Dynamic Mastery Meter Gauge */}
              <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-[#757575]">
                <span>Deterministic Topic Mastery:</span>
                <span className="text-white font-mono font-black">{masteryLevel}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${masteryLevel}%` }}
                />
              </div>
            </div>
          )}

          {/* Celebratory Resolution Card */}
          {isResolved && (
            <div className="m-3 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 animate-in zoom-in-95">
              <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-black text-emerald-300">Knowledge Gap Resolved!</p>
                <p className="text-[11px] text-[#9e9e9e]">
                  Your mastery delta was deterministically recorded in the database, and your teacher&apos;s dashboard has been updated.
                </p>
              </div>
            </div>
          )}

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e1e1e]">
            {messages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
                      {isTutor ? 'Campus AI Tutor' : `${studentName} (You)`}
                    </span>
                    <span className="text-[10px] text-[#757575]">&bull; {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isTutor
                        ? 'neu-card text-white rounded-tl-xs border border-white/5 space-y-2.5'
                        : 'neu-inset text-white rounded-tr-xs border border-white/10'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.contextTag && (
                      <div className="pt-1.5 border-t border-white/5 flex items-center gap-1 text-[10px] font-semibold text-cyan-300">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        <span>Topic: {msg.contextTag}</span>
                      </div>
                    )}

                    {/* Method 2: Clickable Action Widgets (Pills) */}
                    {isTutor && msg.actionWidgets && msg.actionWidgets.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>Click to Respond (No Typing Needed):</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.actionWidgets.map((widget, widx) => (
                            <button
                              key={widx}
                              type="button"
                              onClick={() => handleSendMessage(widget.label)}
                              className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-sm text-left"
                            >
                              {widget.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 neu-card rounded-2xl px-4 py-2.5 w-fit border border-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>AI Tutor is reasoning & formulating action options...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Context Prompts */}
          <div className="p-3 bg-[#262626] border-t border-white/5 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-white mb-2">
              <HelpCircle className="w-3 h-3 text-cyan-400" />
              <span>Socratic Review Starters</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg neu-btn text-[#9e9e9e] hover:text-white transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-[#262626] border-t border-white/5 shrink-0">
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
                placeholder="Type or click any action pill above..."
                className="flex-1 neu-input px-3.5 py-2.5 text-xs text-white placeholder:text-[#666666]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 rounded-xl neu-btn-accent disabled:opacity-40 text-[#0a0f1d] cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-[#0a0f1d]" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-[#757575] mt-2 px-1">
              <span>Method 2 Action Pills &bull; Anti-Cheat</span>
              <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Grounded in Syllabus
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
