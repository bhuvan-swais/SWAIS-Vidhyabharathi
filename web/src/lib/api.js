"use client";

/**
 * ============================================================
 * API Integration Layer — VidhyaBharathi Acharya Module
 * ============================================================
 * All calls go to the FastAPI backend at NEXT_PUBLIC_API_BASE_URL.
 * JWT token and x-school-id are injected for multi-tenant isolation.
 * ============================================================
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || "/";

const TOKEN_KEY = "vb_acharya_token";
const AUTH_KEY = "vb_acharya_auth";
const SCHOOL_KEY = "vb_school_id";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  return token && token !== "undefined" ? token : null;
}

function getSchoolId() {
  if (typeof window === "undefined") return null;
  const schoolId = localStorage.getItem(SCHOOL_KEY);
  return schoolId && schoolId !== "undefined" ? schoolId : null;
}

async function request(path, options = {}) {
  const token = getToken();
  const schoolId = getSchoolId();
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(schoolId ? { "x-school-id": schoolId } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401 && !path.includes("/auth/login")) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(SCHOOL_KEY);
      if (typeof window !== "undefined") {
        window.location.href = LOGIN_URL;
      }
    }
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginTeacher(email, password) {
  try {
    const data = await request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // FIX: Save both the Token AND the School ID to local storage
    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.school_id) {
      localStorage.setItem(SCHOOL_KEY, data.school_id);
    }

    const user = {
      id: `T${String(data.teacher_id).padStart(3, "0")}`,
      teacher_id: data.teacher_id,
      school_id: data.school_id, 
      name: data.name,
      email: data.email,
      avatar: data.avatar_initials || data.name.slice(0, 2).toUpperCase(),
      subject: data.subject,
      class: data.class_assigned,
      section: data.section,
      school: data.school_name,
      totalStudents: data.total_students ?? null,
    };

    return { success: true, user };
  } catch (err) {
    if (err.status) {
      return { success: false, error: err.message || "Invalid email or password." };
    }
    return { success: false, error: "Unable to reach the server. Please try again." };
  }
}

export async function fetchMe() {
  try {
    const data = await request("/api/v1/auth/me");
    return {
      id: `T${String(data.teacher_id).padStart(3, "0")}`,
      teacher_id: data.teacher_id,
      school_id: data.school_id,
      name: data.name,
      email: data.email,
      avatar: data.avatar_initials || data.name.slice(0, 2).toUpperCase(),
      subject: data.subject,
      class: data.class_assigned,
      section: data.section,
      school: data.school_name,
      totalStudents: data.total_students ?? null,
    };
  } catch {
    return null;
  }
}

export async function logoutTeacher() {
  try {
    await request("/api/v1/auth/logout", { method: "POST" });
  } catch {
    /* ignore server errors on logout */
  } finally {
    // FIX: Clear all session variables completely on logout
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(SCHOOL_KEY);
  }
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function fetchNotes() {
  const data = await request("/api/v1/notes");
  return data.notes; 
}

export async function createNote(noteData) {
  return request("/api/v1/notes", {
    method: "POST",
    body: JSON.stringify({
      title: noteData.title,
      content: noteData.content || null,
      chapter: noteData.chapter,
      content_type: noteData.contentType || "typed",
      canvas_image_url: noteData.canvasImageUrl || null,
      tags: noteData.tags || [],
    }),
  });
}

export async function updateNote(id, updates) {
  const numericId = String(id).replace(/^N/, "");
  return request(`/api/v1/notes/${numericId}`, {
    method: "PUT",
    body: JSON.stringify({
      title: updates.title,
      content: updates.content,
      chapter: updates.chapter,
      content_type: updates.contentType,
      canvas_image_url: updates.canvasImageUrl,
      tags: updates.tags,
    }),
  });
}

export async function deleteNote(id) {
  const numericId = String(id).replace(/^N/, "");
  await request(`/api/v1/notes/${numericId}`, { method: "DELETE" });
  return { success: true };
}

// ── Chapters ──────────────────────────────────────────────────────────────────

export async function fetchChapters() {
  const data = await request("/api/v1/chapters");
  return data.chapters;
}

export async function fetchChapterDetail(chapterId) {
  return request(`/api/v1/chapters/${chapterId}`);
}

// ── Classes / subjects (cascading selection) ─────────────────────────────────

export async function fetchClasses() {
  const data = await request("/api/v1/classes");
  return data.classes;
}

export async function fetchSubjects(classId) {
  const qs = classId ? `?class_id=${classId}` : "";
  const data = await request(`/api/v1/subjects${qs}`);
  return data.subjects;
}

export async function fetchChaptersBySubject(subjectId) {
  const data = await request(`/api/v1/chapters?subject_id=${subjectId}`);
  return data.chapters;
}

// ── Chapter study material (PDFs) ────────────────────────────────────────────

export async function fetchChapterFiles(chapterId) {
  const data = await request(`/api/v1/chapters/${chapterId}/files`);
  return data.files;
}

async function uploadRequest(path, file, method = "POST") {
  const token = getToken();
  const schoolId = getSchoolId();
  const body = new FormData();
  body.append("file", file);
  
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(schoolId ? { "x-school-id": schoolId } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const b = await res.json();
      detail = b.detail || detail;
    } catch { /* ignore */ }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export async function uploadChapterFile(chapterId, file) {
  return uploadRequest(`/api/v1/chapters/${chapterId}/files`, file, "POST");
}

export async function replaceChapterFile(fileId, file) {
  return uploadRequest(`/api/v1/chapters/files/${fileId}`, file, "PUT");
}

export async function deleteChapterFile(fileId) {
  return request(`/api/v1/chapters/files/${fileId}`, { method: "DELETE" });
}

export async function fetchTeacherProfile() {
  return null;
}