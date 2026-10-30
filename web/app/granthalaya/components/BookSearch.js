"use client";
/* BookSearch — reused by student library, teacher browse, and admin book management. */

export default function BookSearch({ value, onChange, placeholder = "Search by title, author, keyword…" }) {
  return (
    <div className="gl-search-wrap">
      <span className="gl-search-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        className="gl-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search books"
      />
      {value && (
        <button
          className="gl-search-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
