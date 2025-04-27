import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  user: User = {
    username: '',
    password: '',
    id_rol: 1
  }

  navigateTo(route: string): void {
    switch(route) {
      case 'resumen-incidencias':
        this.router.navigate(['/resumen-incidencias']);
        break;
      case 'incidencias-sin-resolver':
        this.router.navigate(['/incidencias-sin-resolver']);
        break;
      case 'crear-incidencia':
        this.router.navigate(['/crear-incidencia']);
        break;
      case 'reclamos-transportista':
        this.router.navigate(['/reclamos-transportista']);
        break;
      case 'reportes-incidencias':
        this.router.navigate(['/reportes-incidencias']);
        break;
      case 'administrar-usuarios':
        this.router.navigate(['/administrar-usuarios']);
        break;
      default:
        console.error('Ruta no encontrada');
    }
  }
}
