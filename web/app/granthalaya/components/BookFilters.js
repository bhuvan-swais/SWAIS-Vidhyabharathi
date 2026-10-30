"use client";

export const BOOK_CLASS_LEVELS = [
  "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
];

export const BOOK_LANGUAGES = ["English", "Hindi", "Sanskrit", "Telugu", "Kannada"];

/**
 * BookFilters — used by Student library, Teacher browse, and Admin books pages.
 * categories: array of { category_id, name } from GET /granthalaya/categories.
 */
export default function BookFilters({ filters, onChange, categories = [] }) {
  return (
    <div className="gl-filters">
      <select
        className="gl-select"
        value={filters.category || ""}
        onChange={(e) => onChange("category", e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.category_id} value={String(c.category_id)}>{c.name}</option>
        ))}
      </select>

      <select
        className="gl-select"
        value={filters.class_level || ""}
        onChange={(e) => onChange("class_level", e.target.value)}
        aria-label="Filter by class"
      >
        <option value="">All Classes</option>
        {BOOK_CLASS_LEVELS.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <select
        className="gl-select"
        value={filters.language || ""}
        onChange={(e) => onChange("language", e.target.value)}
        aria-label="Filter by language"
      >
        <option value="">All Languages</option>
        {BOOK_LANGUAGES.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
    </div>
  );
}
