import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdministrarUsuariosComponent } from './pages/administrar-usuarios/administrar-usuarios.component';
import { CrearIncidenciaComponent } from './pages/crear-incidencia/crear-incidencia.component';
import { CrearDetalleIncidenciaComponent } from './pages/crear-detalle-incidencia/crear-detalle-incidencia.component';
import { VerIncidenciasComponent } from './pages/ver-incidencias/ver-incidencias.component';
import { RolCrearGuard } from './guards/rol-crear.guard';
import { RolAdministrarGuard } from './guards/rol-administrar.guard';
import { LoginGuard } from './guards/login.guard';
import { ResolverIncidenciasComponent } from './pages/resolver-incidencias/resolver-incidencias.component';
import { RolResolverGuard } from './guards/rol-resolver.guard';
import { ReclamoTransportistaComponent } from './pages/reclamo-transportista/reclamo-transportista.component';

export const routes: Routes = [
    { 
        path: 'login', 
        component: LoginComponent,
        canActivate: [LoginGuard] 
    },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'crear-incidencia', component: CrearIncidenciaComponent, canActivate: [AuthGuard, RolCrearGuard] },
    { path: 'crear-detalle-incidencia', component: CrearDetalleIncidenciaComponent, canActivate: [AuthGuard, RolCrearGuard] },
    { path: 'administrar-usuarios', component: AdministrarUsuariosComponent, canActivate: [AuthGuard, RolAdministrarGuard] }, 
    { path: 'ver-incidencias', component: VerIncidenciasComponent, canActivate: [AuthGuard] },
    { path: 'resolver-incidencias', component: ResolverIncidenciasComponent, canActivate: [AuthGuard, RolResolverGuard] },
    { path: 'reclamo-transportista', component: ReclamoTransportistaComponent, canActivate: [AuthGuard]},
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
