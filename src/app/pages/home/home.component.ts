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
    email: '',
    password: '',
    id_rol: 1,
    id_bodega: 1,
    id:0,
  }

  navigateTo(route: string): void {    
    this.router.navigate([route]);
  }

}
