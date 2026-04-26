export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    company_id: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  company_sector: string;
  company_size: "micro" | "small" | "medium";
  nif: string;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status_code?: number;
}
