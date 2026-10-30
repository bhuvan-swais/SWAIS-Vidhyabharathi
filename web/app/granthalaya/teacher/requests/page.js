"use client";

import { useState, useEffect } from "react";
import { glRequests } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

const EMPTY_FORM = { title: "", author: "", reason: "" };

export default function TeacherRequests() {
  const [requests, setRequests] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    glRequests.mine("Teacher")
      .then((rs) => { if (!cancelled) setRequests(rs); })
      .catch((e) => { if (!cancelled) setApiError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function validate() {
    const e = {};
    if (!form.title.trim())  e.title  = "Book title is required.";
    if (!form.author.trim()) e.author = "Author name is required.";
    if (!form.reason.trim()) e.reason = "Please explain why this book should be added.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setApiError(null);
    try {
      const newReq = await glRequests.create("Teacher", {
        title:  form.title.trim(),
        author: form.author.trim(),
        reason: form.reason.trim(),
      });
      setRequests((rs) => [newReq, ...rs]);
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="gl-loading">Loading requests…</div>;

  return (
    <>
      <div className="gl-page-header">
        <h1 className="gl-page-title">Book Requests</h1>
        <p className="gl-page-sub">Request new books to be added to the library</p>
      </div>

      <div className="gl-card" style={{ marginBottom: 32 }}>
        <h2 className="gl-card-title">New Request</h2>
        {submitted && (
          <div className="gl-alert-success" style={{ marginBottom: 16 }}>
            Request submitted successfully! The admin will review it soon.
          </div>
        )}
        {apiError && (
          <div className="gl-alert-info" style={{ marginBottom: 16 }}>
            {apiError.includes("school") || apiError.includes("400")
              ? "Submission requires authentication fix (Step 4 — pravesha.py school_id). Contact admin."
              : apiError}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="gl-form-group">
            <label className="gl-label" htmlFor="req-title">Book Title *</label>
            <input
              id="req-title"
              className={`gl-input${errors.title ? " gl-input-error" : ""}`}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Enter the book title"
            />
            {errors.title && <div className="gl-field-error">{errors.title}</div>}
          </div>
          <div className="gl-form-group">
            <label className="gl-label" htmlFor="req-author">Author *</label>
            <input
              id="req-author"
              className={`gl-input${errors.author ? " gl-input-error" : ""}`}
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              placeholder="Author name"
            />
            {errors.author && <div className="gl-field-error">{errors.author}</div>}
          </div>
          <div className="gl-form-group">
            <label className="gl-label" htmlFor="req-reason">Reason *</label>
            <textarea
              id="req-reason"
              className={`gl-textarea${errors.reason ? " gl-input-error" : ""}`}
              rows={3}
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Why should this book be added to the library?"
            />
            {errors.reason && <div className="gl-field-error">{errors.reason}</div>}
          </div>
          <button type="submit" className="gl-btn gl-btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>

      <h2 className="gl-section-title">My Requests</h2>
      {requests.length === 0 ? (
        <EmptyState icon="📋" title="No requests yet" message="Submit your first book request above." />
      ) : (
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.request_id}>
                  <td>{r.title}</td>
                  <td>{r.author || "—"}</td>
                  <td>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
