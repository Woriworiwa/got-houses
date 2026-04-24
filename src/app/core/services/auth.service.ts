import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, AuthUser } from '../models/auth.model';

const API = 'http://localhost:3000/auth';
const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isLoggedIn = computed(() => this.user() !== null);

  register(email: string, password: string, name: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.post<AuthResponse>(`${API}/register`, { email, password, name }).subscribe({
      next: ({ token, user }) => {
        this.saveToken(token);
        this.user.set(user);
        this.loading.set(false);
        this.router.navigateByUrl('/houses');
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message ?? 'Registration failed');
        this.loading.set(false);
      },
    });
  }

  login(email: string, password: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.post<AuthResponse>(`${API}/login`, { email, password }).subscribe({
      next: ({ token, user }) => {
        this.saveToken(token);
        this.user.set(user);
        this.loading.set(false);
        this.router.navigateByUrl('/houses');
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message ?? 'Login failed');
        this.loading.set(false);
      },
    });
  }

  restoreSession(): void {
    const token = this.getToken();
    this.http.get<{ user: AuthUser }>(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: ({ user }) => this.user.set(user),
      error: () => {
        this.removeToken();
        this.user.set(null);
      },
    });
  }

  logout(): void {
    this.removeToken();
    this.user.set(null);
    this.error.set(null);
    this.router.navigateByUrl('/login');
  }

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
