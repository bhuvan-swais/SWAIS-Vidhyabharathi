"use client";

import {
  GraduationCap,
  TrendingUp,
} from "lucide-react";

const subjects = [
  {
    subject: "Mathematics",
    score: 91,
  },
  {
    subject: "Science",
    score: 88,
  },
  {
    subject: "English",
    score: 86,
  },
  {
    subject: "Social Studies",
    score: 84,
  },
  {
    subject: "Hindi",
    score: 89,
  },
];

export default function AcademicPerformance() {
  return (
    <div className="dashboard-card academic-card">

      <div className="dashboard-card-header">

        <div className="dashboard-card-title">

          <div className="small-card-icon">
            <GraduationCap size={17} />
          </div>

          <div>
            <span>ACADEMIC OVERVIEW</span>
            <h3>Academic Performance</h3>
          </div>

        </div>

        <div className="trend">
          <TrendingUp size={13} />
          4.8%
        </div>

      </div>

      <div className="academic-average">

        <div>
          <strong>87.8%</strong>
          <span>Overall average score</span>
        </div>

        <div className="academic-term">
          <span>Current Term</span>
          <b>Term 2</b>
        </div>

      </div>

      <div className="subject-list">

        {subjects.map((item) => (

          <div
            className="subject-row"
            key={item.subject}
          >

            <div className="subject-name">
              <span>{item.subject}</span>
              <b>{item.score}%</b>
            </div>

            <div className="subject-progress">

              <div
                className="subject-progress-fill"
                style={{
                  width: `${item.score}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}