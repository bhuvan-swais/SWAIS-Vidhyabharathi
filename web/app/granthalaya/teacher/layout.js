"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/granthalaya/teacher",           label: "Browse Books",   icon: "📚" },
  { href: "/granthalaya/teacher/requests",  label: "My Requests",    icon: "📋" },
  { href: "/granthalaya/teacher/reports",   label: "Report Content", icon: "🚩" },
  { href: "/granthalaya/teacher/notifications", label: "Notifications", icon: "🔔" },
];

export default function TeacherLayout({ children }) {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/granthalaya/teacher") {
      return pathname === "/granthalaya/teacher";
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
        <div className="gl-side-role">Teacher</div>
        <nav aria-label="Teacher navigation">
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
