import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Imagen } from '../../imagen';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css'
})
export class PublicacionesComponent implements OnInit {
  publicacionFoto = "http://localhost:8000/img/publicaciones/";

  // Array que almacena las publicaciones
  publicaciones: any[];

  // Publicación seleccionada para edición o visualización
  publicacionSeleccionar: any;
  user_id: number;

  // Usuario actualmente seleccionado o autenticado
  usuarioSeleccionar: any;

  usuarioPublicacionName: any;

  // Indica si estamos en modo edición
  edicion: boolean = false;

  usuarioActual: any;

  // Archivo seleccionado para subir o modificar la publicación
  archivoSelect: File | null = null;

  // Controla si falta un archivo al intentar modificar o añadir
  faltaArchivo: boolean = false;

  // Controla cambios para mostrar/ocultar formularios
  cambiar: boolean = false;

  // Formulario reactivo para crear o editar una imagen/publicación
  formularioCRUDImagen: FormGroup;

  // Constructor donde se inicializa el formulario con sus controles y validaciones
  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute) {
    this.formularioCRUDImagen = new FormGroup({
      titulo: new FormControl('', [Validators.required]),      // Campo obligatorio para el título
      descripcion: new FormControl('', [Validators.required]),  // Campo obligatorio para la descripción
      zona_geografica: new FormControl('', [Validators.required])
    });
  }

  usuarioLogueado() {
    this.servizo.usuarioLogueado({
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      })
    }).subscribe(usuario => {
      this.usuarioActual = usuario;
    })
  }

  // Método que se ejecuta cuando se selecciona un archivo desde el input file
  archivoSeleccionado(event: any): void {
    this.archivoSelect = event.target.files[0];  // Se guarda el archivo seleccionado
    this.faltaArchivo = false;                    // Se resetea el flag que indica si falta archivo
  }

  // Método para cancelar la edición o creación, reseteando el formulario y la UI
  cancelar(formulario: FormGroup) {
    this.cambiar = false;     // Cambiamos el estado para ocultar el formulario o indicar cancelación
    formulario.reset();       // Reseteamos el formulario a valores iniciales
  }

  // Método para modificar una publicación existente
  modificarPublicacion() {
    this.cambiar = false;


    const modificarPublicacion = new FormData();

    if (this.publicacionSeleccionar) {

      if (this.archivoSelect) {
        modificarPublicacion.append('imagen', this.archivoSelect);
      }

      modificarPublicacion.append('titulo', this.formularioCRUDImagen.get('titulo')?.value);
      modificarPublicacion.append('descripcion', this.formularioCRUDImagen.get('descripcion')?.value);
      modificarPublicacion.append('zona_geografica', this.formularioCRUDImagen.get('zona_geografica')?.value);
      modificarPublicacion.append('_method', 'PUT');

      // Llamamos al servicio para modificar
      this.servizo.modificarPublicacion(this.publicacionSeleccionar.id, modificarPublicacion, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        })
      }).subscribe({
        next: (response) => {
          this.publicacionSeleccionar.titulo = this.formularioCRUDImagen.get('titulo')?.value;
          this.publicacionSeleccionar.descripcion = this.formularioCRUDImagen.get('descripcion')?.value;
          this.publicacionSeleccionar.zona_geografica = this.formularioCRUDImagen.get('zona_geografica')?.value;
          this.publicacionSeleccionar.imagen = response.imagen;
          this.formularioCRUDImagen.reset(); // Limpiamos el formulario
          this.edicion = true;
        },
        error: (erro) => {
          console.error("Error al modificar de la publicacion", erro)
        }

      });
    }
  }

  // Método para iniciar la edición de una publicación
  editarPublicacion(publicacion: any) {
    this.cambiar = true;                // Cambiamos estado para mostrar el formulario o la UI de edición
    this.publicacionSeleccionar = publicacion;  // Guardamos la publicación a editar
    // Rellenamos el formulario con los valores actuales de la publicación
    this.formularioCRUDImagen.patchValue({
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      zona_geografica: publicacion.zona_geografica == "undefined" ? '' : publicacion.zona_geografica,
    });

    this.archivoSelect = null; // Limpiamos cualquier archivo seleccionado previo
  }

  mostrarPublicaciones() {
    this.user_id = Number(this.router.snapshot.paramMap.get('user_id'));
    this.servizo.publicacionesUsuario(this.user_id, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.publicaciones = response;

        this.publicaciones.forEach((pub) => {
          this.usuarioPublicacionName = pub.users.name
        })

      },
      error: (err) => {
        console.error('Error al mostrar las publicaciones', err);
      }
    })
  }

  // Método para eliminar una publicación por su ID
  eliminarPublicacion(id: number) {
    this.servizo.eliminarPublicacion(id, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      })
    }).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.publicaciones = this.publicaciones.filter(publicacion => publicacion.id !== id);
      },
      error: (erro) => console.error(erro)
    });
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    if (this.servizo.token) {
      this.mostrarPublicaciones();
      this.usuarioLogueado();
    }
  }

}
