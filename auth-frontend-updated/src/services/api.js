const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = globalThis.crypto?.randomUUID?.() ||
      `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

export function getStoredAccessToken() {
  return getAccessToken();
}

export function saveAuthTokens({ accessToken, refreshToken }) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function parseResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await parseResponse(response);

  if (!response.ok || !data?.accessToken || !data?.refreshToken) {
    clearAuth();
    return false;
  }

  saveAuthTokens(data);
  return true;
}

async function request(
  endpoint,
  { method = "POST", body, token, headers: customHeaders = {}, isFormData = false, retry = true } = {}
) {
  const headers = { ...customHeaders };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const accessToken = token || getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body == null
      ? undefined
      : isFormData
        ? body
        : JSON.stringify(body),
  });

  if (response.status === 401 && retry && !endpoint.includes("/auth/")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(endpoint, {
        method,
        body,
        token: getAccessToken(),
        headers: customHeaders,
        isFormData,
        retry: false,
      });
    }

    clearAuth();
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

// -------------------- Authentication --------------------

export function signup({ username, email, password }) {
  return request("/auth/signup", {
    body: { name: username, email, password },
  });
}

export function login({ email, password }) {
  return request("/auth/login", {
    body: { email, password },
  });
}

export function verifySignupOtp({ email, otp }) {
  return request("/auth/verify-signup", {
    body: { email, otp },
  });
}

export function verifyLoginOtp({ email, otp }) {
  return request("/auth/verify-login", {
    body: { email, otp },
    headers: {
      "X-Device-Id": getDeviceId(),
      "X-Device-Name": "Web Browser",
      "X-Platform": "WEB",
    },
  });
}

export function logout() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuth();
    return Promise.resolve(null);
  }

  return request("/auth/logout", {
    body: { refreshToken },
  }).finally(clearAuth);
}

// -------------------- User --------------------

export function getCurrentUser() {
  return request("/user/me", { method: "GET" });
}

export function getDevices() {
  return request("/user/devices", { method: "GET" });
}

export function revokeDevice(deviceId) {
  return request(`/user/devices/${deviceId}`, { method: "DELETE" });
}

// -------------------- Documents --------------------

export function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  return request("/documents/upload", {
    body: formData,
    method: "POST",
    isFormData: true,
  });
}

export function getDocuments() {
  return request("/documents", { method: "GET" });
}

export async function downloadDocument(id) {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (response.status === 401 && await refreshAccessToken()) {
    return downloadDocument(id);
  }

  if (!response.ok) {
    const data = await parseResponse(response);
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return response.blob();
}

export function deleteDocument(id) {
  return request(`/documents/${id}`, { method: "DELETE" });
}

// -------------------- AI jobs --------------------

export function createAIJob({ documentId = null, taskType = "CHAT", prompt }) {
  return request("/ai/jobs", {
    body: { documentId, taskType, prompt },
  });
}

export function getAIJobs() {
  return request("/ai/jobs", { method: "GET" });
}

export function getAIJob(id) {
  return request(`/ai/jobs/${id}`, { method: "GET" });
}

// Kept for compatibility with the existing ChatContext.
// The backend does not expose /chat/message; chat is represented by AI jobs.
export function sendChatMessage({ text }) {
  return createAIJob({
    taskType: "CHAT",
    prompt: text,
  });
}
