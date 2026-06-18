"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import PlanCard from "@/components/PlanCard";
import { StudyPlan } from "@/types";
import {
  BookOpenCheck,
  Plus,
  Loader2,
  InboxIcon,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function PlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from("study_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      setPlans(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("study_plans")
        .delete()
        .eq("id", id);
      if (dbError) throw dbError;
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete plan.");
    } finally {
      setDeleting(null);
    }
  };

  const upcomingPlans = plans.filter(
    (p) => new Date(p.exam_date) >= new Date()
  );
  const pastPlans = plans.filter((p) => new Date(p.exam_date) < new Date());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <BookOpenCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Study Plans</h1>
          </div>
          <p className="text-gray-500 text-sm pl-1">
            All your AI-generated study schedules in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-150"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total Plans", value: plans.length, color: "text-indigo-600" },
            { label: "Upcoming Exams", value: upcomingPlans.length, color: "text-emerald-600" },
            { label: "Completed", value: pastPlans.length, color: "text-gray-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm p-4 text-center">
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading your plans...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <button
            onClick={fetchPlans}
            className="mt-3 text-sm text-red-500 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4">
            <InboxIcon className="w-10 h-10 text-indigo-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No plans yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            Generate your first AI study plan and save it here to get started.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Create First Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcomingPlans.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Upcoming Exams ({upcomingPlans.length})
              </h2>
              <div className="space-y-3">
                {upcomingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={deleting === plan.id ? "opacity-50 pointer-events-none" : ""}
                  >
                    <PlanCard plan={plan} onDelete={handleDelete} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {pastPlans.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                Past Exams ({pastPlans.length})
              </h2>
              <div className="space-y-3">
                {pastPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={deleting === plan.id ? "opacity-50 pointer-events-none" : ""}
                  >
                    <PlanCard plan={plan} onDelete={handleDelete} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
