import { Component, OnInit } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterModule], // Mantienes los módulos que necesitas
  templateUrl: './index.html',
  styleUrls: ['./index.css'],
})
export class Index {
  isLoggedIn = false; // Controla el @if

  // Datos para el @for

  onRegister() {
    console.log('Navegando al registro...');
  }
}
