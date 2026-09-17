"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

const KOSHAS = [
  { id: 1, sanskrit: "अन्नमयकोश", name: "Annamaya", desc: "Physical health, stamina, diet, and sports." },
  { id: 2, sanskrit: "प्राणमयकोश", name: "Pranamaya", desc: "Vital energy, breath, and active participation." },
  { id: 3, sanskrit: "मनोमयकोश", name: "Manomaya", desc: "Emotional intelligence, teamwork, and behavior." },
  { id: 4, sanskrit: "विज्ञानमयकोश", name: "Vijnanamaya", desc: "Intellect, critical thinking, and problem-solving." },
  { id: 5, sanskrit: "आनन्दमयकोश", name: "Anandamaya", desc: "Inner joy, Seva (service), and spiritual values." }
];

export default function PanchakoshaEntry() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedKosha, setSelectedKosha] = useState(1);
  const [score, setScore] = useState(5);
  const [notes, setNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem("vb_acharya_token");
      const schoolId = localStorage.getItem("vb_school_id");
      
      if (!token || !schoolId) return;

      try {
        const res = await fetch(`${API}/api/v1/students`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-school-id": schoolId
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !score || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    const token = localStorage.getItem("vb_acharya_token");
    const schoolId = localStorage.getItem("vb_school_id");

    try {
      const res = await fetch(`${API}/api/v1/panchakosha/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-school-id": schoolId
        },
        body: JSON.stringify({
          student_id: parseInt(selectedStudent),
          kosha_id: selectedKosha,
          indicator_id: 1, // Default baseline indicator for MVP
          score: parseFloat(score),
          evidence_notes: notes,
          assessment_date: new Date().toISOString().split('T')[0]
        })
      });

      if (!res.ok) throw new Error("Submission failed");
      
      setFeedback({ type: "success", msg: "Holistic score securely recorded." });
      setNotes("");
      setScore(5);
      
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ type: "error", msg: "Failed to submit score. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-inter">
      
      {/* ── Header ── */}
      <div className="border-b border-orange-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            पञ्चकोश प्रविष्टिः <span className="text-lg text-gray-500 font-bold ml-2">(Holistic Assessment)</span>
          </h1>
        </div>
        <p className="text-gray-600 font-medium pl-14">
          Record evidence-based observations for the five sheaths of development.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ── Student Selection ── */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">विद्यार्थी (Select Student)</label>
              {isLoading ? (
                <div className="h-12 bg-orange-50 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-medium text-gray-900"
                  required
                >
                  <option value="">-- Choose a student --</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>{s.roll_no} - {s.full_name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Kosha Selection ── */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">कोशः (Select Kosha)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {KOSHAS.map(k => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setSelectedKosha(k.id)}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${
                      selectedKosha === k.id 
                        ? "border-orange-500 bg-orange-50" 
                        : "border-gray-100 hover:border-orange-200 hover:bg-orange-50/50"
                    }`}
                  >
                    <p className={`font-bold ${selectedKosha === k.id ? "text-orange-700" : "text-gray-900"}`}>{k.sanskrit}</p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{k.name}</p>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-700">Focus Area: </span> 
                {KOSHAS.find(k => k.id === selectedKosha)?.desc}
              </p>
            </div>

            {/* ── Score & Evidence ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">अङ्कः (Score 1-10)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full accent-orange-600"
                  />
                  <span className="w-12 text-center py-2 bg-orange-100 text-orange-800 font-extrabold rounded-lg">
                    {score}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">प्रमाणम् (Evidence Notes)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Student actively led the morning Prarthana and demonstrated exceptional focus..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-medium text-gray-900 resize-none"
                  required
                />
              </div>
            </div>

            {/* ── Submit & Feedback ── */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                {feedback && (
                  <p className={`text-sm font-bold px-4 py-2 rounded-lg ${
                    feedback.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>
                    {feedback.msg}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !selectedStudent}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "अभिलेख (Save Record)"}
                {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}