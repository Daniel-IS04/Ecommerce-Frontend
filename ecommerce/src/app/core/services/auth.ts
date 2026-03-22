import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Importamos la librería

// Asegúrate de que tus interfaces coincidan con la nueva respuesta
import {
  RegisterPayload,
  RegisterResponse,
  RegisterErrorResponse,
  LoginPayload,
  LoginResponse,
} from '../models/auth';

// Interfaz para tipar lo que viene dentro del token de Django
export interface DecodedToken {
  user_id: number;
  first_name: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiDJ = environment.apiDJ;

  // Signals para manejar la reactividad en toda la app
  isLoggedIn = signal<boolean>(this.checkToken());
  currentUser = signal<DecodedToken | null>(this.getUserFromToken());

  constructor(private http: HttpClient) {}

  private checkToken(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  // Método privado para leer el token al recargar (F5)
  private getUserFromToken(): DecodedToken | null {
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          return jwtDecode<DecodedToken>(token);
        } catch (error) {
          return null; // Si el token es inválido o corrupto
        }
      }
    }
    return null;
  }

  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiDJ}/users/register/`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error) {
          const backendError = error.error as RegisterErrorResponse;
          console.error('Errores de validación de DRF:', backendError.errors);
        }
        return throwError(() => error);
      }),
    );
  }

  login(data: LoginPayload): Observable<LoginResponse> {
    // 1. EL TRUCO: Transformamos el payload para que Django esté feliz
    const djangoPayload = {
      username: data.email, // Mapeamos tu campo 'email' al 'username' que exige Django
      password: data.password,
    };

    // 2. Enviamos el djangoPayload en lugar del data original
    return this.http
      .post<LoginResponse>(`${this.apiDJ}/users/login/`, djangoPayload, { withCredentials: true })
      .pipe(
        tap((response: LoginResponse) => {
          localStorage.setItem('access_token', response.token);
          const decoded = jwtDecode<DecodedToken>(response.token);
          this.currentUser.set(decoded);
          this.isLoggedIn.set(true);
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Ocurrió un error desconocido.';
          if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 400 || error.status === 401) {
            errorMessage = 'Correo o contraseña incorrectos.';
          } else if (error.status >= 500) {
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
          }
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  logout() {
    // Solo limpiamos lo que el frontend controla
    localStorage.removeItem('access_token');
    this.isLoggedIn.set(false);
    this.currentUser.set(null);

    // NOTA: Para un logout completo, deberíamos llamar a un endpoint de Django
    // para que invalide la cookie HttpOnly del refresh token.
  }
}
