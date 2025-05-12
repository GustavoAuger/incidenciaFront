import { Component } from '@angular/core';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  user: User = {email: '', password: '', id_rol: 0 , id_bodega: 0 , id: 0}

  constructor(private authService: AuthService,private router: Router){}

  isLoading = false;
  showError = false;

  async onSubmit(): Promise<void> {   
    // Resetear estados
    this.showError = false;
    this.errorMessage = '';
    
    // Validar campos vacíos
    if (!this.username.trim() || !this.password.trim()) {
      this.showError = true;
      this.errorMessage = 'No se ingreso Usuario o Contraseña';
      return;
    }
    
    this.isLoading = true;

    try {
      this.user.email = this.username.trim();
      this.user.password = this.password;
      
      const result = await this.authService.login(this.user);
      
      if (result) {
        this.router.navigate(['/home']);
      } else {
        this.showError = true;
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    } catch (error) {
      console.error('Error en el login:', error);
      this.showError = true;
      this.errorMessage = 'Error al intentar iniciar sesión. Por favor, intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }
  
}
