export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh?: string;
  user: UserSummary;
}

export interface RefreshResponse {
  access: string;
  user?: UserSummary;
}

export interface RegisterRequest {
  companyName: string;
  country: string;
  timezone: string;
  currency: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
}

export interface CompanySettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  fiscalYearStartMonth: string;
}

export interface CompanyResponse extends CompanyProfile, CompanySettings {}

export interface NotificationListResponse {
  unreadCount?: number;
  count?: number;
  results?: Array<{ id: string; read?: boolean }>;
}

export interface LegacyUser {
  id: string;
  name: string;
  email: string;
}

export interface LegacyCreateUserInput {
  name: string;
  email: string;
}

export type LegacyUpdateUserInput = Partial<LegacyCreateUserInput>;

export interface operations {
  getUserById: {
    responses: { 200: { content: { "application/json": LegacyUser } } };
  };
  getUsers: {
    responses: { 200: { content: { "application/json": LegacyUser[] } } };
  };
  createUser: {
    requestBody: { content: { "application/json": LegacyCreateUserInput } };
  };
  updateUser: {
    requestBody: { content: { "application/json": LegacyUpdateUserInput } };
  };
}

export type ApiFieldError = string[] | string | undefined;

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  non_field_errors?: string[];
  [field: string]: ApiFieldError;
}
