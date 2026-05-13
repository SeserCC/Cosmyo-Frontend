import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Usuario } from './usuario';
import { Imagen } from './imagen';
import { BehaviorSubject, catchError, delay, finalize, find, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { Foro } from './foro';
import { Comentario } from './comentario';
import { Evento } from './evento';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ServizoLoginService {
  //foros: Foro[] = []; // Array que almacena los foros
  //usuarios: Usuario[] = []; // Array que almacena los usuarios
  //imagenes: Imagen[] = []; // Array que almacena las imagenes
  //comentarios: Comentario[] = []; // Array que almacena los comentarios
  //eventos: Evento[] = []; // Array que almacena los eventos
  //foros$: BehaviorSubject<Foro[]>; // Observable para reaccionar a cambios en la lista de foros
  //comentarios$: BehaviorSubject<Comentario[]>; // Observable para reaccionar a cambios en la lista de comentarios
  /* usuarios$: BehaviorSubject<Usuario[]>; // Observable para reaccionar a cambios en la lista de usuarios
  imagenes$: BehaviorSubject<Imagen[]>; // Observable para reaccionar a cambios en la lista de imagenes
  eventos$: BehaviorSubject<Evento[]>; */ // Observable para reaccionar a cambios en la lista de imagenes
  token = ''; // String para almacenar tokens
  apiURL: string = 'https://67bf735ab2320ee05013c327.mockapi.io/usuarios';
  apiURLcomentario: string = 'https://682f73b7f504aa3c70f41673.mockapi.io/comentarios';
  apiBackend: string = environment.apiBackend;
  usuarioActual: any; // Usuario actualmente logeado
  planActual: any; // Usuario actualmente logeado
  tokens$: BehaviorSubject<string>;
  usuarioActual$: BehaviorSubject<any>; // Usuario actualmente logeado
  planActual$: BehaviorSubject<any>; // Usuario actualmente logeado
  sesionCargada$: BehaviorSubject<any>; // Comprobacion de la sesion
  cargando$: BehaviorSubject<boolean>; // Comprobacion de la sesion

  constructor(private cliente: HttpClient, @Inject(PLATFORM_ID) private plataformId: Object, private router: Router) {
    //this.usuarios$ = new BehaviorSubject(this.usuarios); // Inicializa el BehaviorSubject con la lista de usuarios
    // this.foros$ = new BehaviorSubject(this.foros); // Inicializa el BehaviorSubject con la lista de foros
    // this.comentarios$ = new BehaviorSubject(this.comentarios); // Inicializa el BehaviorSubject con la lista de comentarios
    //this.imagenes$ = new BehaviorSubject(this.imagenes); // Inicializa el BehaviorSubject con la lista de imagenes
    //this.eventos$ = new BehaviorSubject(this.eventos); // Inicializa el BehaviorSubject con la lista de imagenes
    this.usuarioActual$ = new BehaviorSubject(this.usuarioActual);
    /* this.planActual$ = new BehaviorSubject(this.planActual); */
    this.sesionCargada$ = new BehaviorSubject<boolean>(false);
    this.cargando$ = new BehaviorSubject<boolean>(false);
    this.tokens$ = new BehaviorSubject(this.token);

    // Verifica si el código se ejecuta en el navegador antes de acceder a localStorage
    if (isPlatformBrowser(this.plataformId)) {
      this.token = localStorage.getItem('token') ?? '';
      this.tokens$.next(this.token);

    }
  }

  registro(body: any) {
    return new Observable<any>((observable) => {
      this.cliente.post<any>(this.apiBackend + '/registroAPI', body).subscribe({
        next: (response) => {
          this.token = response.accessToken;
          this.usuarioActual = response.user;
          this.tokens$.next(this.token);

          this.usuarioActual$.next(this.usuarioActual);
          localStorage.setItem("token", this.token);

          observable.next(response);
          observable.complete();
        },
        error: (err) => {
          observable.error(err);
        }
      })
    })
  }

  cerrarSesion(body: any) {
    return new Observable<any>((observable) => {
      this.cliente.post<any>(this.apiBackend + '/logoutAPI', body).subscribe({
        next: (response) => {

          localStorage.removeItem('token');
          this.usuarioActual$.next(null);

          observable.next(response);
          observable.complete();
        },
        error: (err) => {
          observable.error(err);
        },

      })
    })
  }

  /* Credenciales */
  login(body: any) {
    return new Observable<any>((observable) => {
      this.cliente.post<any>(this.apiBackend + '/loginAPI', body).subscribe({
        next: (response) => {
          this.token = response.accessToken;
          this.tokens$.next(this.token);
          /* this.planActual = response.plan;
          this.planActual$.next(response.plan); */

          localStorage.setItem("token", this.token);

          this.usuarioLogueado().subscribe({
            next: (usuario) => {
              this.usuarioActual = usuario;
              this.usuarioActual$.next(usuario);
              observable.next(response);
              observable.complete();
            }

          })

        },
        error: (err) => {
          observable.error(err);
        }
      })
    })

  }

  guardarToken(token: string) {
    this.tokens$.next(token);
    localStorage.setItem('token', token);
  }

  cargarSesion() {

    return this.usuarioLogueado().pipe(
      /* switchMap((user: any) => {
        return forkJoin({
          user: of(user),
          plan: this.mostrarPlan(user?.id),

        })
      }), */
      tap(data => {
        this.usuarioActual$.next(data);
      }),
      catchError(() => {
        this.usuarioActual$.next(null);
        return of(null);
      }),
      finalize(() => {
        this.sesionCargada$.next(true);
      })
    )

  }

  usuarioLogueado() {
    return this.cliente.get(this.apiBackend + "/user");
  }

  engadirUsuario(body: any) {
    return this.cliente.post<any>(this.apiBackend + '/users', body);

  }

  // Modificamos os valores indicando ao servidor
  modificarUsuario(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/users/' + id, body);

  }

  // Elimina no servidor o usuario cuxo id coindice co parámetro
  eliminarUsuario(id: number) {
    return this.cliente.delete<any>(this.apiBackend + '/users/' + id);
  }

  eliminarUsuarioActual() {
    this.usuarioActual$.next(null);
    localStorage.removeItem('token');
    return this.cliente.delete<any>(this.apiBackend + '/destroyUser');
  }

  mostrarUsuarios() {
    return this.cliente.get<any>(this.apiBackend + '/users');
  }

  mostrarForos() {
    return this.cliente.get<any>(this.apiBackend + '/foro');
  }

  // Engade un novo foro ao servidor a partir do seu tema e fecha
  engadirForo(body: any) {
    return this.cliente.post<any>(this.apiBackend + '/foro', body);
  }

  // Modificamos os valores indicando ao servidor
  modificarForo(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/foro/' + id, body);
  }

  // Elimina no servidor o foro cuxo id coindice co parámetro
  eliminarForo(id: number) {
    return this.cliente.delete<any>(this.apiBackend + '/foro/' + id)
  }

  // Engade un novo usuario ao servidor a partir do seu nome, rol y contraseña
  engadirComentario(body: any) {
    /* (body); */
    return this.cliente.post<any>(this.apiBackend + '/comentario', body);
  }

  mostrarComentarios(page: number) {
    return this.cliente.get<any>(this.apiBackend + '/comentario?page=' + page);
  }

  mostrarComentariosForos(id: number) {
    return this.cliente.get<any>(this.apiBackend + '/foroComentario/' + id);
  }

  // Modificamos os valores indicando ao servidor
  modificarComentario(id: number, body: any) {
    return this.cliente.post<any>(this.apiBackend + '/comentario/' + id, body);
  }

  // Elimina no servidor o comentario cuxo id coindice co parámetro
  eliminarComentario(id: number) {
    return this.cliente.delete<any>(this.apiBackend + '/comentario/' + id);
  }

  /* Crear una nueva publicacion */
  engadirPublicacion(body: any) {
    return this.cliente.post<any>(this.apiBackend + '/publicacion', body);
  }

  // Modificamos os valores indicando ao servidor
  modificarPublicacion(id: number, body: any) {
    return this.cliente.post<any>(this.apiBackend + '/publicacion/' + id, body);
  }

  mostrarPublicaciones() {
    return this.cliente.get<any>(this.apiBackend + '/publicacion');
  }

  publicacionesUsuario(id: number) {
    return this.cliente.get<any>(this.apiBackend + '/publicaciones/' + id);
  }

  buscadorPublicaciones(publicacion: string) {
    return this.cliente.get<any>(this.apiBackend + '/buscador?titulo=' + publicacion);
  }

  // Elimina no servidor o comentario cuxo id coindice co parámetro
  eliminarPublicacion(id: number) {
    return this.cliente.delete<any>(this.apiBackend + '/publicacion/' + id);
  }

  /* Crear una nueva publicacion */
  engadirEvento(body: any) {
    return this.cliente.post<any>(this.apiBackend + '/evento_calendarios', body);
  }

  mostrarEventos() {
    return this.cliente.get<any>(this.apiBackend + '/evento_calendarios');
  }

  // Modificamos os valores indicando ao servidor
  modificarEvento(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/evento_calendarios/' + id, body);
  }

  // Elimina no servidor o comentario cuxo id coindice co parámetro
  eliminarEvento(id: number) {
    return this.cliente.delete<any>(this.apiBackend + '/evento_calendarios/' + id);
  }

  mostrarPlanes() {
    return this.cliente.get<any>(this.apiBackend + '/plan');
  }

  // Modificamos os valores indicando ao servidor
  modificarPlanes(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/plan/' + id, body);
  }

  mostrarPerfiles() {
    return this.cliente.get<any>(this.apiBackend + '/perfil');
  }

  mostrarPerfil(id: number) {
    return this.cliente.get<any>(this.apiBackend + '/perfil/' + id);
  }

  mostrarPlan(id: number) {
    return this.cliente.get<any>(this.apiBackend + '/plan/' + id);
  }

  // Modificamos os valores indicando ao servidor
  darLike(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/valorar/' + id, body);
  }

  // Modificamos os valores indicando ao servidor
  modificarPerfil(id: number, body: any) {
    return this.cliente.post<any>(this.apiBackend + '/perfil/' + id, body);
  }

  modificarPlan(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/plan/' + id, body);
  }

  portalUrl(body: any) {
    return this.cliente.post<any>(this.apiBackend + '/stripe/portal', body);
  }

  accesoPremium(body: any) {
    return this.cliente.post<any>(this.apiBackend + '/crearSubscrpcion', body);
  }

  mostrarLikes(publicacion_id: number) {
    return this.cliente.get<any>(this.apiBackend + '/publicacionLikes/' + publicacion_id);
  }

  mostrarGratuitos() {
    return this.cliente.get<any>(this.apiBackend + '/gratuito');
  }

  modificarGratuito(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/gratuito/' + id, body);
  }

  mostrarPremiums() {
    return this.cliente.get<any>(this.apiBackend + '/premium');
  }

  modificarPremium(id: number, body: any) {
    return this.cliente.put<any>(this.apiBackend + '/premium/' + id, body);
  }

  mostrarEstado() {
    return this.cliente.get<any>(this.apiBackend + '/estado');
  }

  middlewareAdmin() {
    return this.cliente.get<any>(this.apiBackend + '/admin/dashboard');
  }

  mesActual() {
    return this.cliente.get<any>(this.apiBackend + '/mesActual');
  }

  /*
  subscribirseComentario$(): Observable<Comentario[]> {
    return this.comentarios$.asObservable();
  } */

}
