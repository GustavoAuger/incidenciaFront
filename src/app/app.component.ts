import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { User } from './interfaces/user';
import { Rol } from './interfaces/rol';
import { InitCapFirstPipe } from './pipes/init-cap-first.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InitCapFirstPipe, FormsModule],
  providers: [AuthService, UserService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title='proyecto';
  isAuthenticated: boolean = false;
  isNotLogin: boolean = false;
  username: string = '';
  userBodega: string = '';
  userRol: string = '';
  roles: Rol[] = []; // Roles completos para el navbar
  modalRoles: Rol[] = []; // Roles filtrados para el modal
  selectedRoleId: number | null = null;
  private routerSubscription: Subscription | undefined;
  showBodegaDropdown = false;
  selectedBodegaId: number | null = null;
  tiendaBodegas: any[] = [];
  isFormValid: boolean = false;
  isNavbarLoading: boolean = true;
  isHomePage: boolean = false;
  showTooltip: boolean = false;
  isHoveringRoleButton: boolean = false;
  private tooltipTimeout: any;

  private _isAdmin: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomePage = event.url === '/' || event.url === '/home';
      this.isNotLogin = event.url !== '/login';
      this.updateAuthStatus();
    });

    this.loadTiendaBodegas();
  }

  ngOnInit(): void {
    this.updateAuthStatus();    
    this.loadRolesForNavbar();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  get isAdmin(): boolean {
    return this._isAdmin;
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
    // Activar el spinner al inicio de la carga
    this.isNavbarLoading = true;
    
    // Obtener el email del usuario logueado
    const userEmail = localStorage.getItem('username');
    if (!userEmail) {
      this.isNavbarLoading = false;
      return;
    }
    
    // Limpiar el estado de admin al cargar
    this._isAdmin = false;
    
    // Siempre cargar la información del usuario desde la base de datos
    this.userService.getUsuarios().subscribe({
      next: (users: User[]) => {
        try {
          const currentUser = users.find(user => user.email === userEmail);
          if (!currentUser) {
            this.isNavbarLoading = false;
            return;
          }
          
          // Obtener el rol y bodega originales del usuario desde la base de datos
          const originalRolId = currentUser.id_rol;
          const originalBodegaId = currentUser.id_bodega;
          
          // Actualizar el estado de admin
          this._isAdmin = originalRolId === 1;
          
          // Guardar los valores originales en localStorage
          localStorage.setItem('original_id_rol', originalRolId.toString());
          localStorage.setItem('original_id_bodega', originalBodegaId!.toString());
          
          // Si no hay un rol temporal, usar los valores originales
          if (!localStorage.getItem('id_rol') || !localStorage.getItem('id_bodega')) {
            localStorage.setItem('id_rol', originalRolId.toString());
            localStorage.setItem('id_bodega', originalBodegaId!.toString());
          }
          
          // Actualizar la UI con los valores actuales (pueden ser temporales)
          const currentRolId = parseInt(localStorage.getItem('id_rol') || originalRolId.toString(), 10);
          const currentBodegaId = parseInt(localStorage.getItem('id_bodega') || originalBodegaId!.toString(), 10);
          
          // Actualizar el nombre del rol
          const role = this.roles.find(r => r.id === currentRolId);
          if (role) {
            this.userRol = this.capitalizeFirstLetter(role.nombre);
            localStorage.setItem('rol_nombre', this.userRol);
          }
          
          // Actualizar el nombre de la bodega
          this.userBodega = this.getBodegaName(currentBodegaId);
          localStorage.setItem('bodega_nombre', this.userBodega);
          
          // Forzar la detección de cambios para actualizar la UI
          this.changeDetectorRef.detectChanges();
          
          // Cargar bodegas de tienda si es necesario
          if (currentRolId === 4) {
            this.loadTiendaBodegas();
          }
          
          // Si es admin, asegurarse de que el botón de admin sea visible
          if (originalRolId === 1) {
            localStorage.setItem('is_admin', 'true');
          }
          
          // Desactivar el spinner cuando todo esté listo
          this.isNavbarLoading = false;
          this.changeDetectorRef.detectChanges();
          
        } catch (error) {
          console.error('Error al procesar datos del usuario:', error);
          this.isNavbarLoading = false;
          this.changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar la información del usuario:', error);
        this.isNavbarLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  
  private getBodegaName(bodegaId: number): string {
    // Mapeo de IDs de bodega a nombres
    const bodegasMap: {[key: number]: string} = {
      1: 'LOCAL BELLOTO',
      2: 'LOCAL MARINA',
      3: 'LOCAL MELIPILLA',
      4: 'LOCAL CONCEPCION CENTRO',
      5: 'LOCAL LA SERENA',
      6: 'LOCAL ANTOFAGASTA',
      7: 'LOCAL LOS ANGELES',
      8: 'LOCAL RANCAGUA',
      9: 'LOCAL TALCA',
      10: 'LOCAL CHILLAN',
      11: 'LOCAL CURICO',
      12: 'LOCAL ARICA',
      13: 'LOCAL PUERTO MONTT',
      14: 'LOCAL PATIO MAIPU',
      15: 'LOCAL PLAZA VESPUCIO',
      16: 'LOCAL PLAZA SUR',
      17: 'LOCAL IQUIQUE',
      18: 'LOCAL VALDIVIA',
      19: 'LOCAL TEMUCO',
      20: 'LOCAL CALAMA',
      21: 'BODEGA CENTRAL',
      22: 'BODEGA DEVOLUCIONES',
      23: 'BODEGA VIRTUAL'
    };
    
    return bodegasMap[bodegaId] || `Bodega ${bodegaId}`;
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  onRoleChange(roleId: number | null): void {
    this.selectedRoleId = roleId;
    
    // Si el rol es Tienda (ID 4), mostrar el dropdown de bodegas
    this.showBodegaDropdown = roleId === 4;
    
    // Si ya no es Tienda, limpiar la bodega seleccionada
    if (roleId !== 4) {
      this.selectedBodegaId = null;
    }
    
    // Validar el formulario
    this.validateForm();
  }

  private validateForm(): void {
    // Verificar que haya un rol seleccionado
    const hasRoleSelected = this.selectedRoleId !== null;
    
    // Si es Tienda, verificar que haya una bodega seleccionada
    const hasBodegaSelected = this.selectedRoleId !== 4 || this.selectedBodegaId !== null;
    
    // El formulario es válido si hay un rol seleccionado y (si es Tienda, también una bodega)
    this.isFormValid = hasRoleSelected && hasBodegaSelected;
  }

  onBodegaChange(bodegaId: number | null): void {
    this.selectedBodegaId = bodegaId;
    this.validateForm();
  }

  saveRoleChange() {
    if (this.selectedRoleId !== null && this.isFormValid) {
      // Determinar la bodega según el rol
      let bodegaId = '';
      let bodegaNombre = '';
      let rolNombre = '';
      
      // Obtener el nombre del rol seleccionado
      const selectedRole = this.roles.find(r => r.id === this.selectedRoleId);
      if (selectedRole) {
        rolNombre = this.capitalizeFirstLetter(selectedRole.nombre);
      }
      
      if (this.selectedRoleId === 2) { // Emisor
        bodegaId = '22';
        bodegaNombre = 'Bodega Devoluciones';
      } else if (this.selectedRoleId === 1) { // Admin
        bodegaId = '23';
        bodegaNombre = 'Bodega Virtual';
      } else if (this.selectedRoleId === 3) { // Gestor
        bodegaId = '21';
        bodegaNombre = 'Bodega Central';
      } else if (this.selectedRoleId === 4) { // Tienda
        if (!this.selectedBodegaId) {
          alert('Por favor seleccione una bodega');
          return;
        }
        
        // Convertir el ID de la bodega a número para la búsqueda
        const bodegaIdNum = Number(this.selectedBodegaId);
        const selectedBodega = this.tiendaBodegas.find(b => b.id === bodegaIdNum);
        
        if (selectedBodega) {
          bodegaId = this.selectedBodegaId.toString();
          bodegaNombre = selectedBodega.nombre || `Tienda ${selectedBodega.id_bodega}`;
        } else {
          // Si no se encuentra la bodega, usar valores por defecto
          bodegaId = this.selectedBodegaId.toString();
          bodegaNombre = `Tienda ${bodegaId}`;
        }
      }
      
      // Guardar todo en localStorage
      localStorage.setItem('id_rol', this.selectedRoleId.toString());
      localStorage.setItem('id_bodega', bodegaId);
      localStorage.setItem('bodega_nombre', bodegaNombre);
      localStorage.setItem('rol_nombre', rolNombre);
      
      // Actualizar la UI
      this.userRol = rolNombre;
      this.userBodega = bodegaNombre;
      
      // Cerrar el modal
      const modal = document.getElementById('adminModal') as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      
      // Recargar la página para aplicar los cambios
      window.location.reload();
    }
  }

  closeModal() {
    const modal = document.getElementById('adminModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  onLogout(event: Event): void {
    event.preventDefault();
    
    // Guardar el email para usarlo después de limpiar
    const userEmail = localStorage.getItem('username');
    
    // Limpiar todo el localStorage excepto los valores necesarios para la próxima sesión
    const originalIdRol = localStorage.getItem('original_id_rol');
    const originalIdBodega = localStorage.getItem('original_id_bodega');
    
    // Limpiar todo el localStorage
    localStorage.clear();
    
    // Restaurar los valores originales si existen
    if (originalIdRol && originalIdBodega) {
      localStorage.setItem('id_rol', originalIdRol);
      localStorage.setItem('id_bodega', originalIdBodega);
    }
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Cerrar sesión y redirigir al login
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openAdminModal(id_hideRole?: number, id_hideRole2?: number) {
    // Mostrar el spinner de carga
    this.isNavbarLoading = true;
    
    // Resetear el rol seleccionado
    this.selectedRoleId = null;
    this.selectedBodegaId = null;
    this.isFormValid = false;
    
    // Si ya tenemos roles cargados, filtrarlos según sea necesario
    if (this.roles && this.roles.length > 0) {
      this.filterAndShowRoles(id_hideRole, id_hideRole2);
    } else {
      // Si no hay roles cargados, cargarlos primero
      this.loadRolesForNavbar(() => {
        this.filterAndShowRoles(id_hideRole, id_hideRole2);
      });
    }
  }

  // Nuevo método para filtrar roles y mostrar el modal
  private filterAndShowRoles(id_hideRole?: number, id_hideRole2?: number): void {
    // Obtener el ID del rol actual del usuario desde localStorage
    const currentRoleId = parseInt(localStorage.getItem('id_rol') || '0', 10);
    
    // Filtrar roles para excluir el rol actual del usuario
    if (currentRoleId == 4){
      this.modalRoles = this.roles.filter(rol => rol.id !== id_hideRole && rol.id !== id_hideRole2);
    }else{
      this.modalRoles = this.roles.filter(rol => rol.id !== currentRoleId && rol.id !== id_hideRole && rol.id !== id_hideRole2);
    }
    
    // Mostrar el modal
    const modal = document.getElementById('adminModal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
    
    // Ocultar el spinner
    this.isNavbarLoading = false;
  }

  private loadRolesForNavbar(callback?: () => void): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        // Guardar todos los roles para el navbar
        this.roles = roles;
        
        // Si el usuario está autenticado, cargar su información
        if (this.isAuthenticated) {
          this.loadUserInfo();
        }
        
        // Ejecutar el callback si existe
        if (callback) {
          callback();
        }
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });
  }

  private loadTiendaBodegas(): void {
    this.userService.getBodegas().subscribe({
      next: (bodegas: any[]) => {
        // Filtrar solo las bodegas de tienda (excluyendo bodegas especiales)
        this.tiendaBodegas = bodegas.filter(bodega => {
          if (!bodega.id) return false;
          
          const id = bodega.id.toString();
          // Excluir bodegas especiales
          const esBodegaEspecial = [
            '21', '22', '23', 'BC-001', 'BDE-001', 'BV-001', 'LO-000', 'LO000'
          ].includes(id);
          
          return !esBodegaEspecial;
        });
        
        // Si hay una bodega guardada en localStorage, seleccionarla
        const savedBodegaId = localStorage.getItem('id_bodega');
        if (savedBodegaId) {
          this.selectedBodegaId = Number(savedBodegaId);
          
          // Si es una bodega de tienda, actualizar el nombre si es necesario
          if (savedBodegaId !== '21' && savedBodegaId !== '22' && savedBodegaId !== '23') {
            const bodega = this.tiendaBodegas.find(b => b.id.toString() === savedBodegaId);
            if (bodega && !localStorage.getItem('bodega_nombre')) {
              localStorage.setItem('bodega_nombre', bodega.nombre || `Tienda ${savedBodegaId}`);
              this.userBodega = bodega.nombre || `Tienda ${savedBodegaId}`;
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar las bodegas de tienda:', error);
      }
    });
  }

  getLocalStorageItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  onRoleButtonClick(event: Event) {
    event.stopPropagation();
    if (this.isHomePage) {
      this.openAdminModal();
    }
  }

  onRoleButtonHover(hovering: boolean) {
    if (!this.isHomePage) {
      this.isHoveringRoleButton = hovering;
    }
  }
}
