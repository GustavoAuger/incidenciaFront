import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdministrarUsuariosComponent } from './pages/administrar-usuarios/administrar-usuarios.component';
import { CrearIncidenciaComponent } from './pages/crear-incidencia/crear-incidencia.component';

export const routes: Routes = [

    { path: 'login', component: LoginComponent},
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'crear-incidencia', component: CrearIncidenciaComponent, canActivate: [AuthGuard] },
    { path: 'administrar-usuarios', component: AdministrarUsuariosComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
