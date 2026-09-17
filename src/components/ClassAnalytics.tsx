"use client";

import {
  BarChart3,
  Users,
  ArrowUpRight,
} from "lucide-react";

const classes = [
  {
    name: "Class 10",
    students: 142,
    performance: 92,
  },
  {
    name: "Class 9",
    students: 156,
    performance: 89,
  },
  {
    name: "Class 8",
    students: 164,
    performance: 86,
  },
  {
    name: "Class 7",
    students: 171,
    performance: 84,
  },
];

export default function ClassAnalytics() {
  return (
    <div className="dashboard-card class-card">

      <div className="dashboard-card-header">

        <div className="dashboard-card-title">

          <div className="small-card-icon">
            <BarChart3 size={17} />
          </div>

          <div>
            <span>CLASS PERFORMANCE</span>
            <h3>Class Analytics</h3>
          </div>

        </div>

        <button className="mini-link">
          View all →
        </button>

      </div>


      <div className="class-list">

        {classes.map((item) => (

          <div
            className="class-row"
            key={item.name}
          >

            <div className="class-info">

              <div className="class-avatar">
                {item.name.replace("Class ", "")}
              </div>

              <div>
                <strong>{item.name}</strong>

                <span>
                  <Users size={10} />
                  {item.students} students
                </span>
              </div>

            </div>


            <div className="class-score">

              <strong>
                {item.performance}%
              </strong>

              <div className="mini-progress">
                <div
                  style={{
                    width: `${item.performance}%`,
                  }}
                />
              </div>

            </div>


            <ArrowUpRight
              size={15}
              className="class-arrow"
            />

          </div>

        ))}

      </div>

    </div>
  );
}