import axios from 'axios';
import useAuthStore from '../store/authStore';

// const API_URL = "https://intelliquiz-backend-4bha.onrender.com/api";
const API_URL = "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, updateTokens, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          updateTokens(newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.post('/user/change-password', data),
  deleteAccount: (data) => api.delete('/user/account', { data }),
};

export const fileAPI = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  getUserFiles: (params) => api.get('/files', { params }),
  getFileById: (fileId) => api.get(`/files/${fileId}`),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  getFileStats: () => api.get('/files/stats'),
};

export const quizAPI = {
  // Create quiz manually
  createQuiz: (data) => api.post('/quizzes/create', data),
  
  // Generate quiz with AI
  generateQuizAI: (data) => api.post('/quizzes/generate-ai', data),
  
  // Save AI generated quiz
  saveGeneratedQuiz: (data) => api.post('/quizzes/save-generated', data),
  
  // Get all quizzes
  getAllQuizzes: () => api.get('/quizzes'),
  
  // Get quiz by ID
  getQuizById: (quizId) => api.get(`/quizzes/${quizId}`),
  
  // Update quiz
  updateQuiz: (quizId, data) => api.put(`/quizzes/${quizId}`, data),
  
  // Delete quiz
  deleteQuiz: (quizId) => api.delete(`/quizzes/${quizId}`),

  // Publish/Unpublish quiz
  publishQuiz: (quizId) => api.patch(`/quizzes/${quizId}/publish`),

  // Group publishing
  publishToGroups: (data) => api.post('/quizzes/publish-to-groups', data),
  getPublishedQuizzesForUser: () => api.get('/quizzes/published-for-user'),
  getQuizGroups: (quizId) => api.get(`/quizzes/${quizId}/groups`),
  removeQuizFromGroup: (quizId, groupId) => api.delete(`/quizzes/${quizId}/groups/${groupId}`),

  // Scheduled publishing
  getScheduledQuizzes: () => api.get('/quizzes/scheduled'),
  cancelScheduledPublishing: (quizId, groupId) => api.delete(`/quizzes/${quizId}/groups/${groupId}/scheduled`),

  // Question bank
  getQuestionBank: (params) => api.get('/quizzes/questions/bank', { params }),
};

// Group Management API (Teachers)
export const groupAPI = {
  createGroup: (data) => api.post('/groups', data),
  getGroups: () => api.get('/groups'),
  searchUsers: (query) => api.get('/groups/search-users', { params: { query } }),
  addStudents: (data) => api.post('/groups/add-students', data),
  getGroupMembers: (groupId) => api.get(`/groups/${groupId}/members`),
  removeStudent: (groupId, userId) => api.delete(`/groups/${groupId}/students/${userId}`),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
};

// User Groups API (Students)
export const userGroupsAPI = {
  acceptInvitation: (groupId) => api.post(`/user/groups/${groupId}/accept`),
  rejectInvitation: (groupId) => api.post(`/user/groups/${groupId}/reject`),
  getUserGroups: () => api.get('/user/groups'),
};

// Quiz Response API
export const quizResponseAPI = {
  // Submit quiz response
  submitQuiz: (data) => api.post('/quiz-responses/submit', data),
  
  // Get user's quiz responses
  getMyResponses: (params) => api.get('/quiz-responses/my-responses', { params }),
  
  // Get specific quiz response
  getResponseById: (responseId) => api.get(`/quiz-responses/${responseId}`),
  
  // Generate AI insights
  generateInsights: (responseId) => api.post(`/quiz-responses/${responseId}/generate-insights`),
  
  // Get AI insights
  getInsights: (responseId) => api.get(`/quiz-responses/${responseId}/insights`),
  
  // Get user analytics
  getMyAnalytics: () => api.get('/quiz-responses/my-analytics'),
  
  // Get quiz responses (Teacher)
  getQuizResponses: (quizId, params) => api.get(`/quiz-responses/quiz/${quizId}`, { params }),
  
  // Delete quiz response
  deleteResponse: (responseId) => api.delete(`/quiz-responses/${responseId}`),
};

// Leaderboard API
export const leaderboardAPI = {
  // Get quiz leaderboard - Returns leaderboard for a specific quiz
  getQuizLeaderboard: (quizId) => {
    console.log(`[leaderboardAPI] Calling GET /leaderboard/quiz/${quizId}`);
    return api.get(`/leaderboard/quiz/${quizId}`);
  },
  
  // Get group leaderboard - Returns aggregated leaderboard for a group
  getGroupLeaderboard: (groupId) => {
    console.log(`[leaderboardAPI] Calling GET /leaderboard/group/${groupId}`);
    return api.get(`/leaderboard/group/${groupId}`);
  },
  
  // Get recent submissions - Returns recent quiz submissions across all quizzes
  getRecentSubmissions: (limit = 20) => {
    console.log(`[leaderboardAPI] Calling GET /leaderboard/recent?limit=${limit}`);
    return api.get('/leaderboard/recent', { 
      params: { limit } 
    });
  },
};

// Admin API
export const adminAPI = {
  // User Management
  getAllUsers: () => api.get('/admin/users'),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  updateUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  createAdminUser: (data) => api.post('/admin/users', data),
  
  // System Monitoring
  getSystemStats: () => api.get('/admin/stats'),
  
  // Content Oversight
  getAllQuizzes: () => api.get('/admin/quizzes'),
  getAllQuestions: () => api.get('/admin/questions'),
};

export default api;
