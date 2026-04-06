const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); 
  }
  
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.action = data.action; // Attach action hint if present
    throw error;
  }
  return data;
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

// --- AI API ---
export const askAI = async (query, contextData) => {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ query, data: contextData })
  });
  return handleResponse(response);
};
