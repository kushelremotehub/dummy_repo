/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
  BookOpen,
  Sparkles,
  Clock,
  Users,
  GraduationCap,
  Save,
  Trash2,
  History,
  Plus,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Curriculum {
  id?: number;
  title: string;
  subject: string;
  audience: string;
  duration: string;
  content: string;
  created_at?: string;
}

export default function App() {
  const [subject, setSubject] = useState('');
  const [audience, setAudience] = useState('');
  const [duration, setDuration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCurriculum, setCurrentCurriculum] = useState<Curriculum | null>(null);
  const [history, setHistory] = useState<Curriculum[]>([]);
  const [view, setView] = useState<'designer' | 'history'>('designer');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/curricula');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const generateCurriculum = async () => {
    if (!subject || !audience || !duration) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Design a comprehensive curriculum for the following:
        Subject: ${subject}
        Target Audience: ${audience}
        Duration: ${duration}
        
        Please provide a structured response in Markdown including:
        1. Course Overview
        2. Learning Objectives
        3. Weekly/Module Breakdown
        4. Recommended Resources
        5. Assessment Strategies`,
        config: {
          systemInstruction: "You are an expert curriculum designer and educational consultant. Your goal is to create high-quality, pedagogically sound learning paths that are engaging and practical.",
        }
      });

      const content = response.text || "Failed to generate content.";
      const title = `${subject} for ${audience}`;

      setCurrentCurriculum({
        title,
        subject,
        audience,
        duration,
        content
      });
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCurriculum = async () => {
    if (!currentCurriculum) return;

    try {
      const res = await fetch('/api/curricula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCurriculum)
      });
      if (res.ok) {
        fetchHistory();
        alert("Curriculum saved successfully!");
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const deleteCurriculum = async (id: number) => {
    if (!confirm("Are you sure you want to delete this curriculum?")) return;
    try {
      await fetch(`/api/curricula/${id}`, { method: 'DELETE' });
      fetchHistory();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="border-b border-black/5 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-semibold text-lg tracking-tight">Curriforge</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setView('designer')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-full",
                view === 'designer' ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Designer
            </button>
            <button
              onClick={() => setView('history')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-full flex items-center gap-2",
                view === 'history' ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <History size={16} />
              History
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'designer' ? (
            <motion.div
              key="designer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Input Section */}
              <div className="lg:col-span-4 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Design your path.</h1>
                  <p className="text-gray-500">Enter your requirements and let AI craft a professional curriculum for you.</p>
                </div>

                <div className="space-y-6 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <BookOpen size={14} /> Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Quantum Computing, Italian Cooking"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <Users size={14} /> Target Audience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beginners, Senior Engineers"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <Clock size={14} /> Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4 weeks, 10 hours"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={generateCurriculum}
                    disabled={isGenerating || !subject || !audience || !duration}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Sparkles size={20} />
                    )}
                    {isGenerating ? "Crafting..." : "Generate Curriculum"}
                  </button>
                </div>
              </div>

              {/* Output Section */}
              <div className="lg:col-span-8">
                {currentCurriculum ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden"
                  >
                    <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
                      <div>
                        <h2 className="text-xl font-bold">{currentCurriculum.title}</h2>
                        <p className="text-sm text-gray-500">{currentCurriculum.duration} • {currentCurriculum.audience}</p>
                      </div>
                      <button
                        onClick={saveCurriculum}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Save size={16} />
                        Save to History
                      </button>
                    </div>
                    <div className="p-8 prose prose-indigo max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-600">
                      <Markdown>{currentCurriculum.content}</Markdown>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <FileText size={32} />
                    </div>
                    <p className="text-sm font-medium">Your generated curriculum will appear here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Your History</h1>
                  <p className="text-gray-500">Previously designed learning paths.</p>
                </div>
                <button
                  onClick={() => setView('designer')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
                >
                  <Plus size={18} />
                  New Design
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`card-${item.id}`}
                    className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => {
                      setCurrentCurriculum(item);
                      setView('designer');
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <BookOpen size={20} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.id) deleteCurriculum(item.id);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{item.duration} • {item.audience}</p>
                    <div className="flex items-center text-indigo-600 text-sm font-semibold">
                      View Details <ChevronRight size={16} />
                    </div>
                  </motion.div>
                ))}
                {history.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400">
                    <p>No saved curricula yet. Start designing!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
