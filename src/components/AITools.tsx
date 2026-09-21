"use client";

import {
  X,
  ClipboardList,
  UserCheck,
  BarChart3,
  Sparkles,
} from "lucide-react";

interface AIToolsProps {
  onClose: () => void;
}

const tools = [
  {
    title: "Assignment Report",
    description: "Generate assignment insights",
    icon: ClipboardList,
  },
  {
    title: "Teacher Performance",
    description: "Analyze teacher performance",
    icon: UserCheck,
  },
  {
    title: "Academic Analytics",
    description: "Get academic insights",
    icon: BarChart3,
  },
];

export default function AITools({
  onClose,
}: AIToolsProps) {
  return (
    <div className="ai-overlay">

      <div className="ai-panel">

        <div className="ai-panel-header">

          <div className="ai-heading">

            <div className="ai-icon">
              <Sparkles size={19} />
            </div>

            <div>
              <h2>AI Tools</h2>
              <p>Smart insights for your school</p>
            </div>

          </div>

          <button
            className="ai-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>

        </div>


        <div className="ai-tools-list">

          {tools.map((tool) => {

            const Icon = tool.icon;

            return (
              <button
                className="ai-tool-card"
                key={tool.title}
              >

                <div className="ai-tool-icon">
                  <Icon size={20} />
                </div>

                <div className="ai-tool-content">
                  <strong>{tool.title}</strong>
                  <span>{tool.description}</span>
                </div>

              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
}