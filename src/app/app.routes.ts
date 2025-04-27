import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

    { path: 'login', component: LoginComponent},
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }

];
