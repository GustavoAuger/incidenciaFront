import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdministrarUsuariosComponent } from './pages/administrar-usuarios/administrar-usuarios.component';
import { VerIncidenciasComponent } from './pages/ver-incidencias/ver-incidencias.component';

export const routes: Routes = [

    { path: 'login', component: LoginComponent},
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'administrar-usuarios', component: AdministrarUsuariosComponent, canActivate: [AuthGuard] },
    { path: 'ver-incidencias', component: VerIncidenciasComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
