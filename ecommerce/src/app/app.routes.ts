import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Profile } from './pages/profile/profile';
import { Index } from './pages/home/index';
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: Home,
    children: [
      { path: 'home', component: Index },
      {
        path: 'perfil',
        component: Profile,
      },
    ],
  },
  // Agrega una redirección para que no entre a una página en blanco al inicio
  { path: '', redirectTo: '', pathMatch: 'full' },
];
