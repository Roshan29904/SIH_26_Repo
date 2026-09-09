
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


async function request(endpoint, { method = "POST", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Backend is expected to send { message: "..." } on errors.
    const message = data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}



export function signup({ username, email, password, phone }) {
  return request("/auth/signup", {
    body: { username, email, password, phone },
  });
}

export function login({ email, password }) {
  return request("/auth/login", {
    body: { email, password },
  });
}

export function verifyOtp({ email, otp }) {
  return request("/auth/verify-otp", {
    body: { email, otp },
  });
}

export function resendOtp({ email }) {
  return request("/auth/resend-otp", {
    body: { email },
  });
}

// THIS NEED NEED TO CHANGE AFTER INTRODUCING BACKEND TO SEND REAL IDS AND TEXT
export function sendChatMessage({ conversationId, text }) {
  return request("/chat/message", {
    body: { conversationId, text },
  });
}


// for gpu and memory usage from the backend
export function getSystemStats() {
  return request("/system/stats", {
    method: "GET",
  });
}
