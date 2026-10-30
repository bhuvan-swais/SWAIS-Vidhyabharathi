"use client";

import "./granthalaya.css";
import { usePathname, useRouter } from "next/navigation";

const ROLES = [
  { label: "Student", path: "/granthalaya/student" },
  { label: "Teacher", path: "/granthalaya/teacher" },
  { label: "Admin",   path: "/granthalaya/admin" },
];

export default function GranthalayaLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  function activeRole() {
    if (pathname.startsWith("/granthalaya/teacher")) return "Teacher";
    if (pathname.startsWith("/granthalaya/admin"))   return "Admin";
    return "Student";
  }

  function switchRole(roleLabel, rolePath) {
    router.push(rolePath);
  }

  return (
    <div className="gl-root">
      <div className="gl-devbar" role="navigation" aria-label="Dev role switcher">
        <span className="gl-devbar-label">DEV MODE — viewing as:</span>
        {ROLES.map((r) => (
          <button
            key={r.label}
            className={`gl-devbar-tab${activeRole() === r.label ? " active" : ""}`}
            onClick={() => switchRole(r.label, r.path)}
          >
            {r.label}
          </button>
        ))}
        <span className="gl-devbar-note">Switch disappears in production</span>
      </div>
      {children}
    </div>
  );
}
