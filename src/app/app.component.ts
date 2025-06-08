import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { filter } from 'rxjs/operators';
import { User } from './interfaces/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  providers: [AuthService, UserService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  isNotLogin: boolean = false;
  username: string = '';
  userBodega: string = '';
  userRol: string = '';
  private routerSubscription: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.updateAuthStatus();    
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isNotLogin = this.router.url !== '/login';
      this.updateAuthStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      const email = localStorage.getItem('username') || '';
      // Extraer el nombre de usuario antes del @
      this.username = email.split('@')[0];
      if (email) {
        this.loadUserInfo();
      }
    }
  }

  private loadUserInfo(): void {
    this.userService.getUsuarios().subscribe({
      next: (users: User[]) => {
        const userEmail = localStorage.getItem('username');
        const currentUser = users.find(user => user.email === userEmail);
        
        if (currentUser) {
          this.userBodega = currentUser.bodega || 'Sin bodega asignada';
          this.userRol = currentUser.rol ? this.capitalizeFirstLetter(currentUser.rol) : 'Rol no definido';
        } else {
          this.userBodega = 'Sin bodega asignada';
          this.userRol = 'Rol no definido';
        }
      },
      error: (error) => {
        console.error('Error al cargar la información del usuario:', error);
        this.userBodega = 'Bodega no disponible';
        this.userRol = 'Rol no disponible';
      }
    });
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
