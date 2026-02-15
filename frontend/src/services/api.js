import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', null, { params: data }),
  registerSeller: (data) => api.post('/auth/register-seller', data),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
  getBySeller: (sellerId, params) => api.get(`/products/seller/${sellerId}`, { params }),
  search: (params) => api.get('/products/search', { params }),
  getRecommendations: (id, limit = 4) => api.get(`/products/${id}/recommendations`, { params: { limit } }),
  getTop: (limit = 8) => api.get('/products/top', { params: { limit } }),
  getLatest: (limit = 8) => api.get('/products/latest', { params: { limit } }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/my-products', { params }),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  getTotal: () => api.get('/cart/total'),
  addToCart: (data) => api.post('/cart', data),
  updateItem: (id, quantity) => api.put(`/cart/${id}`, null, { params: { quantity } }),
  removeItem: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
  getMyPurchases: (params) => api.get('/orders/purchases', { params }),
  getMySales: (params) => api.get('/orders/sales', { params }),
  confirmOrder: (id) => api.put(`/orders/${id}/confirm`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, null, { params: { status } }),
};

export const paymentService = {
  createVNPayUrl: (orderId, amount, orderInfo) =>
    api.post('/payment/vnpay', null, { params: { orderId, amount, orderInfo } }),
  checkStatus: (txnRef) => api.get(`/payment/status/${txnRef}`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingSellers: (params) => api.get('/admin/sellers/pending', { params }),
  approveSeller: (id, approve) => api.put(`/admin/sellers/${id}/approve`, null, { params: { approve } }),
  getPendingProducts: (params) => api.get('/admin/products/pending', { params }),
  approveProduct: (id, approve) => api.put(`/admin/products/${id}/approve`, null, { params: { approve } }),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getPendingOrders: (params) => api.get('/admin/orders/pending', { params }),
  approveOrder: (id) => api.put(`/admin/orders/${id}/approve`),
};

export const forumService = {
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (formData) => api.post('/forum/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePost: (id, formData) => api.put(`/forum/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePost: (id) => api.delete(`/forum/posts/${id}`),
  reactToPost: (id, type) => api.post(`/forum/posts/${id}/react`, null, { params: { type } }),
  reportPost: (id) => api.post(`/forum/posts/${id}/report`),
  getComments: (postId, params) => api.get(`/forum/posts/${postId}/comments`, { params }),
  addComment: (postId, formData) => api.post(`/forum/posts/${postId}/comments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteComment: (id) => api.delete(`/forum/comments/${id}`),
  toggleCommentLike: (id) => api.put(`/forum/comments/${id}/like`),
  getTopics: () => api.get('/forum/topics'),
  createTopic: (data) => api.post('/forum/topics', data),
  deleteTopic: (id) => api.delete(`/forum/topics/${id}`),
  // Admin
  getReportedPosts: (params) => api.get('/forum/admin/reported', { params }),
  dismissReport: (id) => api.put(`/forum/admin/posts/${id}/dismiss`),
};

export const chatService = {
  sendMessage: (message) => api.post('/chat', { message }),
};

export default api;
