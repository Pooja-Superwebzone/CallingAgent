export interface User {
  id: number;
  email: string;
  name?: string;
  [key: string]: any;
}

export interface AuthResponse {
  token: string;
  user: User;
}