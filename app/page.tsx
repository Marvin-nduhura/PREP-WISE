"use client";

import { useState } from "react";
import StudyForm from "@/components/StudyForm";
import PlanPreview from "@/components/PlanPreview";
import { StudyFormData } from "@/types";
import {
  BrainCircuit,
  Zap,
  Database,
  Rocket,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudyFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const handlePlanGenerated = (plan: string, data: StudyFormData) => {
    setGeneratedPlan(plan);
    setFormData(data);
  };

  const handleSaved = () => {
    setGeneratedPlan(null);
    setFormData(null);
    setSavedCount((c) => c + 1);
  };

  const handleClose = () => {
    setGeneratedPlan(null);
    setFormData(null);
  };

  const features = [
    {
      icon: <BrainCircuit className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      title: "AI-Powered",
      desc: "Groq LLM generates smart, personalized schedules in seconds.",
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
      title: "Instant Plans",
      desc: "Get a day-by-day breakdown tailored to your exam timeline.",
    },
    {
      icon: <Database className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      title: "Cloud Storage",
      desc: "All plans saved to Supabase so you never lose your schedule.",
    },
    {
      icon: <Rocket className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
      title: "Ready to Deploy",
      desc: "Built with Next.js and deployable on Vercel in minutes.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-5 animate-in fade-in duration-500">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          Powered by Groq AI · llama-3.3-70b
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          Study Smarter with{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            PrepWise AI
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          Enter your subject, topics, and exam date. Get a personalized study
          schedule powered by AI — in seconds.
        </p>

        {savedCount > 0 && (
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors animate-in fade-in"
          >
            ✅ {savedCount} plan{savedCount > 1 ? "s" : ""} saved — View My Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <StudyForm
            onPlanGenerated={handlePlanGenerated}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>

        {/* Preview or Features */}
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          {generatedPlan && formData ? (
            <PlanPreview
              plan={generatedPlan}
              formData={formData}
              onSaved={handleSaved}
              onClose={handleClose}
            />
          ) : (
            <div className="space-y-4">
              {/* How it works */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-base">
                  How it works
                </h3>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "Fill in your subject and topics" },
                    { step: "2", text: "Pick your exam date" },
                    { step: "3", text: "AI generates a personalized plan" },
                    { step: "4", text: "Save it and start studying!" },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        {step}
                      </div>
                      <span className="text-sm text-gray-600">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-3">
                {features.map(({ icon, bg, title, desc }) => (
                  <div
                    key={title}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className={`p-2 ${bg} rounded-lg w-fit mb-2.5`}>
                      {icon}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-spin" 
                   style={{ background: "conic-gradient(from 0deg, #6366f1, #a855f7, transparent)" }} />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">Building Your Plan</p>
              <p className="text-sm text-gray-400 mt-1">
                PrepWise AI is crafting a personalized schedule...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
