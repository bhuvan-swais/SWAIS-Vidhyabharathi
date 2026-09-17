"use client";

import {
  Users,
  UserCheck,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

const kpis = [
  {
    title: "Total Students",
    value: "1,248",
    change: "+5.2%",
    label: "from last month",
    icon: Users,
  },
  {
    title: "Attendance Rate",
    value: "94.6%",
    change: "+2.4%",
    label: "from last month",
    icon: UserCheck,
  },
  {
    title: "Academic Score",
    value: "87.8%",
    change: "+4.8%",
    label: "from last term",
    icon: GraduationCap,
  },
  {
    title: "Teacher Performance",
    value: "91.2%",
    change: "+3.1%",
    label: "from last month",
    icon: TrendingUp,
  },
];

export default function KPISection() {
  return (
    <section className="kpi-section">

      <div className="section-heading">
        <div>
          <span>OVERVIEW</span>
          <h3>School KPIs</h3>
        </div>

        <button className="view-report-button">
          View detailed report →
        </button>
      </div>

      <div className="kpi-grid">

        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <div className="kpi-card" key={kpi.title}>

              <div className="kpi-card-top">

                <div className="kpi-icon">
                  <Icon size={20} />
                </div>

                <span className="kpi-change">
                  {kpi.change}
                </span>

              </div>

              <div className="kpi-value">
                {kpi.value}
              </div>

              <div className="kpi-title">
                {kpi.title}
              </div>

              <div className="kpi-label">
                {kpi.label}
              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}