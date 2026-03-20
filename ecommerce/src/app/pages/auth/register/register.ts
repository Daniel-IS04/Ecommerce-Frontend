import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { RouterLink, Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  isLoading: boolean = false;

  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
    password: ['', Validators.required],
    password2: ['', Validators.required],
  });
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Dispara validaciones visuales
      return;
    }
    const payload = this.registerForm.value;

    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        this.router.navigate(['/auth/login']); // Redirige al usuario programáticamente
        // Aquí redirigirías al login usando el Router
      },
      error: (err) => {
        console.error('Falló el registro', err);
        // Aquí extraes err.error.errors y los mapeas a tu formulario
      },
    });
  }
}
