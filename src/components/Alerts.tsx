"use client";

import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const alerts = [
  {
    type: "warning",
    title: "Attendance below target",
    description: "Class 7 attendance dropped below 90%.",
    time: "15 min ago",
  },
  {
    type: "info",
    title: "Academic report ready",
    description: "Term 2 academic performance report is ready.",
    time: "1 hour ago",
  },
  {
    type: "success",
    title: "Teacher review completed",
    description: "Monthly teacher performance review completed.",
    time: "2 hours ago",
  },
];

export default function Alerts() {
  return (
    <div className="dashboard-card">

      <div className="dashboard-card-header">

        <div className="dashboard-card-title">

          <div className="small-card-icon">
            <Bell size={17} />
          </div>

          <div>
            <span>ATTENTION REQUIRED</span>
            <h3>Alerts &amp; Notifications</h3>
          </div>

        </div>

        <span className="alerts-count">
          3
        </span>

      </div>

      <div className="alerts-list">

        {alerts.map((alert) => {

          const Icon =
            alert.type === "warning"
              ? AlertTriangle
              : alert.type === "success"
                ? CheckCircle2
                : Info;

          return (
            <div
              className="alert-row"
              key={alert.title}
            >

              <div
                className={`alert-icon ${alert.type}`}
              >
                <Icon size={15} />
              </div>

              <div className="alert-content">

                <strong>
                  {alert.title}
                </strong>

                <p>
                  {alert.description}
                </p>

                <span>
                  {alert.time}
                </span>

              </div>

              <ArrowRight
                size={14}
                className="alert-arrow"
              />

            </div>
          );
        })}

      </div>

      <button className="all-alerts-button">
        View all alerts
      </button>

    </div>
  );
}