"use client";

import { useState, useEffect, useMemo } from "react";
import { glBooks, glCategories } from "../lib/api";
import BookCard from "../components/BookCard";
import BookSearch from "../components/BookSearch";
import BookFilters from "../components/BookFilters";
import EmptyState from "../components/EmptyState";

export default function TeacherBrowse() {
  const [books, setBooks]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery]           = useState("");
  const [filters, setFilters]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [bks, cats] = await Promise.all([
          glBooks.list("Teacher"),
          glCategories.list("Teacher"),
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

  function setFilter(key, val) { setFilters((f) => ({ ...f, [key]: val })); }

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !b.title.toLowerCase().includes(q) &&
          !(b.author || "").toLowerCase().includes(q) &&
          !(b.keywords || []).some((k) => k.toLowerCase().includes(q))
        ) return false;
      }
      if (filters.category && String(b.category_id) !== filters.category) return false;
      if (filters.class_level && b.class_level !== filters.class_level) return false;
      if (filters.language && b.language !== filters.language) return false;
      return true;
    });
  }, [books, query, filters]);

  if (loading) return <div className="gl-loading">Loading library…</div>;
  if (error)   return <div className="gl-error">Could not load library: {error}</div>;

  return (
    <>
      <div className="gl-page-header">
        <h1 className="gl-page-title">Browse Library</h1>
        <p className="gl-page-sub">Explore books available to students</p>
      </div>

      <div className="gl-toolbar">
        <BookSearch value={query} onChange={setQuery} />
        <BookFilters filters={filters} onChange={setFilter} categories={categories} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No books found"
          message="Try adjusting your search or filters."
          action={{ label: "Clear filters", onClick: () => { setQuery(""); setFilters({}); } }}
        />
      ) : (
        <div className="gl-book-grid">
          {filtered.map((book) => (
            <BookCard key={book.book_id} book={book} role="teacher" />
          ))}
        </div>
      )}
    </>
  );
}
