import { request } from './client';

export type AuthPayload = {
  token: string;
  user: {
    id: number;
    email: string;
  };
};

export function register(email: string, password: string) {
  return request<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      user: {
        email,
        password,
        password_confirmation: password
      }
    })
  });
}

export function login(email: string, password: string) {
  return request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}
