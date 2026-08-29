"use client";
/* BookCard — reused by student library, teacher browse, and admin book list. */

import Link from "next/link";
import StatusBadge from "./StatusBadge";

const COVER_COLORS = [
  "#D97706", "#0369A1", "#7C3AED", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#4F46E5", "#16A34A", "#EA580C",
];

function coverColor(bookId) {
  return COVER_COLORS[(bookId - 1) % COVER_COLORS.length];
}

export default function BookCard({ book, role = "student", onAction }) {
  const color = coverColor(book.book_id);

  return (
    <div className="gl-book-card">
      <div className="gl-book-cover" style={{ background: color }}>
        <span className="gl-book-cover-icon">📖</span>
      </div>

      <div className="gl-book-body">
        <div className="gl-book-title" title={book.title}>{book.title}</div>
        <div className="gl-book-author">{book.author}</div>
        <div className="gl-book-meta">
          {book.class_level && <span className="gl-pill">{book.class_level}</span>}
          {book.language && <span className="gl-pill gl-pill-neutral">{book.language}</span>}
          {book.download_allowed && (
            <span className="gl-pill gl-pill-ok" title="Download allowed">⬇</span>
          )}
        </div>

        {role === "admin" && (
          <div style={{ marginTop: 6 }}>
            <StatusBadge status={book.status} />
          </div>
        )}
      </div>

      <div className="gl-book-actions">
        {role === "student" && (
          <>
            <Link href={`/granthalaya/student/books/${book.book_id}`} className="gl-btn gl-btn-primary" style={{ fontSize: 13 }}>
              View
            </Link>
            <Link href={`/granthalaya/student/reader/${book.book_id}`} className="gl-btn gl-btn-outline" style={{ fontSize: 13 }}>
              Read
            </Link>
          </>
        )}
        {role === "teacher" && (
          <Link href={`/granthalaya/student/books/${book.book_id}`} className="gl-btn gl-btn-outline" style={{ fontSize: 13 }}>
            View Details
          </Link>
        )}
        {role === "admin" && (
          <>
            <button
              className="gl-btn gl-btn-outline"
              style={{ fontSize: 12 }}
              onClick={() => onAction?.("edit", book)}
            >
              Edit
            </button>
            <button
              className="gl-btn gl-btn-danger"
              style={{ fontSize: 12 }}
              onClick={() => onAction?.("delete", book)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
