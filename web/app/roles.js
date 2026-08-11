// Single source of truth for the five roles — used by the login role picker
// and (later) each dashboard header. Paths match the scaffold's app routes.
export const ROLES = [
  { path: "/vidyarthi", sk: "विद्यार्थी",  en: "Vidyarthi — Student" },
  { path: "/acharya",   sk: "आचार्य",      en: "Acharya — Teacher" },
  { path: "/palaka",    sk: "पालक",        en: "Palaka — Parent" },
  { path: "/pradhana",  sk: "प्रधानाचार्य", en: "Pradhana Acharya — Principal" },
  { path: "/nyasa",     sk: "न्यास",        en: "Nyasa — Trust / Network" },
];

export const roleByPath = (path) => ROLES.find((r) => r.path === path);
