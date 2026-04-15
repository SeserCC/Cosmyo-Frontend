import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Comentario } from '../../comentario';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-debate',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './debate.component.html',
  styleUrl: './debate.component.css'
})
export class DebateComponent {
  // Array donde se almacenan todos los comentarios
  comentarios: any[];

  urlImagen = '';

  foro: any

  esconderCheckbox = false;

  mensajeError: any;

  usuarioLogueado: any;

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

  archivoSeleccionado(event: any): void {
    this.archivoSelect = event.target.files[0];
    this.faltaArchivo = false;
  }

  // Método para añadir un nuevo comentario
  engadirComentario() {

    const nuevoComentario = new FormData();
    nuevoComentario.append('texto', this.formularioCRUDComentario.get('texto')?.value);
    nuevoComentario.append('foro_id', String(this.router.snapshot.paramMap.get('foro_id')));

    if (this.archivoSelect) {
      nuevoComentario.append('foto', this.archivoSelect);
    }

    this.servizo.engadirComentario(nuevoComentario, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (comentario) => {
        //Añadimos el tema mediante suscripcion
        this.comentarios.push(comentario);
        this.formularioCRUDComentario.reset();
        this.archivoSelect = null;
      },
      error: (erro) => {
        //console.error('Error al añadir un comentario ', erro);
        if (erro.status == 422) {
          this.mensajeError = erro.error;
        }
      }
    });
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
    /* if (this.comentarioSeleccionar.foto = null) {
      this.esconderCheckbox = true;
    } */
    this.formularioCRUDComentario.patchValue({
      texto: comentario.texto,              // Se carga el texto del comentario en el formulario
    });
  }

  // Método para guardar los cambios del comentario editado
  modificarComentario() {
    this.cambiar = false;

    const modificarComentario = new FormData();

    if (this.comentarioSeleccionar) {

      if (this.archivoSelect) {
        modificarComentario.append('foto', this.archivoSelect);
      }

      if (this.formularioCRUDComentario.value.eliminarImagen) {
        modificarComentario.append('eliminarImagen', 'true');

      }

      modificarComentario.append('texto', this.formularioCRUDComentario.get('texto')?.value);
      modificarComentario.append('foro_id', String(this.router.snapshot.paramMap.get('foro_id')));
      modificarComentario.append('_method', 'PUT');

      // Llamamos al servicio para modificar
      this.servizo.modificarComentario(this.comentarioSeleccionar.id, modificarComentario, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        })
      }).subscribe({
        next: (response) => {
          this.comentarioSeleccionar.foro_id = String(this.router.snapshot.paramMap.get('foro_id'));
          this.comentarioSeleccionar.texto = this.formularioCRUDComentario.get('texto')?.value;
          if (response.foto) {
            this.comentarioSeleccionar.foto = response.foto;
          }
          this.formularioCRUDComentario.reset(); // Limpiamos el formulario
        },
        error: (erro) => {
          //console.error("Error al modificar del comentario", erro)
        }

      });
    }
  }

  // Método para eliminar un comentario por su ID
  eliminarComentario(id: number) {
    this.servizo.eliminarComentario(id, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      })
    }).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.comentarios = this.comentarios.filter(comentario => comentario.id !== id);
      },
      error: (erro) => {
        //console.error(erro)

      }
    });
  }

  /* mostrarComentarios(page: number) {

    this.servizo.mostrarComentarios(page, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
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

    this.servizo.mostrarComentariosForos(Number(this.router.snapshot.paramMap.get('foro_id')), {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.comentarios = response.comentarios.data;
        this.foro = response.foro;

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
