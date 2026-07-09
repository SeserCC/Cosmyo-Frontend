import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Component, HostListener, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { TiempoTranscurridoPipe } from '../../tiempo-transcurrido.pipe';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [RouterLink, TiempoTranscurridoPipe, CommonModule],
  templateUrl: './publicacion.component.html',
  styleUrl: './publicacion.component.css'
})
export class PublicacionComponent implements OnInit {
  publicacion: any;
  carga: boolean = true;
  user_id: number;
  publicaciones: any[] = [];
  usuarioActual: any;
  likes: number[] = [];
  colorLike: boolean[] = [];
  mensajeSesion = '';
  loading = false;
  imagenAmpliada = false;
  anterior: any;
  siguiente: any;
  ocultarDesliz = false;
  esMovil = false;
  /* navegando = false; */
  touchStartX = 0;
  touchEndX = 0;
  touchStartY = 0;
  touchEndY = 0;

  origenX = 0;
  origenY = 0;
  escala = 1;

  // Array con todos los usuarios disponibles (probablemente para asociar autores a imágenes)
  usuarios: any[];

  // Constructor del componente, se inyecta el servicio de login y el router
  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute, private routerR: Router, @Inject(PLATFORM_ID) private platform_id: Object) {
  }

  eliminarMensaje() {
    this.ocultarDesliz = true;
    this.servizo.ocultarMensajeDesliz();
  }

  ampliarImagen() {
    this.imagenAmpliada = !this.imagenAmpliada;
    this.escala = 1;
  }

  siguientePublicacion() {
    /* if (this.navegando) {
      return;
    }

    this.navegando = true; */

    this.routerR.navigate(['/publicacion/' + (this.siguiente.id)])/* .then(() => {
      this.navegando = false;
    }) */;
  }

  anteriorPublicacion() {
    /* if (this.navegando) {
      return;
    }

    this.navegando = true; */

    this.routerR.navigate(['/publicacion/' + (this.anterior.id)])/* .then(() => {
      this.navegando = false;
    }) */;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {

    if (this.carga || this.loading/*  || this.navegando */) {
      return;
    }

    if (event.repeat) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        this.anteriorPublicacion();
        break;

      case 'ArrowRight':
        this.siguientePublicacion();
        break;

      case 'Escape':
        if (this.imagenAmpliada) {
          this.ampliarImagen();
        } else {
          this.routerR.navigate(['/foto']);
        }

        break;
    }
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length > 1) {
      return;
    }

    this.touchStartX = event.changedTouches[0].clientX;
    this.touchStartY = event.changedTouches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;

    this.detectarSwipe();
  }

  detectarSwipe() {

    if (window.visualViewport && window.visualViewport.scale > 1) {
      return;
    }

    const distanciaX = this.touchEndX - this.touchStartX;
    const distanciaY = this.touchEndY - this.touchStartY;

    // Ignorar movimientos pequeños
    if (Math.abs(distanciaX) < 60) {
      return;
    }

    if (1.8 * Math.abs(distanciaY) > Math.abs(distanciaX)) {
      return;
    }

    if (distanciaX < 0) {
      this.siguientePublicacion();
    } else {
      this.anteriorPublicacion();
    }

  }

  zoomImagen(event: WheelEvent) {
    const imagen = event.target as HTMLElement;
    const rect = imagen.getBoundingClientRect();

    // Posición del ratón dentro de la imagen
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convertimos a porcentaje
    this.origenX = (x / rect.width) * 100;
    this.origenY = (y / rect.height) * 100;

    if (event.deltaY < 0) {
      this.escala += 0.06;
    } else {
      this.escala -= 0.06;
    }

    this.escala = Math.max(1, Math.min(this.escala, 7));
  }

  /* Cambiar para mostrar solo una publicacion */
  mostrarPublicacion() {
    this.servizo.mostrarPublicacion(Number(this.router.snapshot.paramMap.get('id'))).subscribe({
      next: (response) => {
        this.publicacion = response.publicacion;
        this.likes = response.likes;
        this.siguiente = response.siguiente;
        this.anterior = response.anterior;
        this.colorLike = response.userActualLike;
        this.publicacionesRelacionadas();
        this.carga = false;
      },
      error: (err) => {
        this.carga = false;
        //console.error('Error al mostrar la publicacion', err);
        this.routerR.navigate(['**']);
      }
    })
  }

  darLike(publicacion_id: number) {
    this.loading = true;
    if (!this.usuarioActual) {
      this.mensajeSesion = 'Primero debes iniciar sesión';
      return;
    }
    const estado = this.colorLike[publicacion_id];

    const likePublicacion = {
      user_id: this.usuarioActual.id,
      publicacion_id: publicacion_id,
      like: !estado,
      _method: "PUT",
    }
    this.servizo.darLike(publicacion_id, likePublicacion).subscribe({
      next: (response) => {
        this.colorLike[publicacion_id] = response.like;
        this.likes[publicacion_id] = response.likes;
        this.loading = false;
      },
      error: (err) => {
        //console.error("Error en el like de la publicacion", err);
        this.loading = false;

      }
    })

  }

  mostrarUsuarios() {
    this.servizo.mostrarUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response;

      },
      error: (err) => {
        //console.error('❌ Error al mostrar los usuarios', err);

      }
    })
  }

  publicacionesRelacionadas() {
    this.servizo.publicacionesRelacionadas(this.publicacion.user_id, this.publicacion.id).subscribe({
      next: (publicaciones) => {
        this.publicaciones = publicaciones.data;
        this.carga = false;
      },

      error: (erro) => {
        //console.error('Error al cargar las publicaciones del usuario', erro);
        this.carga = false;
      }
    })
  }


  // Método que se ejecuta automáticamente al iniciar el componente
  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.mostrarPublicacion();
      this.mostrarUsuarios();
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;
        //console.log(this.usuarioActual);
      });

      this.esMovil = window.innerWidth <= 568;

      this.ocultarDesliz = this.servizo.estadoMensajeDesliz();

      if (this.esMovil) {
        setTimeout(() => {
          this.eliminarMensaje();
        }, 7000);
      }

    }

  }
}
