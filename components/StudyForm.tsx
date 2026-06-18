"use client";

import { useState } from "react";
import { BookOpen, Tag, Calendar, Sparkles, Loader2 } from "lucide-react";
import { StudyFormData } from "@/types";

interface StudyFormProps {
  onPlanGenerated: (
    plan: string,
    formData: StudyFormData
  ) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

export default function StudyForm({
  onPlanGenerated,
  isLoading,
  setIsLoading,
}: StudyFormProps) {
  const [formData, setFormData] = useState<StudyFormData>({
    subject: "",
    topics: "",
    examDate: "",
  });
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.subject.trim() || !formData.topics.trim() || !formData.examDate) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formData.subject,
          topics: formData.topics,
          examDate: formData.examDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      onPlanGenerated(data.plan, formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create Your Study Plan</h2>
          <p className="text-sm text-gray-500">Let AI build a personalized schedule for you</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subject */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Mathematics, Physics, History..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Topics */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Topics to Cover
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <textarea
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              placeholder="e.g. Algebra, Calculus, Trigonometry, Statistics..."
              rows={3}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white resize-none"
              disabled={isLoading}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">Separate topics with commas</p>
        </div>

        {/* Exam Date */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Exam Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="date"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              min={today}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 hover:bg-white"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-in slide-in-from-top-2">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating your plan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Study Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
