import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Usuario } from './usuario';
import { Imagen } from './imagen';
import { BehaviorSubject, find, Observable } from 'rxjs';
import { Foro } from './foro';
import { Comentario } from './comentario';
import { Evento } from './evento';
import { Router } from '@angular/router';


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
  apiBackend: string = 'http://127.0.0.1:8000/api';
  usuarioActual: any; // Usuario actualmente logeado
  tokens$: BehaviorSubject<string>;
  usuarioActual$: BehaviorSubject<any>; // Usuario actualmente logeado

  constructor(private cliente: HttpClient, @Inject(PLATFORM_ID) private plataformId: Object, private router: Router) {
    //this.usuarios$ = new BehaviorSubject(this.usuarios); // Inicializa el BehaviorSubject con la lista de usuarios
    // this.foros$ = new BehaviorSubject(this.foros); // Inicializa el BehaviorSubject con la lista de foros
    // this.comentarios$ = new BehaviorSubject(this.comentarios); // Inicializa el BehaviorSubject con la lista de comentarios
    //this.imagenes$ = new BehaviorSubject(this.imagenes); // Inicializa el BehaviorSubject con la lista de imagenes
    //this.eventos$ = new BehaviorSubject(this.eventos); // Inicializa el BehaviorSubject con la lista de imagenes
    this.usuarioActual$ = new BehaviorSubject(this.usuarioActual);
    this.tokens$ = new BehaviorSubject(this.token);

    // Verifica si el código se ejecuta en el navegador antes de acceder a localStorage
    if (isPlatformBrowser(this.plataformId)) {
      const token = sessionStorage.getItem('token');
      this.token = token ? token : '';
      if (this.token != '') {
        this.usuarioLogueado({
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
          })
        }).subscribe({
          next: (usuario) => {
            this.usuarioActual = usuario;
            this.usuarioActual$.next(usuario);
          },
          error: (err) => {
            console.error('Error al recuperar el usuario:', err);
          }

        })
      }
      this.tokens$.next(this.token);
    }
  }

  registro(body: any, options?: { headers?: HttpHeaders }) {
    return new Observable<any>((observable) => {
      this.cliente.post<any>(this.apiBackend + '/registroAPI', body, options).subscribe({
        next: (response) => {
          this.token = response.accessToken;
          this.tokens$.next(this.token);

          sessionStorage.setItem("token", this.token);

          observable.next(response);
          observable.complete();
        },
        error: (err) => {
          observable.error(err);
        }
      })
    })
  }

  cerrarSesion(body: any, options?: { headers?: HttpHeaders }) {
    return new Observable<any>((observable) => {
      this.cliente.post<any>(this.apiBackend + '/logoutAPI', body, options).subscribe({
        next: (response) => {

          sessionStorage.removeItem('token');
          // this.tokens$.next(this.token);

          observable.next(response);
          observable.complete();
        },
        error: (err) => {
          observable.error(err);
        }
      })
    })
  }

  /* Credenciales */
  login(body: any, options?: { headers?: HttpHeaders }) {
    return new Observable<any>((observable) => {
      this.cliente.post<any>(this.apiBackend + '/loginAPI', body, options).subscribe({
        next: (response) => {
          this.token = response.accessToken;
          this.tokens$.next(this.token);

          sessionStorage.setItem("token", this.token);

          this.usuarioLogueado({
            headers: new HttpHeaders({
              'Authorization': `Bearer ${this.token}`,
              'Accept': 'application/json',
            })
          }).subscribe({
            next: (usuario) => {
              this.usuarioActual = usuario;
              this.usuarioActual$.next(usuario);
              observable.next(response);
              observable.complete();
            }

          })

          observable.next(response);
          observable.complete();
        },
        error: (err) => {
          observable.error(err);
        }
      })
    })

  }

  usuarioLogueado(options?: { headers?: HttpHeaders }) {
    return this.cliente.get(this.apiBackend + "/user", options);
  }

  engadirUsuario(body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/users', body, options);

  }

  // Modificamos os valores indicando ao servidor
  modificarUsuario(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/users/' + id, body, options);

  }

  // Elimina no servidor o usuario cuxo id coindice co parámetro
  eliminarUsuario(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.delete<any>(this.apiBackend + '/users/' + id, options);
  }

  mostrarUsuarios(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/users', options);
  }

  mostrarForos(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/foro', options);
  }

  // Engade un novo foro ao servidor a partir do seu tema e fecha
  engadirForo(body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/foro', body, options);
  }

  // Modificamos os valores indicando ao servidor
  modificarForo(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/foro/' + id, body, options);
  }

  // Elimina no servidor o foro cuxo id coindice co parámetro
  eliminarForo(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.delete<any>(this.apiBackend + '/foro/' + id, options)
  }

  // Engade un novo usuario ao servidor a partir do seu nome, rol y contraseña
  engadirComentario(body: any, options?: { headers?: HttpHeaders }) {
    /* (body); */
    return this.cliente.post<any>(this.apiBackend + '/comentario', body, options);
  }

  mostrarComentarios(page: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/comentario?page=' + page, options);
  }

  mostrarComentariosForos(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/foroComentario/' + id, options);
  }

  // Modificamos os valores indicando ao servidor
  modificarComentario(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/comentario/' + id, body, options);
  }

  // Elimina no servidor o comentario cuxo id coindice co parámetro
  eliminarComentario(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.delete<any>(this.apiBackend + '/comentario/' + id, options);
  }

  /* Crear una nueva publicacion */
  engadirPublicacion(body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/publicacion', body, options);
  }

  // Modificamos os valores indicando ao servidor
  modificarPublicacion(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/publicacion/' + id, body, options);
  }

  mostrarPublicaciones(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/publicacion', options);
  }

  publicacionesUsuario(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/publicaciones/' + id, options);
  }

  buscadorPublicaciones(publicacion: string, options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/buscador?titulo=' + publicacion, options);
  }

  // Elimina no servidor o comentario cuxo id coindice co parámetro
  eliminarPublicacion(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.delete<any>(this.apiBackend + '/publicacion/' + id, options);
  }

  /* Crear una nueva publicacion */
  engadirEvento(body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/evento_calendarios', body, options);
  }

  mostrarEventos(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/evento_calendarios', options);
  }

  // Modificamos os valores indicando ao servidor
  modificarEvento(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/evento_calendarios/' + id, body, options);
  }

  // Elimina no servidor o comentario cuxo id coindice co parámetro
  eliminarEvento(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.delete<any>(this.apiBackend + '/evento_calendarios/' + id, options);
  }

  middlewareAdmin(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/admin/dashboard', options);
  }

  mostrarPlanes(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/plan', options);
  }

  // Modificamos os valores indicando ao servidor
  modificarPlanes(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/plan/' + id, body, options);
  }

  mostrarPerfiles(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/perfil', options);
  }

  mostrarPerfil(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/perfil/' + id, options);
  }

  mostrarPlan(id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/plan/' + id, options);
  }

  // Modificamos os valores indicando ao servidor
  darLike(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/valorar/' + id, body, options);
  }

  // Modificamos os valores indicando ao servidor
  modificarPerfil(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/perfil/' + id, body, options);
  }

  modificarPlan(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/plan/' + id, body, options);
  }

  portalUrl(body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/stripe/portal', body, options);
  }

  accesoPremium(body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.post<any>(this.apiBackend + '/crearSubscrpcion', body, options);
  }

  mostrarLikes(publicacion_id: number, options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/publicacionLikes/' + publicacion_id, options);
  }

  mostrarGratuitos(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/gratuito/', options);
  }

  modificarGratuito(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/gratuito/' + id, body, options);
  }

  mostrarPremiums(options?: { headers?: HttpHeaders }) {
    return this.cliente.get<any>(this.apiBackend + '/premium/', options);
  }

  modificarPremium(id: number, body: any, options?: { headers?: HttpHeaders }) {
    return this.cliente.put<any>(this.apiBackend + '/premium/' + id, body, options);
  }

  /*
  subscribirseComentario$(): Observable<Comentario[]> {
    return this.comentarios$.asObservable();
  } */

}
