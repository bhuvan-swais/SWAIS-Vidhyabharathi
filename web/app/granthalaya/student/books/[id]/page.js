"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { glBooks, glCategories } from "../../../lib/api";
import EmptyState from "../../../components/EmptyState";

const COVER_COLORS = [
  "#D97706","#0369A1","#7C3AED","#059669","#DC2626",
  "#D97706","#0891B2","#4F46E5","#16A34A","#EA580C",
];
function coverColor(id) { return COVER_COLORS[(id - 1) % COVER_COLORS.length]; }

export default function BookDetail({ params }) {
  const { id } = params;
  const [book, setBook]         = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [bk, cats] = await Promise.all([
          glBooks.get("Student", id),
          glCategories.list("Student"),
        ]);
        if (!cancelled) { setBook(bk); setCategories(cats); }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleDownload() {
    setDownloadError(null);
    setDownloading(true);
    try {
      const { url } = await glBooks.download("Student", id);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      setDownloadError(e.message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <div className="gl-loading">Loading book…</div>;
  if (error)   return <EmptyState icon="❌" title="Book not found" message={error} action={{ label: "Back to Library", onClick: () => history.back() }} />;
  if (!book)   return <EmptyState icon="❌" title="Book not found" message="This book may have been removed or is unavailable." action={{ label: "Back to Library", onClick: () => history.back() }} />;

  const category = categories.find((c) => c.category_id === book.category_id);
  const color    = coverColor(book.book_id);

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Link href="/granthalaya/student" className="gl-btn gl-btn-ghost" style={{ fontSize: 13 }}>
          ← Back to Library
        </Link>
      </div>

      <div className="gl-detail-layout">
        <div>
          <div
            className="gl-book-cover"
            style={{ background: color, height: 320, borderRadius: 12, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            📖
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={`/granthalaya/student/reader/${book.book_id}`} className="gl-btn gl-btn-primary" style={{ textAlign: "center" }}>
              Read Book
            </Link>
            {book.download_allowed ? (
              <button className="gl-btn gl-btn-outline" onClick={handleDownload} disabled={downloading}>
                {downloading ? "Preparing download…" : "Download PDF"}
              </button>
            ) : (
              <button className="gl-btn gl-btn-ghost" disabled title="Downloads not allowed for this book">
                Download not available
              </button>
            )}
          </div>
          {downloadError && (
            <div className="gl-alert-info" style={{ marginTop: 12, fontSize: 13 }}>
              {downloadError}
            </div>
          )}
        </div>

        <div>
          <h1 className="gl-page-title" style={{ marginBottom: 6 }}>{book.title}</h1>
          <p style={{ color: "var(--gl-muted)", marginBottom: 24 }}>by {book.author}</p>

          <table className="gl-detail-table">
            <tbody>
              {[
                ["Publisher", book.publisher || "—"],
                ["Category",  category?.name || "—"],
                ["Class",     book.class_level || "All levels"],
                ["Language",  book.language || "—"],
                ["Views",     book.view_count],
                ["Downloads", book.download_count],
              ].map(([k, v]) => (
                <tr key={k}><th>{k}</th><td>{v}</td></tr>
              ))}
            </tbody>
          </table>

          {book.keywords?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: "var(--gl-text)" }}>Keywords</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {book.keywords.map((kw) => (
                  <span key={kw} className="gl-pill">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
