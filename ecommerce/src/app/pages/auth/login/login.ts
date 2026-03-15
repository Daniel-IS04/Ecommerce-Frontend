import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importante para navegar tras el login
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(Auth);
  private router = inject(Router);

  mensaje = signal('');

  // Según tu lógica de Django (donde username = email), pediremos el email
  credenciales = {
    email: '',
    password: '',
  };

  ejecutarLogin() {
    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        console.log('¡Login exitoso!', res);
        this.mensaje.set('¡Bienvenido de vuelta!');

        // Según tu auth_views.py, Django devuelve un { success: True, token: 'ey...' }
        // Guardamos ese token en el navegador para usarlo después
        if (res.token) {
          localStorage.setItem('access_token', res.token);
        }

        // Opcional: Redirigir a una página principal después de 1 segundo
        // setTimeout(() => this.router.navigate(['/']), 1000);
      },
      error: (err) => {
        console.error('Error en login:', err);
        // Mensaje genérico por seguridad (no se dice si falló el correo o la clave)
        this.mensaje.set('Credenciales incorrectas. Inténtalo de nuevo.');
      },
    });
  }
}
