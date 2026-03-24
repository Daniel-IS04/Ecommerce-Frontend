import {
  Component,
  importProvidersFrom,
  OnInit,
  Inject,
  inject,
  ChangeDetectorRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // <-- Importas esto
import { Auth } from '../../core/services/auth';

export interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private auth = inject(Auth);

  private platformId = inject(PLATFORM_ID); // <-- Inyectas esto

  protected profile_data: ProfileData | null = null;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.auth.Profile().subscribe({
        next: (rpta) => {
          console.log('datos del backend: ', rpta);
          this.profile_data = rpta;
          this.cdr.detectChanges(); // <--- LA MAGIA: Obliga a Angular a mostrar los datos
        },
        error: (error) => {
          console.error('Error en la petición:', error);
        },
      });
    }
  }
}
