"use client";

import { useState, useEffect } from "react";
import { glBooks, glReports } from "../../lib/api";
import EmptyState from "../../components/EmptyState";

const REASON_OPTIONS = [
  "Inappropriate content",
  "Incorrect information",
  "Copyright violation",
  "Offensive language",
  "Other",
];

const EMPTY_FORM = { book_id: "", reason_category: "", details: "" };

export default function TeacherReports() {
  const [books, setBooks]     = useState([]);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    glBooks.list("Teacher")
      .then((bks) => { if (!cancelled) setBooks(bks); })
      .catch(() => {}) // non-fatal — form still renders
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function validate() {
    const e = {};
    if (!form.book_id)         e.book_id         = "Please select a book.";
    if (!form.reason_category) e.reason_category = "Please select a reason.";
    if (!form.details.trim())  e.details         = "Please describe the issue.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setApiError(null);
    try {
      await glReports.create("Teacher", {
        book_id:         Number(form.book_id),
        reason_category: form.reason_category,
        reason:          form.details.trim(),
      });
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="gl-loading">Loading…</div>;

  return (
    <>
      <div className="gl-page-header">
        <h1 className="gl-page-title">Report Content</h1>
        <p className="gl-page-sub">Flag a book for admin review</p>
      </div>

      <div className="gl-card" style={{ maxWidth: 640 }}>
        {submitted && (
          <div className="gl-alert-success" style={{ marginBottom: 16 }}>
            Report submitted. The admin team will review it shortly.
          </div>
        )}
        {apiError && (
          <div className="gl-alert-info" style={{ marginBottom: 16 }}>
            {apiError.includes("school") || apiError.includes("400")
              ? "Submission requires authentication fix (Step 4 — pravesha.py school_id). Contact admin."
              : apiError}
          </div>
        )}

        {books.length === 0 ? (
          <EmptyState icon="📚" title="No books available" message="There are no active books to report at this time." />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="gl-form-group">
              <label className="gl-label" htmlFor="rpt-book">Book *</label>
              <select
                id="rpt-book"
                className={`gl-select${errors.book_id ? " gl-input-error" : ""}`}
                value={form.book_id}
                onChange={(e) => setForm((f) => ({ ...f, book_id: e.target.value }))}
              >
                <option value="">Select a book…</option>
                {books.map((b) => (
                  <option key={b.book_id} value={b.book_id}>{b.title}</option>
                ))}
              </select>
              {errors.book_id && <div className="gl-field-error">{errors.book_id}</div>}
            </div>

            <div className="gl-form-group">
              <label className="gl-label" htmlFor="rpt-reason">Reason *</label>
              <select
                id="rpt-reason"
                className={`gl-select${errors.reason_category ? " gl-input-error" : ""}`}
                value={form.reason_category}
                onChange={(e) => setForm((f) => ({ ...f, reason_category: e.target.value }))}
              >
                <option value="">Select a reason…</option>
                {REASON_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.reason_category && <div className="gl-field-error">{errors.reason_category}</div>}
            </div>

            <div className="gl-form-group">
              <label className="gl-label" htmlFor="rpt-details">Details *</label>
              <textarea
                id="rpt-details"
                className={`gl-textarea${errors.details ? " gl-input-error" : ""}`}
                rows={4}
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                placeholder="Describe the issue in detail so the admin can investigate effectively."
              />
              {errors.details && <div className="gl-field-error">{errors.details}</div>}
            </div>

            <button type="submit" className="gl-btn gl-btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
