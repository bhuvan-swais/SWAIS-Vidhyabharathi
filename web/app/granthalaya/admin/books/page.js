"use client";

import { useState, useEffect, useMemo } from "react";
import { glBooks, glCategories } from "../../lib/api";
import { BOOK_CLASS_LEVELS, BOOK_LANGUAGES } from "../../components/BookFilters";
import StatusBadge from "../../components/StatusBadge";
import BookSearch from "../../components/BookSearch";
import BookFilters from "../../components/BookFilters";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import EmptyState from "../../components/EmptyState";

const EMPTY_BOOK = {
  title: "", author: "", publisher: "", category_id: "",
  class_level: "", language: "English", keywords: "",
  download_allowed: false, status: "Active",
};

function BookFormModal({ book, categories, onSave, onClose }) {
  const [form, setForm]     = useState(book ? { ...book, keywords: (book.keywords || []).join(", ") } : EMPTY_BOOK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const isEdit = !!book;

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.title.trim())  e.title    = "Title is required.";
    if (!form.author.trim()) e.author   = "Author is required.";
    if (!form.category_id)   e.category = "Category is required.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiError(null);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        keywords: form.keywords || "",
      };
      const saved = isEdit
        ? await glBooks.update("Admin", book.book_id, payload)
        : await glBooks.create("Admin", payload);
      onSave(saved, isEdit);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="gl-overlay" onClick={onClose} />
      <div className="gl-modal" role="dialog" aria-modal="true" aria-labelledby="book-form-title">
        <div className="gl-modal-header">
          <h2 className="gl-modal-title" id="book-form-title">{isEdit ? "Edit Book" : "Add Book"}</h2>
          <button className="gl-dialog-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="gl-modal-body">
          {apiError && <div className="gl-alert-info" style={{ marginBottom: 12 }}>{apiError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="gl-form-row">
              <div className="gl-form-group">
                <label className="gl-label">Title *</label>
                <input className={`gl-input${errors.title ? " gl-input-error" : ""}`} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Book title" />
                {errors.title && <div className="gl-field-error">{errors.title}</div>}
              </div>
              <div className="gl-form-group">
                <label className="gl-label">Author *</label>
                <input className={`gl-input${errors.author ? " gl-input-error" : ""}`} value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="Author name" />
                {errors.author && <div className="gl-field-error">{errors.author}</div>}
              </div>
            </div>
            <div className="gl-form-row">
              <div className="gl-form-group">
                <label className="gl-label">Publisher</label>
                <input className="gl-input" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} placeholder="Publisher" />
              </div>
              <div className="gl-form-group">
                <label className="gl-label">Category *</label>
                <select className={`gl-select${errors.category ? " gl-input-error" : ""}`} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                </select>
                {errors.category && <div className="gl-field-error">{errors.category}</div>}
              </div>
            </div>
            <div className="gl-form-row">
              <div className="gl-form-group">
                <label className="gl-label">Class Level</label>
                <select className="gl-select" value={form.class_level} onChange={(e) => set("class_level", e.target.value)}>
                  <option value="">All levels</option>
                  {BOOK_CLASS_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="gl-form-group">
                <label className="gl-label">Language</label>
                <select className="gl-select" value={form.language} onChange={(e) => set("language", e.target.value)}>
                  {BOOK_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="gl-form-group">
              <label className="gl-label">Keywords (comma-separated)</label>
              <input className="gl-input" value={form.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="e.g. algebra, geometry, mathematics" />
            </div>
            <div className="gl-form-row">
              <div className="gl-form-group">
                <label className="gl-label">Status</label>
                <select className="gl-select" value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="gl-form-group" style={{ justifyContent: "flex-end" }}>
                <label className="gl-checkbox-label">
                  <input type="checkbox" checked={!!form.download_allowed} onChange={(e) => set("download_allowed", e.target.checked)} />
                  Allow Downloads
                </label>
              </div>
            </div>
            <div className="gl-alert-info" style={{ fontSize: 13 }}>
              PDF / cover upload will be available once S3 access is configured.
            </div>
            <div className="gl-modal-actions">
              <button type="button" className="gl-btn gl-btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="gl-btn gl-btn-primary" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function AdminBooks() {
  const [books, setBooks]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery]           = useState("");
  const [filters, setFilters]       = useState({});
  const [modal, setModal]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  function setFilter(key, val) { setFilters((f) => ({ ...f, [key]: val })); }
  function showToast(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [bks, cats] = await Promise.all([
          glBooks.list("Admin", { include_inactive: true }),
          glCategories.list("Admin"),
        ]);
        if (!cancelled) { setBooks(bks); setCategories(cats); }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const catMap = Object.fromEntries(categories.map((c) => [c.category_id, c.name]));

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (query) {
        const q = query.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !(b.author || "").toLowerCase().includes(q)) return false;
      }
      if (filters.category && String(b.category_id) !== filters.category) return false;
      if (filters.class_level && b.class_level !== filters.class_level) return false;
      if (filters.language && b.language !== filters.language) return false;
      return true;
    });
  }, [books, query, filters]);

  function handleSave(saved, isEdit) {
    setBooks((bs) => {
      if (isEdit) {
        const idx = bs.findIndex((b) => b.book_id === saved.book_id);
        if (idx >= 0) { const u = [...bs]; u[idx] = saved; return u; }
      }
      return [saved, ...bs];
    });
    setModal(null);
    showToast(isEdit ? "Book updated." : "Book added.");
  }

  async function handleDelete() {
    try {
      await glBooks.deactivate("Admin", deleteTarget.book_id);
      setBooks((bs) => bs.map((b) => b.book_id === deleteTarget.book_id ? { ...b, status: "Inactive" } : b));
      showToast("Book deactivated.");
    } catch (e) {
      showToast(e.message, "info");
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <div className="gl-loading">Loading books…</div>;
  if (error)   return <div className="gl-error">Could not load books: {error}</div>;

  return (
    <>
      <div className="gl-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="gl-page-title">Manage Books</h1>
          <p className="gl-page-sub">{books.length} total books</p>
        </div>
        <button className="gl-btn gl-btn-primary" onClick={() => setModal("add")}>+ Add Book</button>
      </div>

      {toast && <div className={`gl-alert-${toast.type}`} style={{ marginBottom: 16 }}>{toast.msg}</div>}

      <div className="gl-toolbar">
        <BookSearch value={query} onChange={setQuery} />
        <BookFilters filters={filters} onChange={setFilter} categories={categories} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📚" title="No books found" message="Try adjusting filters or add a new book." action={{ label: "Add Book", onClick: () => setModal("add") }} />
      ) : (
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr><th>Title</th><th>Author</th><th>Category</th><th>Class</th><th>Language</th><th>Views</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.book_id}>
                  <td style={{ fontWeight: 500 }}>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{catMap[b.category_id] || "—"}</td>
                  <td>{b.class_level || "—"}</td>
                  <td>{b.language}</td>
                  <td>{b.view_count}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="gl-btn gl-btn-outline" style={{ fontSize: 12 }} onClick={() => setModal(b)}>Edit</button>
                      {b.status === "Active" && (
                        <button className="gl-btn gl-btn-danger" style={{ fontSize: 12 }} onClick={() => setDeleteTarget(b)}>Deactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <BookFormModal
          book={modal === "add" ? null : modal}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Deactivate Book"
        message={`Deactivate "${deleteTarget?.title}"? Students will no longer see it. You can reactivate it by editing.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
