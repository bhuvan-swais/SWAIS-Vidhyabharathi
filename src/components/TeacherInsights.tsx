"use client";

import { Users, TrendingUp, Award } from "lucide-react";

const teachers = [
  {
    name: "Primary Section",
    score: 92,
    status: "Excellent",
  },
  {
    name: "Secondary Section",
    score: 87,
    status: "Very Good",
  },
  {
    name: "High School Section",
    score: 84,
    status: "Good",
  },
];

export default function TeacherInsights() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Teacher Insights
          </h2>
          <p className="text-sm text-slate-500">
            Teaching performance overview
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
          <Users size={22} />
        </div>
      </div>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.name}
            className="rounded-xl border border-slate-100 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  {teacher.name}
                </p>
                <p className="text-xs text-slate-500">
                  {teacher.status}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="font-bold text-slate-800">
                  {teacher.score}%
                </span>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${teacher.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
        <Award size={20} className="text-orange-500" />
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Overall Teacher Performance
          </p>
          <p className="text-xs text-slate-500">
            Strong teaching performance across the school
          </p>
        </div>
      </div>
    </section>
  );
}