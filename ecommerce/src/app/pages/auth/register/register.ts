import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth'; // Importamos el nuevo servicio hijo

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  // Inyectamos el servicio Auth en lugar del viejo DataService
  private authService = inject(Auth);

  mensaje = signal('');

  nuevoUsuario = {
    first_name: '',
    last_name: '',
    email: '',
    dni: '',
    phone_number: '',
    birth_date: '',
    password: '',
    password2: '',
  };

  ejecutarRegistro() {
    // Usamos el método register() que creamos en auth.ts
    this.authService.register(this.nuevoUsuario).subscribe({
      next: (res) => {
        console.log('¡Éxito!', res);
        this.mensaje.set('¡Usuario creado con éxito!');
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        const erroresBackend = err.error;
        if (typeof erroresBackend === 'object') {
          this.mensaje.set('Fallo en: ' + JSON.stringify(erroresBackend));
        } else {
          this.mensaje.set('Error inesperado en el servidor');
        }
      },
    });
  }

  limpiarFormulario() {
    this.nuevoUsuario = {
      first_name: '',
      last_name: '',
      email: '',
      dni: '',
      phone_number: '',
      birth_date: '',
      password: '',
      password2: '',
    };
  }
}
