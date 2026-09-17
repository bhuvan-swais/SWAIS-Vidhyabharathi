"use client";

import {
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

const attendanceData = [
  { day: "Mon", value: 94 },
  { day: "Tue", value: 97 },
  { day: "Wed", value: 92 },
  { day: "Thu", value: 96 },
  { day: "Fri", value: 95 },
  { day: "Sat", value: 89 },
];

export default function AttendanceOverview() {
  return (
    <div className="dashboard-card attendance-card">

      <div className="dashboard-card-header">

        <div className="dashboard-card-title">

          <div className="small-card-icon">
            <CalendarCheck size={17} />
          </div>

          <div>
            <span>THIS WEEK</span>
            <h3>Attendance Overview</h3>
          </div>

        </div>

        <div className="trend">
          <TrendingUp size={13} />
          2.4%
        </div>

      </div>


      <div className="attendance-summary">

        <div>
          <strong>94.6%</strong>
          <span>Average attendance</span>
        </div>

        <div className="attendance-present">
          <b>1,181</b>
          <span>Present today</span>
        </div>

      </div>


      <div className="attendance-chart">

        {attendanceData.map((item) => (
          <div
            className="attendance-bar-wrapper"
            key={item.day}
          >

            <div className="attendance-value">
              {item.value}%
            </div>

            <div className="attendance-bar-background">

              <div
                className="attendance-bar"
                style={{
                  height: `${item.value}%`,
                }}
              />

            </div>

            <span>{item.day}</span>

          </div>
        ))}

      </div>

    </div>
  );
}