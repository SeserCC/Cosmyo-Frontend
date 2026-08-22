import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-subir-archivo',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './subir-archivo.component.html',
  styleUrl: './subir-archivo.component.css'
})
export class SubirArchivoComponent implements OnInit {
  // Array que contiene todas las imágenes/publicaciones
  publicaciones: any[] = [];
  nombreArchivo = '';
  mostrarEquipos: boolean;
  cargaEquipos: boolean;
  equipoEscogido: any[] = [];

  location = inject(Location);
  equipos: any[];
  formularioEquipo: FormGroup;

  // Formulario reactivo para añadir una publicación (imagen)
  formularioPublicacion: FormGroup;

  // Indicador para saber si falta seleccionar un archivo al crear la publicación
  faltaArchivo: boolean = false;

  // Archivo seleccionado por el usuario para subir la imagen
  archivoSelect: File | null = null;

  mensajeError: any;

  loading = false;

  // Constructor donde se inicializa el formulario con validaciones y se inyectan servicios
  constructor(private servizo: ServizoLoginService, private router: Router) {
    this.formularioPublicacion = new FormGroup({
      titulo: new FormControl('', [Validators.required, Validators.minLength(4)]),       // Campo título obligatorio y mínimo 4 caracteres
      descripcion: new FormControl('', [Validators.required, Validators.minLength(4)]),  // Campo descripción obligatorio y mínimo 4 caracteres
      zona_geografica: new FormControl('', [Validators.required, Validators.minLength(4)]),  // Campo descripción obligatorio y mínimo 4 caracteres
    });

    this.formularioEquipo = new FormGroup({
      modelo: new FormControl(''),
    });
  }

  // Método que se ejecuta cuando el usuario selecciona un archivo desde el input file
  cargarArchivo(event: any) {
    this.archivoSelect = event.target.files[0];  // Se guarda el primer archivo seleccionado

    if (this.archivoSelect) {
      this.faltaArchivo = true;
      this.nombreArchivo = this.archivoSelect.name;
    } else {
      this.faltaArchivo = false;
      this.nombreArchivo = '';
    }

  }

  mostrarListaEquipos() {
    this.servizo.mostrarEquipos().subscribe({
      next: (response) => {
        this.equipos = response;
      },
      error: (erro) => {
        /* console.error('Error al devolver los equipos', erro); */
      }
    });
  }

  volver() {
    this.location.back();
  }

  listarEquipos() {
    this.mostrarEquipos = true;
  }

  @HostListener('window:keydown', ['$event'])
  onkeyDown(event: KeyboardEvent) {
    if (event.key == 'Escape') {
      this.mostrarEquipos = false;
    }
  }

  guardarEquipos(equipo: any) {
    this.equipoEscogido.push(equipo);
    this.actualizarEquipos(this.equipos);
  }

  eliminarEquipo(equipo_id: number) {
    this.equipoEscogido = this.equipoEscogido.filter(equip => equip.id != equipo_id);
    this.actualizarEquipos(this.equipos);
  }

  actualizarEquipos(equipos: any[] = []) {
    equipos.forEach(equipo => {
      equipo.guardado = this.equipoEscogido.some(usuarioEquipo => usuarioEquipo.id == equipo.id);
    });
  }

  cancelarEquipo() {
    this.mostrarEquipos = false;
    this.buscadorEquipos('');
    this.formularioEquipo.reset();
  }

  buscadorEquipos(equipo: string) {
    if (equipo == null) {
      equipo = '';
    }
    this.cargaEquipos = true;
    this.servizo.buscadorEquipos(equipo).subscribe({
      next: (response) => {
        this.equipos = response.equipos;
        /* console.log(response); */
        this.actualizarEquipos(this.equipos);
        /* this.actualizarEquipos(this.equipos); */
        this.cargaEquipos = false;
      },
      error: (erro) => {
        this.cargaEquipos = false;

        //console.error('Error en el filtro de publicaciones', erro);
        if (erro.status == 404) {
          this.mensajeError = erro.error;
        }
      }
    })

  }

  // Función para añadir una nueva publicación llamando al servicio correspondiente
  engadirPublicacion(): void {
    this.loading = true;
    const nuevaPublicacion = new FormData();
    nuevaPublicacion.append('titulo', this.formularioPublicacion.get('titulo')?.value);
    nuevaPublicacion.append('descripcion', this.formularioPublicacion.get('descripcion')?.value);
    nuevaPublicacion.append('zona_geografica', this.formularioPublicacion.get('zona_geografica')?.value);

    if (this.archivoSelect) {
      nuevaPublicacion.append('imagen', this.archivoSelect);
    }

    let publicacion = {
      titulo: this.formularioPublicacion.get('titulo')?.value,
      descripcion: this.formularioPublicacion.get('descripcion')?.value,
      zona_geografica: this.formularioPublicacion.get('zona_geografica')?.value,
    }

    this.servizo.recibirFirma().subscribe((firma: any) => {
      this.servizo.subirVideo(this.archivoSelect!, firma).subscribe({
        next: (data: any) => {
          /* Guarda en un array los ids de los equipos */
          const equiposIds = this.equipoEscogido.map(equipo => equipo.id);
          const publicacionMultimedia = {
            ...publicacion,
            imagen: data.secure_url,
            public_id: data.public_id,
            bytes: data.bytes,
            resource_type: data.resource_type,
            equipos: equiposIds,
          };

          this.servizo.engadirPublicacion(publicacionMultimedia).subscribe({
            next: (publicacion) => {
              this.formularioPublicacion.reset();
              this.loading = false;
              this.router.navigate(['/publicacion', publicacion.id, publicacion.slug]);
            },
            error: (erro) => {
              //console.error('Error al subir la publicacion', erro);
              //console.error(erro.error);
              this.loading = false;
              if (erro.status == 422) {
                this.mensajeError = erro.error.message
              }
            }
          });
        }, error: (erro) => {
          /* console.error(erro); */
          if (erro.status == 400 || erro.status == 413) {
            this.mensajeError = 'La imagen supera el tamaño máximo permitido: 10 MB';
          }
          this.loading = false;
        }
      })
    })


  }

  ngOnInit(): void {
    this.mostrarListaEquipos();
    this.actualizarEquipos(this.equipos);
    this.servizo.actualizarMeta(
      'Subir publicación | Cosmyo',
      'Nueva publicación'
    );
  }

}
