/**
 * Serviço centralizado de API
 * Gerencia todas as chamadas HTTP para o backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.wellsole.store/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
  };
  message?: string;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    message?: string
  ) {
    super(message || 'Erro na requisição');
    this.name = 'ApiError';
  }
}

/**
 * Classe principal para fazer requisições à API
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtém o token de admin do localStorage
   */
  private getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  /**
   * Obtém o refresh token do localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Salva tokens no localStorage
   */
  setTokens(token: string, refreshToken?: string, isAdmin = false): void {
    if (isAdmin) {
      localStorage.setItem('admin_token', token);
      if (refreshToken) {
        localStorage.setItem('admin_refresh_token', refreshToken);
      }
    } else {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
  }

  /**
   * Remove tokens do localStorage
   */
  clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
  }

  /**
   * Faz refresh do token
   */
  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new ApiError(401, 'NO_REFRESH_TOKEN', 'Token de refresh não encontrado');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      this.clearTokens();
      throw new ApiError(response.status, 'REFRESH_FAILED', 'Falha ao renovar token');
    }

    const data: ApiResponse<{ token: string; refreshToken: string }> = await response.json();

    if (data.success && data.data) {
      this.setTokens(data.data.token, data.data.refreshToken);
      return data.data;
    }

    throw new ApiError(401, 'REFRESH_FAILED', 'Falha ao renovar token');
  }

  /**
   * Faz uma requisição HTTP
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, requiresAdmin = false, ...fetchOptions } = options;

    // Prepara headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Adiciona token de autenticação se necessário
    if (requiresAuth || requiresAdmin) {
      const token = requiresAdmin ? this.getAdminToken() : this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (requiresAuth) {
        throw new ApiError(401, 'NO_TOKEN', 'Token de autenticação não encontrado');
      }
    }

    // Faz a requisição
    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Se token expirou, tenta renovar
    if (response.status === 401 && requiresAuth && !requiresAdmin) {
      try {
        await this.refreshToken();
        // Tenta novamente com novo token
        const newToken = this.getToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
        }
      } catch (error) {
        // Se refresh falhar, limpa tokens e lança erro
        this.clearTokens();
        throw new ApiError(401, 'AUTH_EXPIRED', 'Sessão expirada. Por favor, faça login novamente.');
      }
    }

    // Parse da resposta
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (error) {
      // Se não conseguir parsear JSON, pode ser erro de rede
      throw new ApiError(
        response.status,
        'PARSE_ERROR',
        'Erro ao processar resposta do servidor'
      );
    }

    // Se não for sucesso, lança erro
    if (!response.ok || !data.success) {
      throw new ApiError(
        response.status,
        data.error?.code,
        data.error?.message || data.message || 'Erro na requisição'
      );
    }

    // Retorna data diretamente se não houver estrutura data.data
    // Ou retorna data.data se houver estrutura aninhada
    return (data.data !== undefined ? data.data : data) as T;
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instância singleton
export const api = new ApiService();
export { ApiError };

