"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/granthalaya/admin",               label: "Dashboard",     icon: "📊" },
  { href: "/granthalaya/admin/books",          label: "Books",         icon: "📚" },
  { href: "/granthalaya/admin/categories",     label: "Categories",    icon: "🗂" },
  { href: "/granthalaya/admin/requests",       label: "Requests",      icon: "📋" },
  { href: "/granthalaya/admin/reports",        label: "Reports",       icon: "🚩" },
  { href: "/granthalaya/admin/notifications",  label: "Notifications", icon: "🔔" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/granthalaya/admin") {
      return pathname === "/granthalaya/admin";
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="gl-shell">
      <aside className="gl-side">
        <div className="gl-side-brand">
          <span className="gl-side-brand-icon">📚</span>
          <span className="gl-side-brand-name">Granthalaya</span>
        </div>
        <div className="gl-side-role">Admin</div>
        <nav aria-label="Admin navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`gl-nav${isActive(item.href) ? " active" : ""}`}
            >
              <span className="gl-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="gl-content">{children}</main>
    </div>
  );
}
