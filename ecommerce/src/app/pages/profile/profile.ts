import {
  Component,
  importProvidersFrom,
  OnInit,
  inject,
  ChangeDetectorRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common'; // <-- Importas esto
import { Auth } from '../../core/services/auth';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { request } from 'node:http';
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
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID); // <-- Inyectas esto

  protected profile_data: ProfileData | null = null;
  private cdr = inject(ChangeDetectorRef);

  profileForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required]],
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.auth.Profile().subscribe({
        next: (rpta) => {
          console.log('datos del backend: ', rpta);
          this.profile_data = rpta;
          this.profileForm.patchValue({
            first_name: rpta.first_name,
            last_name: rpta.last_name,
            email: rpta.email,
            phone_number: rpta.phone_number,
          });
          this.cdr.detectChanges(); // <--- LA MAGIA: Obliga a Angular a mostrar los datos
        },
        error: (error) => {
          console.error('Error en la petición:', error);
        },
      });
    }
  }
  hasChanges(): boolean {
    if (!this.profile_data) return false;

    const form = this.profileForm.value;

    return Object.keys(form).some((key) => {
      const k = key as keyof ProfileData;
      return form[k] !== this.profile_data![k];
    });
  }
  onUpdateProfile() {
    const form = this.profileForm.value; // archivo plano json
    const changes: Partial<ProfileData> = {};

    Object.keys(form).forEach((key) => {
      const k = key as keyof ProfileData;

      if (form[k] !== this.profile_data![k]) {
        changes[k] = form[k];
      }
    });
    if (Object.keys(changes).length === 0) {
      console.log('No hay cambios, no se envía request');
      return;
    }
    console.log('Cambios detectados:', changes);
    // mando mi API con http
    this.auth.UpdateProfile(changes).subscribe({
      next: (res) => {
        console.log('Perfil actualizado:', res);

        // actualizar estado local
        this.profile_data = res;
        this.profileForm.patchValue(res);
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
      },
    });
  }
}
