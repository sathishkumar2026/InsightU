const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ---------- token helpers ----------
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("insightu_token");
}

export function setToken(token) {
  localStorage.setItem("insightu_token", token);
}

export function clearToken() {
  localStorage.removeItem("insightu_token");
}

// ---------- user cache ----------
export function getCachedUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("insightu_user");
  return raw ? JSON.parse(raw) : null;
}

export function setCachedUser(user) {
  localStorage.setItem("insightu_user", JSON.stringify(user));
}

export function clearCachedUser() {
  localStorage.removeItem("insightu_user");
}

// ---------- api helpers ----------
export async function apiLogin(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json(); // { access_token, token_type }
}

export async function apiSignup(name, email, password, role = "student", setupKey = null) {
  const body = { name, email, password, role };
  if (setupKey) body.setup_key = setupKey;
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Signup failed");
  }
  return res.json();
}

export async function apiGet(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      clearCachedUser();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function apiPost(path, body = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      clearCachedUser();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function getCurrentUser() {
  return apiGet("/users/me");
}

export async function apiUploadCSV(path, file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      clearCachedUser();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export function logout() {
  clearToken();
  clearCachedUser();
  if (typeof window !== "undefined") window.location.href = "/login";
}

export async function apiPut(path, body = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      clearCachedUser();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function apiUploadMaterial(file, subject, title, description = "") {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  form.append("subject", subject);
  form.append("title", title);
  form.append("description", description);
  const res = await fetch(`${API_BASE}/materials/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      clearCachedUser();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function apiDelete(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      clearCachedUser();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Delete failed");
  }
  return res.json();
}
