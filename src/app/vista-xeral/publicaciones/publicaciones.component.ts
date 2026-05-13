import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Imagen } from '../../imagen';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css'
})
export class PublicacionesComponent implements OnInit {

  // Array que almacena las publicaciones
  publicaciones: any[];

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


  // Constructor donde se inicializa el formulario con sus controles y validaciones
  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {
    this.formularioCRUDImagen = new FormGroup({
      titulo: new FormControl('', [Validators.required]),      // Campo obligatorio para el título
      descripcion: new FormControl('', [Validators.required]),  // Campo obligatorio para la descripción
      zona_geografica: new FormControl('', [Validators.required])
    });
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
      this.servizo.modificarPublicacion(this.publicacionSeleccionar.id, modificarPublicacion).subscribe({
        next: (response) => {
          this.publicacionSeleccionar.titulo = this.formularioCRUDImagen.get('titulo')?.value;
          this.publicacionSeleccionar.descripcion = this.formularioCRUDImagen.get('descripcion')?.value;
          this.publicacionSeleccionar.zona_geografica = this.formularioCRUDImagen.get('zona_geografica')?.value;
          this.publicacionSeleccionar.imagen = response.imagen;
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
            this.mensajeError = erro.error;
          }
        }

      });
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
      ).subscribe(publicaciones => {
        this.user_id = Number(this.router.snapshot.paramMap.get('user_id'));
        this.publicaciones = publicaciones;
        this.carga = false;

        this.publicaciones.forEach((pub) => {
          this.usuarioPublicacionName = pub.users.name
        })
      })

    }
  }

}
