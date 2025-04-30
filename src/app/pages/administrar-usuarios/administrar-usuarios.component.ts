import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';

@Component({
  selector: 'app-administrar-usuarios',
  standalone: true,
  imports: [CommonModule, InitCapFirstPipe],
  templateUrl: './administrar-usuarios.component.html',
  styleUrls: ['./administrar-usuarios.component.css']
})
export class AdministrarUsuariosComponent {

  users_list: User[] = [];

  constructor(private router: Router, private _userService: UserService) {}

  ngOnInit(): void {
    if (this.users_list.length === 0) {
      this.getUsuarios();
    }
  }
  
  navigateTo(route: string): void {    
    this.router.navigate([route]);
  }  

  getUsuarios(): void {
    this._userService.getUsuarios().subscribe((users) => {
      this.users_list = users;
    });
  }

}
