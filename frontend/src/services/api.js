const API_URL = import.meta.env.VITE_API_URL || 'https://smart-daily-life.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Global response handler
 * Now compatible with Senior Review standardized backend: { success: true, data: ... }
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (response.status === 401) {
    // If not on auth page, redirect or clear
    if (!window.location.pathname.startsWith('/auth')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
  }
  
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }

  // Standardized backend returns actual payload in .data
  return data.data !== undefined ? data.data : data;
};

// --- AUTH API ---
export const signupUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return handleResponse(response);
};

export const checkEmail = async (email) => {
  const response = await fetch(`${API_URL}/auth/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(response);
};

export const forgotPasswordAPI = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(response);
};

export const verifyOtpAPI = async (email, otp) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return handleResponse(response);
};

export const resetPasswordAPI = async (email, otp, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  return handleResponse(response);
};

export const forgotUsernameAPI = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-username`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(response);
};

export const getProfile = async () => {
  const response = await fetch(`${API_URL}/auth/profile`, { headers: getHeaders() });
  return handleResponse(response);
};

export const updateProfilePic = async (formData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/auth/profile-pic`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: We DO NOT set 'Content-Type': 'multipart/form-data' manually.
      // The browser will set it automatically with the correct boundary when passing FormData.
    },
    body: formData
  });
  return handleResponse(response);
};

// --- TASKS API ---
export const fetchTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`, { headers: getHeaders() });
  return handleResponse(response);
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
};

export const updateTask = async (id, updates) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse(response);
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

// --- HABITS API ---
export const fetchHabits = async () => {
  const response = await fetch(`${API_URL}/habits`, { headers: getHeaders() });
  return handleResponse(response);
};

export const createHabit = async (habitData) => {
  const response = await fetch(`${API_URL}/habits`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(habitData)
  });
  return handleResponse(response);
};

export const updateHabit = async (id, updates) => {
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse(response);
};

export const deleteHabit = async (id) => {
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

// --- HEALTH API ---
export const fetchHealthData = async (dateStr) => {
  const response = await fetch(`${API_URL}/health/${dateStr}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const saveHealthData = async (dateStr, data) => {
  const response = await fetch(`${API_URL}/health/${dateStr}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

// --- NOTES API ---
export const fetchNotes = async () => {
  const response = await fetch(`${API_URL}/notes`, { headers: getHeaders() });
  return handleResponse(response);
};

export const createNote = async (noteData) => {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(noteData)
  });
  return handleResponse(response);
};

export const updateNote = async (id, noteData) => {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(noteData)
  });
  return handleResponse(response);
};

export const deleteNote = async (id) => {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

// --- GOALS API ---
export const fetchGoals = async () => {
  const response = await fetch(`${API_URL}/goals`, { headers: getHeaders() });
  return handleResponse(response);
};

export const createGoal = async (goalData) => {
  const response = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(goalData)
  });
  return handleResponse(response);
};

export const updateGoal = async (id, updates) => {
  const response = await fetch(`${API_URL}/goals/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse(response);
};

export const deleteGoal = async (id) => {
  const response = await fetch(`${API_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

// --- AI API ---
export const askAI = async (query, contextData) => {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ query, data: contextData })
  });
  return handleResponse(response);
};

export const getFinancialAdvice = async () => {
  const response = await fetch(`${API_URL}/ai/financial-advice`, {
    method: 'POST',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const getDashboardSummary = async (data) => {
  const response = await fetch(`${API_URL}/ai/dashboard-summary`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ data })
  });
  return handleResponse(response);
};
