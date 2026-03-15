import { Injectable } from '@angular/core';
import { BaseHttp } from './base-http';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { catchError } from 'rxjs/operators';
export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  phone_number?: string;
  birth_date?: string;
  password: string;
  password2: string;
}

export interface RegisterResponse {
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  phone_number: string | null;
  birth_date: string | null;
}

export interface RegisterErrorResponse {
  errors: {
    [key: string]: string[];
  };
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiDJ = environment.apiDJ;

  constructor(private http: HttpClient) {}

  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiDJ}/users/register`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error) {
          const backendError = error.error as RegisterErrorResponse;
          // Aquí capturas el diccionario exacto de errores para pintar en tu formulario reactivo
          console.error('Errores de validación de DRF:', backendError.errors);
        }
        return throwError(() => error);
      }),
    );
  }
}
