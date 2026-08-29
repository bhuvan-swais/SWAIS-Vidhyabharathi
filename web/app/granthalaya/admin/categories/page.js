"use client";

import { useState, useEffect } from "react";
import { glCategories } from "../../lib/api";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import EmptyState from "../../components/EmptyState";

const EMPTY_FORM = { name: "", description: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors]         = useState({});
  const [toast, setToast]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [saving, setSaving]         = useState(false);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    let cancelled = false;
    glCategories.list("Admin")
      .then((cs) => { if (!cancelled) setCategories(cs); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function validate(f) {
    const e = {};
    if (!f.name.trim()) e.name = "Category name is required.";
    return e;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const cat = await glCategories.create("Admin", { name: form.name.trim(), description: form.description.trim() || null });
      setCategories((cs) => [...cs, cat]);
      setForm(EMPTY_FORM);
      setErrors({});
      showToast("Category added.");
    } catch (err) {
      setErrors({ name: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave() {
    const errs = validate(editTarget);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const updated = await glCategories.update("Admin", editTarget.category_id, {
        name: editTarget.name.trim(),
        description: editTarget.description?.trim() || null,
      });
      setCategories((cs) => cs.map((c) => c.category_id === updated.category_id ? updated : c));
      setEditTarget(null);
      setErrors({});
      showToast("Category updated.");
    } catch (err) {
      setErrors({ name: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await glCategories.delete("Admin", deleteTarget.category_id);
      setCategories((cs) => cs.filter((c) => c.category_id !== deleteTarget.category_id));
      showToast("Category deleted.");
    } catch (err) {
      showToast(err.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <div className="gl-loading">Loading categories…</div>;
  if (error)   return <div className="gl-error">Could not load categories: {error}</div>;

  return (
    <>
      <div className="gl-page-header">
        <h1 className="gl-page-title">Categories</h1>
        <p className="gl-page-sub">{categories.length} categories</p>
      </div>

      {toast && <div className="gl-alert-success" style={{ marginBottom: 16 }}>{toast}</div>}

      <div className="gl-card" style={{ marginBottom: 28 }}>
        <h2 className="gl-card-title">Add Category</h2>
        <form onSubmit={handleAdd} noValidate>
          <div className="gl-form-row">
            <div className="gl-form-group">
              <label className="gl-label">Name *</label>
              <input className={`gl-input${errors.name ? " gl-input-error" : ""}`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Category name" />
              {errors.name && <div className="gl-field-error">{errors.name}</div>}
            </div>
            <div className="gl-form-group">
              <label className="gl-label">Description</label>
              <input className="gl-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description (optional)" />
            </div>
          </div>
          <button type="submit" className="gl-btn gl-btn-primary" disabled={saving}>
            {saving ? "Adding…" : "Add Category"}
          </button>
        </form>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon="🗂" title="No categories" message="Add your first category above." />
      ) : (
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.category_id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td>{cat.description || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="gl-btn gl-btn-outline" style={{ fontSize: 12 }} onClick={() => { setEditTarget({ ...cat }); setErrors({}); }}>Edit</button>
                      <button className="gl-btn gl-btn-danger" style={{ fontSize: 12 }} onClick={() => setDeleteTarget(cat)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && (
        <>
          <div className="gl-overlay" onClick={() => setEditTarget(null)} />
          <div className="gl-dialog" role="dialog" aria-modal="true">
            <div className="gl-dialog-header">
              <h3 className="gl-dialog-title">Edit Category</h3>
              <button className="gl-dialog-close" onClick={() => setEditTarget(null)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="gl-form-group" style={{ padding: "0 0 12px" }}>
              <label className="gl-label">Name *</label>
              <input className={`gl-input${errors.name ? " gl-input-error" : ""}`} value={editTarget.name} onChange={(e) => setEditTarget((t) => ({ ...t, name: e.target.value }))} />
              {errors.name && <div className="gl-field-error">{errors.name}</div>}
            </div>
            <div className="gl-form-group" style={{ padding: "0 0 12px" }}>
              <label className="gl-label">Description</label>
              <input className="gl-input" value={editTarget.description || ""} onChange={(e) => setEditTarget((t) => ({ ...t, description: e.target.value }))} />
            </div>
            <div className="gl-dialog-actions">
              <button className="gl-btn gl-btn-ghost" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="gl-btn gl-btn-primary" onClick={handleEditSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Books in this category will lose their category assignment.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
