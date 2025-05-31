import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { CrearDetalleIncidenciaGuard } from './guards/crear-detalle-incidencia.guard';
import { AdministrarUsuariosComponent } from './pages/administrar-usuarios/administrar-usuarios.component';
import { CrearIncidenciaComponent } from './pages/crear-incidencia/crear-incidencia.component';
import { CrearDetalleIncidenciaComponent } from './pages/crear-detalle-incidencia/crear-detalle-incidencia.component';
import { VerIncidenciasComponent } from './pages/ver-incidencias/ver-incidencias.component';
import { IncidenciasSinResolverComponent } from './pages/incidencias-sin-resolver/incidencias-sin-resolver.component';
import { IncidenciasConReclamoComponent } from './pages/incidencias-con-reclamo/incidencias-con-reclamo.component';

export const routes: Routes = [

    { path: 'login', component: LoginComponent},
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'crear-incidencia', component: CrearIncidenciaComponent, canActivate: [AuthGuard] },
    { path: 'crear-detalle-incidencia', component: CrearDetalleIncidenciaComponent, canActivate: [AuthGuard] },
    { path: 'administrar-usuarios', component: AdministrarUsuariosComponent, canActivate: [AuthGuard] }, 
    { path: 'ver-incidencias', component: VerIncidenciasComponent, canActivate: [AuthGuard] },
    { path: 'incidencias-sin-resolver', component: IncidenciasSinResolverComponent, canActivate: [AuthGuard] },
    { path: 'incidencias-con-reclamo', component: IncidenciasConReclamoComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
