import { Component } from '@angular/core';
// Importamos RouterOutlet (para inyectar las páginas) y RouterLink (para los botones del menú)
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
})
export class App {
  // ¡Mira qué limpio! Ya no hay lógica de datos aquí, todo está modularizado.
  isMenuOpen: boolean = false;
}
