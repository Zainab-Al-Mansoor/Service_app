const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiError {
  message: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; error: ApiError | null }> {
    const token = this.getToken();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle authentication errors - but not for /auth/me which should fail silently
        if (response.status === 401 && endpoint !== '/auth/me') {
          this.removeToken();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        return {
          data: null as T,
          error: {
            message: result.message || 'An error occurred',
            status: response.status,
          },
        };
      }

      // Return the nested data field from the API response
      return { data: result.data as T, error: null };
    } catch (err: any) {
      return {
        data: null as T,
        error: {
          message: err.message || 'Network error',
        },
      };
    }
  }

  // Auth endpoints
  async register(email: string, password: string, full_name: string, role: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, role }),
    });

    if (result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async logout() {
    this.removeToken();
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async updateProfile(data: { full_name?: string; phone?: string; avatar_url?: string }) {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Services endpoints
  async getServices(params?: { category?: string; search?: string; page?: number; limit?: number; provider_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.provider_id) searchParams.set('provider_id', params.provider_id);

    return this.request<{ services: any[]; pagination: any }>(`/services?${searchParams.toString()}`);
  }

  async getServiceById(id: string) {
    return this.request<{ service: any }>(`/services/${id}`);
  }

  async createService(data: any) {
    return this.request<{ service: any }>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: any) {
    return this.request<{ service: any }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request<{ categories: any[] }>('/services/categories');
  }

  async createCategory(data: { name: string; description?: string }) {
    return this.request<{ category: any }>('/services/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request<{ category: any }>(`/services/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Bookings endpoints
  async getBookings(params?: { status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.request<{ bookings: any[]; pagination: any }>(`/bookings?${searchParams.toString()}`);
  }

  async getBookingById(id: string) {
    return this.request<{ booking: any }>(`/bookings/${id}`);
  }

  async createBooking(data: any) {
    return this.request<{ booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBookingStatus(id: string, status: string, cancellation_reason?: string) {
    return this.request<{ booking: any }>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, cancellation_reason }),
    });
  }

  async cancelBooking(id: string, reason?: string) {
    return this.request<{ message: string }>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Stats endpoints
  async getAdminStats() {
    return this.request<{ totalUsers: number; totalServices: number; totalBookings: number; totalRevenue: number; bookingStats: any }>('/users/stats/dashboard');
  }

  async getProviderStats() {
    return this.request<any>('/bookings/stats/provider');
  }

  async getCustomerStats() {
    return this.request<any>('/bookings/stats/customer');
  }

  // Users endpoints (admin)
  async getUsers(params?: { role?: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.request<{ users: any[]; pagination: any }>(`/users?${searchParams.toString()}`);
  }

  async getUserById(id: string) {
    return this.request<{ user: any }>(`/users/${id}`);
  }

  async updateUserStatus(id: string, data: { is_active?: boolean; is_verified?: boolean; role?: string }) {
    return this.request<{ message: string }>(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }
  // Health check
  async healthCheck() {
    return this.request<{ success: boolean; message: string }>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
