import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../services/auth'; // Ajusta la ruta a tu servicio
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const platformId = inject(PLATFORM_ID);

  // 1. Si estamos en el servidor, pasamos la petición limpia y evitamos el caos
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // --- DE AQUÍ PARA ABAJO SOLO SE EJECUTA EN EL NAVEGADOR ---

  // 2. Le pegamos el access_token a la petición (si existe)
  let requestClone = req;
  const token = localStorage.getItem('access_token'); // Ya podemos quitar el typeof window

  if (token) {
    requestClone = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // 3. Enviamos la petición y escuchamos si hay errores
  return next(requestClone).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 y no estamos en login/refresh
      if (error.status === 401 && !req.url.includes('/login') && !req.url.includes('/refresh')) {
        // 4. Llamamos al rescate (Refresh)
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const newRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${response.token}` },
            });
            return next(newRequest);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }

      // Si es otro tipo de error (500, 404, etc), lo dejamos pasar
      return throwError(() => error);
    }),
  );
};
