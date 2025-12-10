import { Routes } from '@angular/router';
import { InicioComponent } from './vista-xeral/inicio/inicio.component';
import { CalendarioComponent } from './vista-xeral/calendario/calendario.component';
import { FotosVideosComponent } from './vista-xeral/fotos-videos/fotos-videos.component';
import { DebateComponent } from './vista-xeral/debate/debate.component';
import { ForoComponent } from './vista-xeral/foro/foro.component';
import { PublicacionesComponent } from './vista-xeral/publicaciones/publicaciones.component';
import { TipoPlanComponent } from './vista-xeral/tipo-plan/tipo-plan.component';
import { SubirArchivoComponent } from './vista-xeral/subir-archivo/subir-archivo.component';
import { InicioSesionComponent } from './vista-xeral/inicio-sesion/inicio-sesion.component';
import { AdministracionComponent } from './vista-xeral/administracion/administracion.component';
import { RegistroComponent } from './vista-xeral/registro/registro.component';
import { authGuard } from './auth.guard';
import { PerfilComponent } from './vista-xeral/perfil/perfil.component';
import { ExitoPagoComponent } from './vista-xeral/exitoPago/exitoPago.component';

export const routes: Routes = [
    { path: "portada", component: InicioComponent },
    { path: "calendario", component: CalendarioComponent, canActivate: [authGuard] },
    { path: "foto", component: FotosVideosComponent, canActivate: [authGuard] },
    { path: "debate/:foro_id", component: DebateComponent, canActivate: [authGuard] },
    { path: "foro", component: ForoComponent, canActivate: [authGuard] },
    { path: "publicaciones/:user_id", component: PublicacionesComponent, canActivate: [authGuard] },
    { path: "tipoPlan", component: TipoPlanComponent },
    { path: "perfil/:user_id", component: PerfilComponent },
    { path: "subirArchivo", component: SubirArchivoComponent, canActivate: [authGuard] },
    { path: "registro", component: RegistroComponent },
    { path: "exito", component: ExitoPagoComponent, canActivate: [authGuard] },
    { path: "administracion", component: AdministracionComponent }, //Ruta protegida
    { path: "", component: InicioSesionComponent },
];