import { Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Imagen } from '../../imagen';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { TiempoTranscurridoPipe } from '../../tiempo-transcurrido.pipe';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, TiempoTranscurridoPipe],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css'
})
export class PublicacionesComponent implements OnInit {

  // Array que almacena las publicaciones
  publicaciones: any[];

  perfil: any;

  // Publicación seleccionada para edición o visualización
  publicacionSeleccionar: any;
  user_id: number;

  // Usuario actualmente seleccionado o autenticado
  usuarioSeleccionar: any;

  carga: boolean = true;

  usuarioPublicacionName: any;

  usuarioActual: any;

  mensajeError: any;

  // Archivo seleccionado para subir o modificar la publicación
  archivoSelect: File | null = null;

  // Controla si falta un archivo al intentar modificar o añadir
  faltaArchivo: boolean = false;

  // Controla cambios para mostrar/ocultar formularios
  cambiar: boolean = false;

  // Formulario reactivo para crear o editar una imagen/publicación
  formularioCRUDImagen: FormGroup;

  loading = false;

  location = inject(Location);

  // Constructor donde se inicializa el formulario con sus controles y validaciones
  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {
    this.formularioCRUDImagen = new FormGroup({
      titulo: new FormControl('', [Validators.required, Validators.maxLength(124)]),      // Campo obligatorio para el título
      descripcion: new FormControl('', [Validators.required]),  // Campo obligatorio para la descripción
      zona_geografica: new FormControl('', [Validators.required, Validators.maxLength(79)])
    });
  }

  volver() {
    this.location.back()
  }

  // Método que se ejecuta cuando se selecciona un archivo desde el input file
  archivoSeleccionado(event: any): void {
    this.archivoSelect = event.target.files[0];  // Se guarda el archivo seleccionado    
  }

  // Método para cancelar la edición o creación, reseteando el formulario y la UI
  cancelar(formulario: FormGroup) {
    this.cambiar = false;
    this.mensajeError = null;     // Cambiamos el estado para ocultar el formulario o indicar cancelación
    formulario.reset();       // Reseteamos el formulario a valores iniciales
  }

  // Método para iniciar la edición de una publicación
  editarPublicacion(publicacion: any) {
    this.cambiar = true;     // Cambiamos estado para mostrar el formulario o la UI de edición      

    setTimeout(() => {
      document.getElementById('publicacion_editar')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    });
    
    this.publicacionSeleccionar = publicacion;  // Guardamos la publicación a editar
    // Rellenamos el formulario con los valores actuales de la publicación
    this.formularioCRUDImagen.patchValue({
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      zona_geografica: publicacion.zona_geografica == "undefined" ? '' : publicacion.zona_geografica,
    });

    this.archivoSelect = null;

  }

  // Método para modificar una publicación existente
  modificarPublicacion() {
    this.loading = true;
    this.carga = true;

    if (this.publicacionSeleccionar) {
      let video = this.archivoSelect;

      this.publicacionSeleccionar.titulo = this.formularioCRUDImagen.get('titulo')?.value;
      this.publicacionSeleccionar.descripcion = this.formularioCRUDImagen.get('descripcion')?.value;
      this.publicacionSeleccionar.zona_geografica = this.formularioCRUDImagen.get('zona_geografica')?.value;

      if (video) {
        this.servizo.recibirFirma().subscribe((firma: any) => {
          this.servizo.subirVideo(video, firma).subscribe({
            next: (data: any) => {
              const publicacionMultimedia = {
                ...this.publicacionSeleccionar,
                imagen: data.secure_url,
                public_id: data.public_id,
                bytes: data.bytes,
                resource_type: data.resource_type,
              };

              this.servizo.modificarPublicacion(this.publicacionSeleccionar.id, publicacionMultimedia).subscribe({
                next: (response) => {
                  /* console.log(response) */
                  this.publicacionSeleccionar.titulo = this.formularioCRUDImagen.get('titulo')?.value;
                  this.publicacionSeleccionar.descripcion = this.formularioCRUDImagen.get('descripcion')?.value;
                  this.publicacionSeleccionar.zona_geografica = this.formularioCRUDImagen.get('zona_geografica')?.value;
                  this.publicacionSeleccionar.imagen = response.imagen;
                  this.publicacionSeleccionar.public_id = response.public_id;
                  this.formularioCRUDImagen.reset();
                  this.cambiar = false;
                  this.loading = false;
                  this.carga = false;
                },
                error: (erro) => {
                  //console.error("Error al modificar la publicacion", erro)
                  this.loading = false;
                  this.carga = false;
                  if (erro.status == 422) {
                    this.mensajeError = erro.error.message;
                  }
                }

              });
            },
            error: (erro) => {
              /* console.error(erro); */
              if (erro.status == 400 || erro.status == 413) {
                this.mensajeError = 'El archivo supera el tamaño máximo permitido.';
              }
              this.archivoSelect = null;
              this.loading = false;
              this.carga = false;
            }
          })
        })

      } else {
        this.servizo.modificarPublicacion(this.publicacionSeleccionar.id, this.publicacionSeleccionar).subscribe({
          next: (response) => {
            /* console.log(response) */
            this.publicacionSeleccionar.imagen = response.imagen;
            this.publicacionSeleccionar.public_id = response.public_id;
            this.formularioCRUDImagen.reset();
            this.archivoSelect = null;
            this.cambiar = false;
            this.loading = false;
            this.carga = false;
          },
          error: (erro) => {
            //console.error("Error al modificar la publicacion", erro)
            this.loading = false;
            this.carga = false;
            this.archivoSelect = null;
            if (erro.status == 422) {
              this.mensajeError = erro.error;
            }
          }

        });
      }

    }
  }



  // Método para eliminar una publicación por su ID
  eliminarPublicacion(id: number) {
    this.carga = true;
    this.servizo.eliminarPublicacion(id).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.publicaciones = this.publicaciones.filter(publicacion => publicacion.id !== id);
        this.carga = false;

      },
      error: (erro) => {
        this.carga = false;
        //console.error(erro)

      }
    });
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;
      });

      this.router.params.pipe(
        switchMap(params => {
          return this.servizo.publicacionesUsuario(params['user_id']);
        })
      ).subscribe(response => {
        this.user_id = Number(this.router.snapshot.paramMap.get('user_id'));
        this.publicaciones = response.publicaciones;
        this.perfil = response.perfil;
        this.carga = false;

        this.publicaciones.forEach((pub) => {
          this.usuarioPublicacionName = pub.users.name
        })
      })

    }
  }

}
