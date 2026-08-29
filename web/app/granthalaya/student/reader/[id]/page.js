"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { glBooks } from "../../../lib/api";
import EmptyState from "../../../components/EmptyState";

export default function BookReader({ params }) {
  const { id } = params;
  const [book, setBook]       = useState(null);
  const [pdfUrl, setPdfUrl]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [s3Pending, setS3Pending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const bk = await glBooks.get("Student", id);
        if (cancelled) return;
        setBook(bk);

        if (!bk.pdf_key) {
          setS3Pending(true);
          setLoading(false);
          return;
        }

        try {
          const { url } = await glBooks.read("Student", id);
          if (!cancelled) setPdfUrl(url);
        } catch (s3err) {
          if (!cancelled) {
            if (s3err.message.includes("503") || s3err.message.toLowerCase().includes("s3")) {
              setS3Pending(true);
            } else {
              setError(s3err.message);
            }
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="gl-loading">Loading reader…</div>;
  if (error)   return <EmptyState icon="❌" title="Could not load book" message={error} />;
  if (!book)   return <EmptyState icon="❌" title="Book not found" message="This book may have been removed." />;

  return (
    <div className="gl-reader-shell">
      <div className="gl-reader-bar">
        <Link href={`/granthalaya/student/books/${book.book_id}`} className="gl-reader-back">
          ← Back
        </Link>
        <span className="gl-reader-title">{book.title}</span>
      </div>

      <div className="gl-reader-body" style={{ flexDirection: "column" }}>
        {s3Pending ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h2 style={{ marginBottom: 8 }}>{book.title}</h2>
            <p style={{ color: "var(--gl-muted)", maxWidth: 480, margin: "0 auto 16px" }}>
              PDF reading requires S3 credentials. The AWS bucket and credentials will be
              configured tomorrow. Come back once they are set up.
            </p>
            <div className="gl-alert-info" style={{ display: "inline-block", textAlign: "left" }}>
              <strong>Pending:</strong> Set <code>AWS_REGION</code>, <code>AWS_S3_BUCKET</code>,
              <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code> in{" "}
              <code>backend/.env</code> and upload a PDF via the Admin → Books panel.
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={book.title}
            style={{ flex: 1, width: "100%", border: "none", minHeight: "80vh" }}
          />
        ) : (
          <EmptyState icon="📄" title="No PDF available" message="No PDF has been uploaded for this book yet." />
        )}
      </div>
    </div>
  );
}
