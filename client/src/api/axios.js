import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const data = (request) => request.then((response) => response.data);

export const api = {
  auth: {
    login: (email, password) => data(apiClient.post('/auth/login', { email, password })),
    me: () => data(apiClient.get('/auth/me')),
    firstLogin: (password) => data(apiClient.post('/auth/first-login', { password })),
  },
  users: {
    list: () => data(apiClient.get('/users')),
    get: (id) => data(apiClient.get(`/users/${id}`)),
    import: (users) => data(apiClient.post('/users/import', { users })),
  },
  courses: {
    list: () => data(apiClient.get('/courses')),
    get: (id) => data(apiClient.get(`/courses/${id}`)),
    create: (payload) => data(apiClient.post('/courses', payload)),
    update: (id, payload) => data(apiClient.put(`/courses/${id}`, payload)),
    remove: (id) => data(apiClient.delete(`/courses/${id}`)),
    cohorts: (id) => data(apiClient.get(`/courses/${id}/cohorts`)),
    assignCohorts: (id, userIds) => data(apiClient.post(`/courses/${id}/cohorts`, { userIds })),
  },
  lessons: {
    listByCourse: (courseId) => data(apiClient.get(`/lessons/courses/${courseId}/lessons`)),
    create: (courseId, payload) => data(apiClient.post(`/lessons/courses/${courseId}/lessons`, payload)),
    update: (id, payload) => data(apiClient.put(`/lessons/${id}`, payload)),
    remove: (id) => data(apiClient.delete(`/lessons/${id}`)),
    schedule: (id, availableDate) => data(apiClient.put(`/lessons/${id}/schedule`, { availableDate })),
  },
  quizzes: {
    listByCourse: (courseId) => data(apiClient.get(`/quizzes/courses/${courseId}/quizzes`)),
    import: (courseId, payload) => data(apiClient.post(`/quizzes/courses/${courseId}/quizzes/import`, payload)),
    get: (id) => data(apiClient.get(`/quizzes/${id}`)),
    update: (id, payload) => data(apiClient.put(`/quizzes/${id}`, payload)),
    remove: (id) => data(apiClient.delete(`/quizzes/${id}`)),
    submit: (id, answers) => data(apiClient.post(`/quizzes/${id}/submit`, { answers })),
    threshold: (id, passingScore) => data(apiClient.put(`/quizzes/${id}/threshold`, { passingScore })),
  },
  progress: {
    me: () => data(apiClient.get('/progress/me')),
    students: () => data(apiClient.get('/progress/students')),
    student: (studentId) => data(apiClient.get(`/progress/students/${studentId}`)),
  },
  notifications: {
    list: () => data(apiClient.get('/notifications')),
    markAsRead: (id) => data(apiClient.put(`/notifications/${id}/read`)),
  },
};

export default apiClient;
