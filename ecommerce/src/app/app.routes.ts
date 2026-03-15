import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register/register';
import { LoginComponent } from './pages/auth/login/login'; // Aunque esté vacío por ahora
import { Index } from './pages/auth/index/index'; // Aunque esté vacío por ahora

export const routes: Routes = [
  // Cuando la URL sea /register, carga este componente
  { path: 'register', component: RegisterComponent },

  // Cuando la URL sea /login, carga el componente de login
  { path: 'login', component: LoginComponent },
  { path: 'index', component: Index },

  // Si entras a localhost:4200 (sin nada), te manda automáticamente al registro
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  // { path: '', component:Index, pathMatch: 'full' },

  // Si pones una ruta que no existe, te manda al registro (puedes cambiarlo luego a una página 404)
  { path: '**', redirectTo: '/index' },
];
