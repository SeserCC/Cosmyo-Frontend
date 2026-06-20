import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Comentario } from '../../comentario';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { TiempoTranscurridoPipe } from '../../tiempo-transcurrido.pipe';

@Component({
  selector: 'app-debate',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, TiempoTranscurridoPipe],
  templateUrl: './debate.component.html',
  styleUrl: './debate.component.css'
})
export class DebateComponent {
  // Array donde se almacenan todos los comentarios
  comentarios: any[];

  urlMultimedia = '';

  foro: any

  fotoPerfil: any;

  mostrarMas: number | null;

  esconderCheckbox = false;

  mensajeError: any;

  usuarioLogueado: any;

  carga: boolean = true;

  paginas: number[] = [];

  paginaActual: number;

  paginasTotales: number;

  // Comentario actualmente seleccionado para editar
  comentarioSeleccionar: any;

  // Array donde se almacenan todos los usuarios
  usuarios: any[];

  archivoSelect: File | null;

  menuAbierto: number | null = null;

  // Usuario actualmente autenticado o seleccionado
  usuarioSeleccionar: any;

  // Bandera que indica si estamos en modo edición
  cambiar: boolean = false;

  // Formulario reactivo para crear/modificar comentarios
  formularioCRUDComentario: FormGroup;

  faltaArchivo: boolean = false;

  loading = false;

  loadingEliminar: number | null = null;

  // Constructor del componente, se inyecta el servicio y se inicializa el formulario
  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {
    this.formularioCRUDComentario = new FormGroup({
      texto: new FormControl('', [Validators.required]), // Campo obligatorio para el texto del comentario
      eliminarImagen: new FormControl(false) // Campo para eliminar la imagen
    });
  }

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  reducirInfo(id: number) {
    if (this.mostrarMas == id) {
      this.mostrarMas = null
    } else {
      this.mostrarMas = id;
    }

  }

  archivoSeleccionado(event: any): void {
    this.archivoSelect = event.target.files[0];
    this.faltaArchivo = false;
  }

  engadirComentario(fileInput?: HTMLInputElement) {
    this.loading = true;
    let video = this.archivoSelect;
    if (video?.type.startsWith('video/')) {
      let limiteVideo = 100 * 1024 * 1024;
      if (video.size > limiteVideo) {
        this.loading = false;
        this.mensajeError = "El video supera el tamaño máximo permitido: 100 MB";
        return;
      }
    }

    let nuevoComentario = {
      texto: this.formularioCRUDComentario.get('texto')?.value,
      foro_id: String(this.router.snapshot.paramMap.get('foro_id')),
      user: this.usuarioLogueado
    }

    if (video) {
      this.servizo.recibirFirma().subscribe((firma: any) => {

        this.servizo.subirVideo(video, firma).subscribe({
          next: (data: any) => {
            const comentarioMultimedia = {
              ...nuevoComentario,
              foto: data.secure_url,
              public_id: data.public_id,
              bytes: data.bytes,
              resource_type: data.resource_type,
            };

            this.servizo.engadirComentario(comentarioMultimedia).subscribe({
              next: (comentario) => {
                this.comentarios.push(comentario);
                this.formularioCRUDComentario.reset();
                if (fileInput) {
                  fileInput.value = '';
                }
                this.loading = false;

              },

              error: (erro) => {
                //console.error('Error al añadir un comentario ', erro);
                this.loading = false;
                if (erro.status == 422) {
                  this.mensajeError = erro.error.message;
                }
              }
            })
          },
          error: (erro) => {
            /* console.error(erro); */
            if (erro.status == 400 || erro.status == 413) {
              this.mensajeError = 'El archivo supera el tamaño máximo permitido.';
            }
            this.loading = false;
          }
        });
      })
    } else {
      this.servizo.engadirComentario(nuevoComentario).subscribe({
        next: (comentario) => {
          this.comentarios.push(comentario);
          this.formularioCRUDComentario.reset();
          this.loading = false;

        },
        error: (erro) => {
          //console.error('Error al añadir un comentario ', erro);
          this.loading = false;
          if (erro.status == 422) {
            this.mensajeError = erro.error.message;
          }
        }
      })
    }


  }


  // Método para cancelar una edición y limpiar el formulario
  cancelar(formulario: FormGroup, fileInput?: HTMLInputElement) {
    // Se sale del modo edición
    this.cambiar = false;
    if (fileInput) {
      fileInput.value = '';
    }

    formulario.reset();// Se limpia el formulario
  }

  // Método para cargar los datos de un comentario en el formulario (modo edición)
  editarComentario(comentario: any) {
    this.cambiar = true;                     // Se activa el modo edición
    this.comentarioSeleccionar = comentario; // Se guarda el comentario seleccionado
    this.formularioCRUDComentario.patchValue({
      texto: comentario.texto,              // Se carga el texto del comentario en el formulario
    });
  }

