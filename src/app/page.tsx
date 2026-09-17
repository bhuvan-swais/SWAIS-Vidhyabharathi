"use client";

import { useState } from "react";

type Page =
  | "Dashboard"
  | "School KPIs"
  | "Attendance Overview"
  | "Academic Performance"
  | "Class Analytics"
  | "Teacher Insights"
  | "Alerts";

const pages: Page[] = [
  "Dashboard",
  "School KPIs",
  "Attendance Overview",
  "Academic Performance",
  "Class Analytics",
  "Teacher Insights",
  "Alerts",
];

const icons = ["⌂", "▣", "◷", "◈", "▤", "♙", "⚠"];

const kpis = [
  ["🏫", "Total Students", "1,248", "+5.2%"],
  ["👨‍🏫", "Teachers", "68", "+2.1%"],
  ["📚", "Avg. Attendance", "94.6%", "+3.8%"],
  ["🎓", "Academic Score", "87.4%", "+8.4%"],
];

export default function Home() {
  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [language, setLanguage] = useState("English");

  const logout = () => {
    window.location.href = "https://staging.vb.swais.in/";
  };

  return (
    <main className={darkMode ? "app dark" : "app"}>

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="logo">VB</div>

          <div>
            <strong>VIDHYA BHARATHI</strong>
            <span>School Intelligence</span>
          </div>
        </div>

        <div className="profile">
          <div className="avatar">PA</div>

          <div>
            <strong>Pradhana Acharya</strong>
            <span>School Administrator</span>
          </div>
        </div>

        <nav>
          <p className="nav-title">MAIN MENU</p>

          {pages.map((page, index) => (
            <button
              key={page}
              className={
                activePage === page
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage(page)}
            >
              <span className="nav-icon">
                {icons[index]}
              </span>

              <span>{page}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout"
            onClick={logout}
          >
            ↪
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* PAGE AREA */}
      <section className="page-area">

        {/* HEADER */}
        <header className="header">

          <div className="header-brand">

            <div className="mini-logo">
              VB
            </div>

            <div>
              <strong>Vidhya Bharathi</strong>
              <span>Pradhana Acharya</span>
            </div>

          </div>

          <div className="header-actions">

            <button
              className="ai-button"
              onClick={() => setShowAI(true)}
            >
              ✨ AI Tools
            </button>

            <select
              className="language"
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
            >
              <option>English</option>
              <option>తెలుగు</option>
              <option>हिन्दी</option>
            </select>

            <button
              className="header-icon"
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode ? "☀" : "☾"}
            </button>

            <button className="header-icon notification">
              🔔
              <i />
            </button>

            <div className="header-avatar">
              PA
            </div>

          </div>

        </header>

        {/* CONTENT */}
        <div className="content">

          {activePage === "Dashboard" && (
            <Dashboard />
          )}

          {activePage === "School KPIs" && (
            <SchoolKPIs />
          )}

          {activePage === "Attendance Overview" && (
            <Attendance />
          )}

          {activePage === "Academic Performance" && (
            <Academic />
          )}

          {activePage === "Class Analytics" && (
            <ClassAnalytics />
          )}

          {activePage === "Teacher Insights" && (
            <TeacherInsights />
          )}

          {activePage === "Alerts" && (
            <Alerts />
          )}

          <footer>
            © 2026 Vidhya Bharathi • Pradhana Acharya Dashboard
          </footer>

        </div>

      </section>

      {/* AI TOOLS */}
      {showAI && (
        <div
          className="overlay"
          onClick={() => setShowAI(false)}
        >
          <div
            className="ai-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="ai-header">

              <div>
                <span className="ai-badge">
                  ✨ AI POWERED
                </span>

                <h2>AI Tools</h2>

                <p>
                  Smart insights for your school
                </p>
              </div>

              <button
                onClick={() => setShowAI(false)}
              >
                ✕
              </button>

            </div>

            <div className="ai-grid">

              <button className="ai-card">
                <span>📋</span>
                <strong>Assignment Report</strong>
                <small>
                  Generate assignment insights
                </small>
              </button>

              <button className="ai-card">
                <span>👨‍🏫</span>
                <strong>Teacher Performance</strong>
                <small>
                  Analyze teacher performance
                </small>
              </button>

              <button className="ai-card">
                <span>📊</span>
                <strong>Academic Analytics</strong>
                <small>
                  Get academic insights
                </small>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            Arial,
            sans-serif;
          background: #f7f7f8;
        }

        button,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          display: flex;
          background: #f7f7f8;
          color: #252525;
        }

        .sidebar {
          width: 260px;
          position: fixed;
          inset: 0 auto 0 0;
          background: white;
          border-right: 1px solid #ececec;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          z-index: 20;
        }

        .brand {
          display: flex;
          gap: 11px;
          align-items: center;
          padding: 0 8px 24px;
          border-bottom: 1px solid #eeeeee;
        }

        .logo,
        .mini-logo {
          background: #e87918;
          color: white;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
        }

        .logo {
          width: 43px;
          height: 43px;
          font-size: 13px;
        }

        .brand strong {
          display: block;
          font-size: 12px;
        }

        .brand span {
          display: block;
          margin-top: 3px;
          color: #999;
          font-size: 9px;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 4px;
          padding: 12px;
          background: #fff6ee;
          border-radius: 13px;
        }

        .avatar,
        .header-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f1c39d;
          color: #743b14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
        }

        .profile strong {
          display: block;
          font-size: 11px;
        }

        .profile span {
          display: block;
          margin-top: 3px;
          color: #999;
          font-size: 8px;
        }

        .nav-title {
          color: #aaa;
          font-size: 9px;
          letter-spacing: 1px;
          font-weight: 800;
          padding: 0 12px;
        }

        .nav-item {
          width: 100%;
          border: 0;
          background: transparent;
          color: #777;
          padding: 11px 12px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 3px 0;
          text-align: left;
          font-size: 11px;
        }

        .nav-item:hover {
          background: #fff5ed;
          color: #e87918;
        }

        .nav-item.active {
          background: #fff0e5;
          color: #d96508;
          font-weight: 700;
        }

        .nav-icon {
          width: 20px;
          text-align: center;
          font-size: 15px;
        }

        .sidebar-bottom {
          margin-top: auto;
          border-top: 1px solid #eee;
          padding-top: 13px;
        }

        .logout {
          width: 100%;
          background: transparent;
          border: 0;
          color: #d9534f;
          padding: 11px 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 11px;
        }

        .page-area {
          width: calc(100% - 260px);
          margin-left: 260px;
        }

        .header {
          height: 74px;
          background: white;
          border-bottom: 1px solid #eee;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-brand,
        .header-actions {
          display: flex;
          align-items: center;
        }

        .header-brand {
          gap: 10px;
        }

        .mini-logo {
          width: 35px;
          height: 35px;
          font-size: 10px;
        }

        .header-brand strong {
          display: block;
          font-size: 12px;
        }

        .header-brand span {
          display: block;
          color: #999;
          font-size: 9px;
          margin-top: 2px;
        }

        .header-actions {
          gap: 9px;
        }

        .ai-button {
          border: 0;
          background: #e87918;
          color: white;
          border-radius: 9px;
          padding: 10px 15px;
          font-size: 10px;
          font-weight: 800;
        }

        .language,
        .header-icon {
          height: 37px;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 9px;
        }

        .language {
          padding: 0 9px;
          color: #555;
          font-size: 10px;
        }

        .header-icon {
          width: 37px;
          position: relative;
        }

        .notification i {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e87918;
        }

        .content {
          padding: 30px 34px 40px;
          max-width: 1500px;
          margin: auto;
        }

        .page-heading {
          margin-bottom: 24px;
        }

        .page-heading .eyebrow {
          color: #e87918;
          font-size: 9px;
          letter-spacing: 1.3px;
          font-weight: 800;
        }

        .page-heading h1 {
          margin: 6px 0;
          font-size: 26px;
        }

        .page-heading p {
          margin: 0;
          color: #888;
          font-size: 11px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 16px;
        }

        .kpi-card,
        .card {
          background: white;
          border: 1px solid #eee;
          border-radius: 15px;
          box-shadow:
            0 5px 20px #00000005;
        }

        .kpi-card {
          padding: 18px;
        }

        .kpi-top {
          display: flex;
          justify-content: space-between;
        }

        .kpi-icon {
          width: 37px;
          height: 37px;
          border-radius: 10px;
          background: #fff2e8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .positive {
          color: #249b4b;
          background: #eaf8ef;
          padding: 4px 7px;
          height: fit-content;
          border-radius: 6px;
          font-size: 8px;
          font-weight: 800;
        }

        .kpi-label {
          display: block;
          color: #888;
          margin-top: 15px;
          font-size: 9px;
        }

        .kpi-value {
          display: block;
          font-size: 23px;
          margin-top: 4px;
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .card {
          padding: 21px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .section-label {
          color: #e87918;
          font-size: 8px;
          letter-spacing: 1.2px;
          font-weight: 800;
        }

        .card h2 {
          margin: 5px 0 0;
          font-size: 17px;
        }

        .card-icon {
          width: 37px;
          height: 37px;
          background: #fff2e8;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .attendance-main {
          display: flex;
          align-items: center;
          gap: 35px;
        }

        .attendance-circle {
          width: 125px;
          height: 125px;
          border-radius: 50%;
          border: 13px solid #f4d2b5;
          border-top-color: #e87918;
          border-right-color: #e87918;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .attendance-circle strong {
          font-size: 22px;
        }

        .attendance-circle span {
          color: #999;
          font-size: 9px;
        }

        .attendance-stats {
          display: grid;
          gap: 18px;
        }

        .attendance-stats strong {
          display: block;
          font-size: 18px;
        }

        .attendance-stats span {
          color: #999;
          font-size: 9px;
        }

        .bars {
          height: 100px;
          display: flex;
          justify-content: space-around;
          align-items: end;
          border-top: 1px solid #eee;
          margin-top: 18px;
          padding-top: 10px;
        }

        .bar-item {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: end;
          align-items: center;
          gap: 5px;
        }

        .bar {
          height: 65px;
          width: 17px;
          background: #f2f2f2;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: end;
        }

        .bar div {
          width: 100%;
          background: #e87918;
          border-radius: 8px;
        }

        .bar-item span {
          font-size: 8px;
          color: #aaa;
        }

        .subject {
          margin: 15px 0;
        }

        .subject-top {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          margin-bottom: 6px;
        }

        .progress {
          height: 5px;
          background: #eee;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress div {
          height: 100%;
          background: #e87918;
          border-radius: inherit;
        }

        .score-box {
          background: #fff7f0;
          padding: 15px;
          border-radius: 11px;
          margin-bottom: 17px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .score-box span {
          color: #999;
          display: block;
          font-size: 9px;
        }

        .score-box strong {
          display: block;
          margin-top: 3px;
          font-size: 23px;
        }

        .score-up {
          color: #249b4b !important;
          font-weight: 800;
        }

        .class-row,
        .teacher-row,
        .alert-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .class-avatar,
        .teacher-avatar {
          width: 39px;
          height: 39px;
          border-radius: 10px;
          background: #fff1e6;
          color: #e87918;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
        }

        .class-info,
        .teacher-info {
          flex: 1;
        }

        .class-info strong,
        .class-info span,
        .teacher-info strong,
        .teacher-info span {
          display: block;
        }

        .class-info strong,
        .teacher-info strong {
          font-size: 11px;
        }

        .class-info span,
        .teacher-info span {
          color: #aaa;
          font-size: 8px;
          margin-top: 3px;
        }

        .class-score {
          width: 105px;
        }

        .class-score strong {
          display: block;
          text-align: right;
          font-size: 10px;
          margin-bottom: 5px;
        }

        .insight {
          color: #777;
          line-height: 1.8;
          font-size: 10px;
        }

        .highlight {
          background: #fff6ee;
          padding: 16px;
          border-radius: 11px;
          margin: 18px 0;
        }

        .highlight strong {
          color: #e87918;
          display: block;
          font-size: 26px;
        }

        .highlight span {
          color: #999;
          font-size: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          font-size: 9px;
        }

        .summary-row span {
          color: #888;
        }

        .summary-row strong {
          color: #299a50;
        }

        .teacher-avatar {
          border-radius: 50%;
        }

        .teacher-score {
          width: 115px;
        }

        .teacher-score strong {
          display: block;
          text-align: right;
          font-size: 10px;
          margin-bottom: 5px;
        }

        .alert-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .orange {
          background: #e87918;
        }

        .red {
          background: #df5353;
        }

        .green {
          background: #36a35a;
        }

        .alert-content {
          flex: 1;
        }

        .alert-content strong {
          display: block;
          font-size: 10px;
        }

        .alert-content p {
          color: #999;
          margin: 4px 0 0;
          font-size: 8px;
        }

        .alert-time {
          color: #aaa;
          font-size: 8px;
        }

        .metric-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 14px;
        }

        .metric {
          padding: 20px;
          border-radius: 13px;
          background: #fff7f0;
        }

        .metric span {
          display: block;
          color: #999;
          font-size: 9px;
        }

        .metric strong {
          display: block;
          margin-top: 7px;
          font-size: 24px;
        }

        footer {
          text-align: center;
          color: #aaa;
          font-size: 8px;
          padding: 20px;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: #00000055;
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .ai-modal {
          width: min(650px, 100%);
          background: white;
          border-radius: 20px;
          padding: 25px;
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .ai-header h2 {
          margin: 8px 0 3px;
          font-size: 24px;
        }

        .ai-header p {
          margin: 0;
          color: #999;
          font-size: 10px;
        }

        .ai-header button {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 50%;
          background: #f5f5f5;
        }

        .ai-badge {
          background: #fff0e5;
          color: #e87918;
          border-radius: 20px;
          padding: 5px 9px;
          font-size: 8px;
          font-weight: 800;
        }

        .ai-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .ai-card {
          border: 1px solid #eee;
          background: white;
          border-radius: 14px;
          padding: 20px 12px;
          text-align: left;
        }

        .ai-card:hover {
          border-color: #e87918;
          transform: translateY(-2px);
        }

        .ai-card span,
        .ai-card strong,
        .ai-card small {
          display: block;
        }

        .ai-card span {
          font-size: 22px;
          margin-bottom: 13px;
        }

        .ai-card strong {
          font-size: 10px;
        }

        .ai-card small {
          color: #999;
          font-size: 8px;
          margin-top: 5px;
        }

        .dark {
          background: #121212;
          color: #eee;
        }

        .dark .sidebar,
        .dark .header,
        .dark .card,
        .dark .kpi-card {
          background: #1d1d1d;
          border-color: #303030;
        }

        .dark .nav-item {
          color: #aaa;
        }

        .dark .nav-item.active {
          background: #39281e;
          color: #ff9a4b;
        }

        .dark .header-icon,
        .dark .language {
          background: #1d1d1d;
          color: white;
          border-color: #333;
        }

        .dark .profile,
        .dark .score-box,
        .dark .highlight,
        .dark .metric {
          background: #29221d;
        }

        @media (max-width: 1100px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .two-column {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .sidebar {
            width: 75px;
          }

          .brand div:last-child,
          .profile div:last-child,
          .nav-item span:last-child,
          .logout span,
          .nav-title {
            display: none;
          }

          .profile {
            justify-content: center;
          }

          .nav-item {
            justify-content: center;
          }

          .page-area {
            width: calc(100% - 75px);
            margin-left: 75px;
          }

          .header {
            padding: 0 15px;
          }

          .header-brand div:last-child,
          .language {
            display: none;
          }

          .content {
            padding: 20px 15px;
          }

          .metric-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .ai-grid {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </main>
  );
}


/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  return (
    <>
      <PageHeading
        eyebrow="VIDHYA BHARATHI • SCHOOL INTELLIGENCE"
        title="Welcome, Pradhana Acharya 👋"
        description="Monitor your school's performance, attendance and academic progress from one intelligent dashboard."
      />

      <KPIGrid />

      <div className="two-column">
        <AttendanceCard />
        <AcademicCard />
      </div>

      <div className="two-column">
        <ClassCard />
        <InsightsCard />
      </div>

      <div className="two-column">
        <TeacherCard />
        <AlertsCard />
      </div>
    </>
  );
}


/* =====================================================
   SCHOOL KPI
===================================================== */

function SchoolKPIs() {
  return (
    <>
      <PageHeading
        eyebrow="SCHOOL KPIs"
        title="School Key Performance Indicators"
        description="Track the most important performance indicators of your school."
      />

      <KPIGrid />

      <div className="two-column">

        <div className="card">
          <CardHeader
            label="ENROLLMENT"
            title="Student Overview"
            icon="🏫"
          />

          <div className="metric-grid">

            <Metric
              title="Total Students"
              value="1,248"
            />

            <Metric
              title="New Admissions"
              value="86"
            />

            <Metric
              title="Active Classes"
              value="32"
            />

          </div>
        </div>

        <div className="card">
          <CardHeader
            label="PERFORMANCE"
            title="School Health"
            icon="📈"
          />

          <div className="summary-row">
            <span>Attendance</span>
            <strong>94.6%</strong>
          </div>

          <div className="summary-row">
            <span>Academic Score</span>
            <strong>87.4%</strong>
          </div>

          <div className="summary-row">
            <span>Teacher Performance</span>
            <strong>89.2%</strong>
          </div>

          <div className="summary-row">
            <span>Student Growth</span>
            <strong>+8.4%</strong>
          </div>
        </div>

      </div>
    </>
  );
}


/* =====================================================
   ATTENDANCE
===================================================== */

function Attendance() {
  return (
    <>
      <PageHeading
        eyebrow="ATTENDANCE OVERVIEW"
        title="Student Attendance"
        description="Monitor daily attendance and identify classes requiring attention."
      />

      <div className="kpi-grid">

        <MetricCard
          icon="✅"
          label="Present Today"
          value="1,181"
          change="+3.8%"
        />

        <MetricCard
          icon="❌"
          label="Absent Today"
          value="67"
          change="-2.1%"
        />

        <MetricCard
          icon="📊"
          label="Attendance Rate"
          value="94.6%"
          change="+3.8%"
        />

        <MetricCard
          icon="⚠️"
          label="Classes Below 90%"
          value="3"
          change="-1"
        />

      </div>

      <div className="two-column">

        <AttendanceCard />

        <div className="card">
          <CardHeader
            label="CLASS ATTENDANCE"
            title="Attendance Status"
            icon="📋"
          />

          {[
            ["Class 10", "97%", "Excellent"],
            ["Class 9", "95%", "Excellent"],
            ["Class 8", "93%", "Good"],
            ["Class 7", "88%", "Needs Attention"],
          ].map((row) => (
            <div className="summary-row" key={row[0]}>
              <span>{row[0]}</span>
              <strong>{row[1]} • {row[2]}</strong>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}


/* =====================================================
   ACADEMIC
===================================================== */

function Academic() {
  return (
    <>
      <PageHeading
        eyebrow="ACADEMIC PERFORMANCE"
        title="Academic Performance"
        description="Analyze academic results across subjects and classes."
      />

      <div className="kpi-grid">

        <MetricCard
          icon="🎓"
          label="Average Score"
          value="87.4%"
          change="+8.4%"
        />

        <MetricCard
          icon="📈"
          label="Pass Rate"
          value="96.2%"
          change="+4.1%"
        />

        <MetricCard
          icon="🏆"
          label="Top Subject"
          value="Maths"
          change="91%"
        />

        <MetricCard
          icon="⭐"
          label="Improvement"
          value="+8.4%"
          change="This Term"
        />

      </div>

      <div className="two-column">

        <AcademicCard />

        <div className="card">
          <CardHeader
            label="SUBJECT ANALYSIS"
            title="Subject Performance"
            icon="📚"
          />

          {[
            ["Mathematics", 91],
            ["Science", 88],
            ["English", 86],
            ["Social Studies", 84],
            ["Hindi", 82],
          ].map(([name, score]) => (
            <div className="subject" key={name}>
              <div className="subject-top">
                <span>{name}</span>
                <strong>{score}%</strong>
              </div>

              <div className="progress">
                <div style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}

        </div>

      </div>
    </>
  );
}


/* =====================================================
   CLASS ANALYTICS
===================================================== */

function ClassAnalytics() {
  const classes = [
    ["Class 10", "126 students", "92%"],
    ["Class 9", "138 students", "89%"],
    ["Class 8", "142 students", "86%"],
    ["Class 7", "151 students", "84%"],
    ["Class 6", "148 students", "82%"],
  ];

  return (
    <>
      <PageHeading
        eyebrow="CLASS ANALYTICS"
        title="Class Analytics"
        description="Compare class-wise academic and attendance performance."
      />

      <div className="kpi-grid">

        <MetricCard
          icon="🏫"
          label="Active Classes"
          value="32"
          change="+2"
        />

        <MetricCard
          icon="🎓"
          label="Top Class"
          value="Class 10"
          change="92%"
        />

        <MetricCard
          icon="📊"
          label="Average Score"
          value="87.4%"
          change="+8.4%"
        />

        <MetricCard
          icon="📚"
          label="Students"
          value="1,248"
          change="+5.2%"
        />

      </div>

      <div className="card">

        <CardHeader
          label="CLASS PERFORMANCE"
          title="Class-wise Performance"
          icon="▤"
        />

        {classes.map((item) => (
          <div className="class-row" key={item[0]}>

            <div className="class-avatar">
              {item[0].replace("Class ", "")}
            </div>

            <div className="class-info">
              <strong>{item[0]}</strong>
              <span>{item[1]}</span>
            </div>

            <div className="class-score">
              <strong>{item[2]}</strong>

              <div className="progress">
                <div
                  style={{
                    width: item[2],
                  }}
                />
              </div>
            </div>

          </div>
        ))}

      </div>
    </>
  );
}


/* =====================================================
   TEACHER INSIGHTS
===================================================== */

function TeacherInsights() {
  const teachers = [
    ["Primary Section", "92%"],
    ["Secondary Section", "87%"],
    ["High School Section", "84%"],
    ["Activity Teachers", "90%"],
  ];

  return (
    <>
      <PageHeading
        eyebrow="TEACHER INSIGHTS"
        title="Teacher Performance"
        description="Monitor teaching performance and identify improvement opportunities."
      />

      <div className="kpi-grid">

        <MetricCard
          icon="👨‍🏫"
          label="Total Teachers"
          value="68"
          change="+2"
        />

        <MetricCard
          icon="⭐"
          label="Average Score"
          value="89.2%"
          change="+5.4%"
        />

        <MetricCard
          icon="📚"
          label="Assignments"
          value="94%"
          change="Completed"
        />

        <MetricCard
          icon="📈"
          label="Improvement"
          value="+6.8%"
          change="This Term"
        />

      </div>

      <div className="card">

        <CardHeader
          label="TEACHING PERFORMANCE"
          title="Section-wise Teacher Insights"
          icon="♙"
        />

        {teachers.map((teacher) => (
          <div
            className="teacher-row"
            key={teacher[0]}
          >

            <div className="teacher-avatar">
              👨‍🏫
            </div>

            <div className="teacher-info">
              <strong>{teacher[0]}</strong>
              <span>Performance Score</span>
            </div>

            <div className="teacher-score">
              <strong>{teacher[1]}</strong>

              <div className="progress">
                <div
                  style={{
                    width: teacher[1],
                  }}
                />
              </div>
            </div>

          </div>
        ))}

      </div>
    </>
  );
}


/* =====================================================
   ALERTS
===================================================== */

function Alerts() {
  return (
    <>
      <PageHeading
        eyebrow="ALERTS"
        title="School Alerts & Notifications"
        description="Review important attendance, academic and operational alerts."
      />

      <div className="kpi-grid">

        <MetricCard
          icon="🔔"
          label="Total Alerts"
          value="12"
          change="Today"
        />

        <MetricCard
          icon="⚠️"
          label="High Priority"
          value="3"
          change="Needs Action"
        />

        <MetricCard
          icon="📚"
          label="Academic Alerts"
          value="4"
          change="Review"
        />

        <MetricCard
          icon="◷"
          label="Attendance Alerts"
          value="5"
          change="Review"
        />

      </div>

      <div className="card">
        <AlertsCard />
      </div>
    </>
  );
}


/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}


function KPIGrid() {
  return (
    <div className="kpi-grid">

      {kpis.map((kpi) => (
        <div className="kpi-card" key={kpi[1]}>

          <div className="kpi-top">

            <div className="kpi-icon">
              {kpi[0]}
            </div>

            <span className="positive">
              {kpi[3]}
            </span>

          </div>

          <span className="kpi-label">
            {kpi[1]}
          </span>

          <strong className="kpi-value">
            {kpi[2]}
          </strong>

        </div>
      ))}

    </div>
  );
}


function MetricCard({
  icon,
  label,
  value,
  change,
}: {
  icon: string;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="kpi-card">

      <div className="kpi-top">

        <div className="kpi-icon">
          {icon}
        </div>

        <span className="positive">
          {change}
        </span>

      </div>

      <span className="kpi-label">
        {label}
      </span>

      <strong className="kpi-value">
        {value}
      </strong>

    </div>
  );
}


function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}


function CardHeader({
  label,
  title,
  icon,
}: {
  label: string;
  title: string;
  icon: string;
}) {
  return (
    <div className="card-header">

      <div>
        <span className="section-label">
          {label}
        </span>

        <h2>{title}</h2>
      </div>

      <span className="card-icon">
        {icon}
      </span>

    </div>
  );
}


/* =====================================================
   DASHBOARD CARDS
===================================================== */

function AttendanceCard() {
  return (
    <div className="card">

      <CardHeader
        label="ATTENDANCE OVERVIEW"
        title="Student Attendance"
        icon="◷"
      />

      <div className="attendance-main">

        <div className="attendance-circle">
          <strong>94.6%</strong>
          <span>Overall</span>
        </div>

        <div className="attendance-stats">

          <div>
            <strong>1,181</strong>
            <span>Present Today</span>
          </div>

          <div>
            <strong>67</strong>
            <span>Absent Today</span>
          </div>

        </div>

      </div>

      <div className="bars">

        {[91, 95, 93, 97, 96].map(
          (value, index) => (
            <div
              className="bar-item"
              key={index}
            >
              <div className="bar">
                <div
                  style={{
                    height: `${value}%`,
                  }}
                />
              </div>

              <span>
                {["Mon", "Tue", "Wed", "Thu", "Fri"][index]}
              </span>
            </div>
          )
        )}

      </div>

    </div>
  );
}


function AcademicCard() {
  return (
    <div className="card">

      <CardHeader
        label="ACADEMIC PERFORMANCE"
        title="Academic Progress"
        icon="◈"
      />

      <div className="score-box">

        <div>
          <span>Average School Score</span>
          <strong>87.4%</strong>
        </div>

        <span className="score-up">
          ↑ 8.4%
        </span>

      </div>

      {[
        ["Mathematics", 91],
        ["Science", 88],
        ["English", 86],
        ["Social Studies", 84],
      ].map(([subject, score]) => (
        <div className="subject" key={subject}>

          <div className="subject-top">
            <span>{subject}</span>
            <strong>{score}%</strong>
          </div>

          <div className="progress">
            <div
              style={{
                width: `${score}%`,
              }}
            />
          </div>

        </div>
      ))}

    </div>
  );
}


function ClassCard() {
  return (
    <div className="card">

      <CardHeader
        label="CLASS ANALYTICS"
        title="Class Performance"
        icon="▤"
      />

      {[
        ["Class 10", "126 students", "92%"],
        ["Class 9", "138 students", "89%"],
        ["Class 8", "142 students", "86%"],
        ["Class 7", "151 students", "84%"],
      ].map((item) => (
        <div
          className="class-row"
          key={item[0]}
        >

          <div className="class-avatar">
            {item[0].replace("Class ", "")}
          </div>

          <div className="class-info">
            <strong>{item[0]}</strong>
            <span>{item[1]}</span>
          </div>

          <div className="class-score">
            <strong>{item[2]}</strong>

            <div className="progress">
              <div
                style={{
                  width: item[2],
                }}
              />
            </div>
          </div>

        </div>
      ))}

    </div>
  );
}


function InsightsCard() {
  return (
    <div className="card">

      <CardHeader
        label="SCHOOL INSIGHTS"
        title="Performance Summary"
        icon="✦"
      />

      <p className="insight">
        Overall school performance is improving
        steadily across academic and attendance
        indicators.
      </p>

      <div className="highlight">
        <strong>+8.4%</strong>
        <span>Improvement this term</span>
      </div>

      <div className="summary-row">
        <span>Attendance</span>
        <strong>Excellent</strong>
      </div>

      <div className="summary-row">
        <span>Academic Growth</span>
        <strong>Very Good</strong>
      </div>

      <div className="summary-row">
        <span>Teacher Performance</span>
        <strong>Strong</strong>
      </div>

    </div>
  );
}


function TeacherCard() {
  return (
    <div className="card">

      <CardHeader
        label="TEACHER INSIGHTS"
        title="Teaching Performance"
        icon="♙"
      />

      {[
        ["Primary Section", "92%"],
        ["Secondary Section", "87%"],
        ["High School Section", "84%"],
      ].map((teacher) => (
        <div
          className="teacher-row"
          key={teacher[0]}
        >

          <div className="teacher-avatar">
            👨‍🏫
          </div>

          <div className="teacher-info">
            <strong>{teacher[0]}</strong>
            <span>Performance Score</span>
          </div>

          <div className="teacher-score">
            <strong>{teacher[1]}</strong>

            <div className="progress">
              <div
                style={{
                  width: teacher[1],
                }}
              />
            </div>
          </div>

        </div>
      ))}

    </div>
  );
}


function AlertsCard() {
  return (
    <div>

      <CardHeader
        label="ALERTS"
        title="Important Notifications"
        icon="⚠"
      />

      {[
        [
          "orange",
          "Attendance Review",
          "3 classes require attendance review.",
          "10m",
        ],
        [
          "red",
          "Academic Alert",
          "Class 7 performance needs attention.",
          "1h",
        ],
        [
          "green",
          "Monthly Report Ready",
          "School performance report is available.",
          "2h",
        ],
      ].map((alert) => (
        <div className="alert-row" key={alert[1]}>

          <span
            className={`alert-dot ${alert[0]}`}
          />

          <div className="alert-content">
            <strong>{alert[1]}</strong>
            <p>{alert[2]}</p>
          </div>

          <span className="alert-time">
            {alert[3]}
          </span>

        </div>
      ))}

    </div>
  );
}