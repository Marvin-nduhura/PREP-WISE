"use client";

import { useState } from "react";
import { StudyPlan } from "@/types";
import { BookOpen, Calendar, Clock, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface PlanCardProps {
  plan: StudyPlan;
  onDelete?: (id: string) => void;
}

export default function PlanCard({ plan, onDelete }: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysLeft = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysLeft(plan.exam_date);

  const urgencyColor =
    daysLeft < 0
      ? "bg-gray-100 text-gray-500"
      : daysLeft <= 3
      ? "bg-red-100 text-red-600"
      : daysLeft <= 7
      ? "bg-amber-100 text-amber-600"
      : "bg-emerald-100 text-emerald-600";

  const urgencyLabel =
    daysLeft < 0
      ? "Exam passed"
      : daysLeft === 0
      ? "Exam today!"
      : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;

  // Simple markdown-to-HTML: bold, headings
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={i} className="text-base font-bold text-indigo-700 mt-4 mb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h4 key={i} className="text-sm font-semibold text-gray-800 mt-3 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-gray-800 text-sm">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={i} className="text-sm text-gray-600 ml-4 list-disc">
            {line.replace(/^[-•] /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={i} className="h-1" />;
      }
      return (
        <p key={i} className="text-sm text-gray-600 leading-relaxed">
          {line.replace(/\*\*(.*?)\*\*/g, "$1")}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-indigo-50 rounded-xl flex-shrink-0">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-base">
                {plan.subject}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                {plan.topics}
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${urgencyColor}`}>
            {urgencyLabel}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Exam: {formatDate(plan.exam_date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Saved {formatDate(plan.created_at)}
          </span>
        </div>
      </div>

      {/* Expand / Collapse */}
      <div className="border-t border-gray-50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 transition-colors duration-150"
        >
          <span>{expanded ? "Hide Study Plan" : "View Study Plan"}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expanded && (
          <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto scrollbar-thin">
              {renderContent(plan.plan_content)}
            </div>
          </div>
        )}
      </div>

      {/* Delete button */}
      {onDelete && (
        <div className="px-5 pb-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onDelete(plan.id)}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