  // Método para guardar los cambios del comentario editado
  modificarComentario(fileInput?: HTMLInputElement) {
    this.cambiar = false;
    this.loading = true;

    this.comentarioSeleccionar.eliminarImagen = this.formularioCRUDComentario.get('eliminarImagen')?.value;

    if (this.comentarioSeleccionar) {

      let video = this.archivoSelect;
      if (video?.type.startsWith('video/')) {
        let limiteVideo = 100 * 1024 * 1024;
        if (video.size > limiteVideo) {
          this.loading = false;
          this.mensajeError = "El video supera el tamaño máximo permitido: 100 MB";
          return;
        }
      }

      this.comentarioSeleccionar.texto = this.formularioCRUDComentario.get('texto')?.value;
      this.comentarioSeleccionar.foro_id = String(this.router.snapshot.paramMap.get('foro_id'));

      if (video) {
        this.servizo.recibirFirma().subscribe((firma: any) => {

          this.servizo.subirVideo(video, firma).subscribe({
            next: (data: any) => {
              const comentarioMultimedia = {
                ...this.comentarioSeleccionar,
                foto: data.secure_url,
                public_id: data.public_id,
                bytes: data.bytes,
                resource_type: data.resource_type,
              };

              this.servizo.modificarComentario(this.comentarioSeleccionar.id, comentarioMultimedia).subscribe({
                next: (data) => {
                  comentarioMultimedia.foro_id = String(this.router.snapshot.paramMap.get('foro_id'));
                  comentarioMultimedia.texto = this.formularioCRUDComentario.get('texto')?.value;
                  this.formularioCRUDComentario.get('eliminarImagen')?.setValue(false);
                  if (data.foto) {
                    this.comentarioSeleccionar.foto = data.foto;
                  }
                  this.formularioCRUDComentario.reset();
                  if (fileInput) {
                    fileInput.value = '';
                  }
                  this.loading = false;
                  this.archivoSelect = null;
                },

                error: (erro) => {
                  this.formularioCRUDComentario.get('eliminarImagen')?.setValue(false);
                  //console.error('Error al añadir un comentario ', erro);
                  this.loading = false;
                  if (erro.status == 422) {
                    this.mensajeError = erro.error.message;
                  }
                  if (fileInput) {
                    fileInput.value = '';
                  }
                  this.archivoSelect = null;
                }
              })
            },
            error: (erro) => {
              this.formularioCRUDComentario.get('eliminarImagen')?.setValue(false);
              /* console.error(erro); */
              if (erro.status == 400 || erro.status == 413) {
                this.mensajeError = 'El archivo supera el tamaño máximo permitido.';
              }
              if (fileInput) {
                fileInput.value = '';
              }
              this.archivoSelect = null;
              this.loading = false;
            }
          });
        })
      } else {
        this.servizo.modificarComentario(this.comentarioSeleccionar.id, this.comentarioSeleccionar).subscribe({
          next: () => {

            if (this.formularioCRUDComentario.get('eliminarImagen')?.value == true) {
              this.comentarioSeleccionar.foto = null;
            }
            this.formularioCRUDComentario.get('eliminarImagen')?.setValue(false);


            if (fileInput) {
              fileInput.value = '';
            }
            this.archivoSelect = null;

            this.formularioCRUDComentario.reset();
            this.loading = false;
          },
          error: (erro) => {
            this.formularioCRUDComentario.get('eliminarImagen')?.setValue(false);
            /* console.error('Error al editar el comentario ', erro); */
            this.loading = false;
            if (erro.status == 422) {
              this.mensajeError = erro.error.message;
            }
            if (fileInput) {
              fileInput.value = '';
            }
            this.archivoSelect = null;
          }
        })
      }
    }
  }

  // Método para eliminar un comentario por su ID
  eliminarComentario(id: number) {
    this.loadingEliminar = id;

    this.servizo.eliminarComentario(id).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.comentarios = this.comentarios.filter(comentario => comentario.id !== id);
        this.loadingEliminar = null;

      },
      error: (erro) => {
        this.loadingEliminar = null;
        //console.error(erro)

      }
    });
  }

  /* mostrarComentarios(page: number) {
 
    this.servizo.mostrarComentarios(page).subscribe({
      next: (response) => {
        this.comentarios = response.data;
        this.paginaActual = response.current_page;
        this.paginasTotales = response.last_page;
 
        this.paginas = [];
        for (let i = 1; i <= this.paginasTotales; i++) {
          this.paginas.push(i);
        }
 
      },
      error: (err) => {
        //console.error('❌ Error al mostrar los comentarios', err);
        //Mensaje de error
      }
    })
  } */

  mostrarComentariosForos() {

    this.servizo.mostrarComentariosForos(Number(this.router.snapshot.paramMap.get('foro_id'))).subscribe({
      next: (response) => {
        this.comentarios = response.comentarios.data;
        this.foro = response.foro;
        this.carga = false;
        /* (this.comentarios); */
        /* this.paginaActual = response.current_page;
        this.paginasTotales = response.last_page; */

        /* this.paginas = [];
        for (let i = 1; i <= this.paginasTotales; i++) {
          this.paginas.push(i);
        } */

      },
      error: (err) => {
        //console.error('❌ Error al mostrar los comentarios', err);
      }
    })
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.mostrarComentariosForos();
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioLogueado = usuario;
      });
    }
  }

}
