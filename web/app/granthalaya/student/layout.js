"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/granthalaya/student",              label: "Library",       icon: "🏛" },
  { href: "/granthalaya/student/notifications",label: "Notifications", icon: "🔔" },
];

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/granthalaya/student") {
      return pathname === "/granthalaya/student";
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
        <div className="gl-side-role">Student</div>
        <nav aria-label="Student navigation">
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
