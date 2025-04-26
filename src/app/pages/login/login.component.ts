import { Component } from '@angular/core';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  user: User = {username: '', password: '', id_rol: 0}

  constructor(private authService: AuthService,private router: Router){}

  async onSubmit(): Promise<void> {   
    this.user.username = this.username;
    this.user.password = this.password;
    this.authService.login(this.user).then((result) => {
      if (result) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Invalid username or password';
      }      
    });
  }
  
}
