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
import { MantenimientoComponent } from './vista-xeral/mantenimiento/mantenimiento.component';
import { mantenimientoGuard } from './mantenimiento.guard';
import { adminGuard } from './admin.guard';
import { AccesoProhibidoComponent } from './vista-xeral/acceso-prohibido/acceso-prohibido.component';
import { NoEncontradaComponent } from './vista-xeral/no-encontrada/no-encontrada.component';
import { PoliticaPrivacidadComponent } from './vista-xeral/politica-privacidad/politica-privacidad.component';
import { AuthCallbackComponent } from './vista-xeral/auth-callback/auth-callback.component';
import { CreacionWebComponent } from './vista-xeral/creacion-web/creacion-web.component';
import { TecnologiasEmpleadasComponent } from './vista-xeral/tecnologias-empleadas/tecnologias-empleadas.component';

export const routes: Routes = [
    { path: "", component: InicioComponent, canActivate: [mantenimientoGuard] },
    { path: "mantenimiento", component: MantenimientoComponent },
    { path: "calendario", component: CalendarioComponent, canActivate: [mantenimientoGuard] },
    { path: "foto", component: FotosVideosComponent, canActivate: [mantenimientoGuard] },
    { path: "debate/:foro_id", component: DebateComponent, canActivate: [mantenimientoGuard] },
    { path: "foro", component: ForoComponent, canActivate: [mantenimientoGuard] },
    { path: "publicaciones/:user_id", component: PublicacionesComponent, canActivate: [mantenimientoGuard] },
    { path: "tipoPlan", component: TipoPlanComponent, canActivate: [mantenimientoGuard] },
    { path: "perfil/:user_id", component: PerfilComponent, canActivate: [mantenimientoGuard] },
    { path: "subirArchivo", component: SubirArchivoComponent, canActivate: [authGuard] },
    { path: "registro", component: RegistroComponent, canActivate: [mantenimientoGuard] },
    { path: "exito", component: ExitoPagoComponent, canActivate: [authGuard] },
    { path: "administracion", component: AdministracionComponent, canActivate: [adminGuard] },
    { path: "login", component: InicioSesionComponent },
    { path: "prohibido", component: AccesoProhibidoComponent },
    { path: "politicaPrivacidad", component: PoliticaPrivacidadComponent },
    { path: "auth-callback", component: AuthCallbackComponent },
    { path: "sobre-nosotros", component: CreacionWebComponent },
    { path: "desarrollo-web", component: TecnologiasEmpleadasComponent },
    { path: "**", component: NoEncontradaComponent },
];