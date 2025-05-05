import { Component } from '@angular/core';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  user: User = {email: '', password: '', id_rol: 0 , id_bodega: 0 , id: 0}

  constructor(private authService: AuthService,private router: Router){}

  async onSubmit(): Promise<void> {   
    this.user.email = this.username;
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
