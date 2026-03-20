import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  isLoading: boolean = false;
  errorMessage: string | null = null;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.loginForm.invalid || this.isLoading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // 1. Inicia el estado de carga y limpia errores anteriores
    this.isLoading = true;
    this.errorMessage = null;

    const payload = this.loginForm.value;

    this.authService.login(payload).subscribe({
      next: (response) => {
        console.log('Login correcto, tokens guardados por el servicio', response);
        this.isLoading = false; // Finaliza la carga

        // REVISA ESTO: Cambia '/home/index' a '/home' si esa es tu ruta real en app.routes.ts
        this.router.navigate(['../home']);
      },
      error: (err) => {
        console.error('No se concreto el Login:', err);
        this.isLoading = false; // Finaliza la carga incluso si falla

        // 2. ASIGNA el mensaje de error para que el HTML lo muestre
        this.errorMessage = err.message;
      },
    });
  }
}
