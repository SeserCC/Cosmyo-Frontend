import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ServizoLoginService } from '../../servizo-login.service';
import { FormsModule, FormGroup, Validators, FormControl, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.css'
})
export class AdministracionComponent implements OnInit {
  formularioCRUD: FormGroup;
  formularioCRUDPremium: FormGroup;
  formularioCRUDGratuito: FormGroup;
  formularioCRUDPublicacion: FormGroup;
  formularioCRUDForo: FormGroup;
  formularioCRUDComentario: FormGroup;
  formularioCRUDEvento: FormGroup;
  formularioCRUDPlan: FormGroup;
  formularioCRUDTipo: FormGroup;
  formularioCRUDEquipo: FormGroup;
  perfilCRUD: FormGroup;
  fotosComentarios = "http://localhost:8000/img/comentarios/";
  fotosPublicaciones = "http://localhost:8000/img/publicaciones/";
  fotosPerfiles = "http://localhost:8000/img/perfiles/";
  errorMensaje: string;
  error: boolean = false;
  archivoSelect: File | null;
  usuarios: any[];
  comentarios: any[];
  foros: any[];
  perfiles: any[];
  gratuitos: any[];
  premiums: any[];
  publicaciones: any[];
  eventos: any[];
  planes: any[];
  tipos: any[];
  equipos: any[];
  perfilSeleccionar: any;
  gratuitoSeleccionar: any;
  premiumSeleccionar: any;
  usuarioSeleccionar: any;
  usuarioLogueado: any;
  foroSeleccionar: any;
  comentarioSeleccionar: any;
  publicacionSeleccionar: any;
  eventoSeleccionar: any;
  planSeleccionar: any;
  tipoSeleccionar: any;
  equipoSeleccionar: any;
  cambiar: boolean = false;
  gratuito: boolean = false;
  admin: boolean = false;
  faltaArchivo: boolean = false;
  inputFile: boolean = false;
  edicion: boolean = false;
  paginas: number[] = [];
  paginaActual: number;
  paginasTotales: number;
  categoriaSeleccionada: string = "usuarios";
  carga: boolean = true;

  //Validamos
  constructor(private servizo: ServizoLoginService, private formularioPublicacion: FormBuilder, private router: Router, private url: ActivatedRoute, @Inject(PLATFORM_ID) private platform_id: Object) {
    this.formularioCRUD = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(4)]), // Control para el nombre de usuario
      contrasinal: new FormControl('', [Validators.required, Validators.minLength(8)]), // Control para el nombre de usuario
      contrasinal_actual: new FormControl('', [Validators.minLength(8)]), // Control para el nombre de usuario
      contrasinal_confirmation: new FormControl('', [Validators.required, Validators.minLength(8)]), // Control para el nombre de usuario
      nueva_contrasinal: new FormControl('', [Validators.minLength(8)]), // Control para el nombre de usuario
      nueva_contrasinal_confirmation: new FormControl('', [Validators.minLength(8)]), // Control para el nombre de usuario
      rol: new FormControl('', [Validators.required]), // Control para el rol
      descargas: new FormControl(0), // Control para las descargas
      email: new FormControl('', [Validators.required, Validators.email]), // Control para las descargas
    });

    this.perfilCRUD = new FormGroup({
      telefono: new FormControl('', [Validators.minLength(9)]),
      red_social_principal: new FormControl(''),
      usuario_red_social: new FormControl(''),
      pais: new FormControl('', [Validators.required]),
      estado: new FormControl('', [Validators.required]),
      biografia: new FormControl('', [Validators.required])
    });

    this.formularioCRUDForo = new FormGroup({
      tema: new FormControl('', [Validators.required]), // Control para el tema
    });

    this.formularioCRUDComentario = new FormGroup({
      texto: new FormControl('', [Validators.required]), // Control para el texto
      foro_id: new FormControl('', [Validators.required]), // Control para el id del foro
    });

    this.formularioCRUDPublicacion = this.formularioPublicacion.group({
      titulo: ['', Validators.required], // Control para el titulo
      descripcion: ['', Validators.required], // Control para la descripcion
      zona_geografica: ['', Validators.required], // Control para la descripcion
      imagen: [null, Validators.required], // Control para la descripcion
    });

    this.formularioCRUDEvento = new FormGroup({
      nombre: new FormControl('', [Validators.required]), // Control para el nombre
      fecha: new FormControl('', [Validators.required]), // Control para la fecha
      descripcion: new FormControl('', [Validators.required]), // Control para la descripcion
      direccion: new FormControl('', [Validators.required]), // Control para la direccion
      visibilidad: new FormControl('', [Validators.required]), // Control para la visibilidad
      instrumento: new FormControl('', [Validators.required]), // Control para el instrumento
      observacion: new FormControl('', [Validators.required]), // Control para la observacion
    });

    this.formularioCRUDPlan = new FormGroup({
      plan: new FormControl({ value: '', disabled: true }), // Control para el nombre
      tipo_pago: new FormControl('', [Validators.required]), // Control para la fecha
      metodo_pago: new FormControl({ value: '', disabled: true }), // Control para la fecha
    });

    this.formularioCRUDPremium = new FormGroup({
      insignia: new FormControl('', [Validators.required]), // Control para la insignia
    });

    this.formularioCRUDGratuito = new FormGroup({
      cantidad_maxima_descargas: new FormControl('', [Validators.required]), // Control para la insignia
      tamano_maximo_archivo: new FormControl('', [Validators.required]), // Control para la insignia
      limite_publicacion: new FormControl('', [Validators.required]), // Control para la insignia
    });

    this.formularioCRUDTipo = new FormGroup({
      nombre: new FormControl('', [Validators.required])
    });

    this.formularioCRUDEquipo = new FormGroup({
      marca: new FormControl('', [Validators.required]),
      modelo: new FormControl('', [Validators.required]),
      tipo_id: new FormControl('', [Validators.required])
    });
  }

  archivoSeleccionado(event: any): void {
    this.archivoSelect = event.target.files[0];
    this.formularioCRUDPublicacion.patchValue({
      imagen: this.archivoSelect
    });

    this.faltaArchivo = false;
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
  }

  // Método para cancelar una edición y reiniciar el formulario
  cancelar(formulario: FormGroup, fileInput?: HTMLInputElement) {
    this.cambiar = false; // Salimos del modo de edición
    this.admin = false;
    this.faltaArchivo = false;
    this.errorMensaje = "";
    this.error = false;
    this.planSeleccionar = null;
    this.premiumSeleccionar = null;

    if (fileInput) {
      fileInput.value = '';
    }

    formulario.reset({
      rol: '',
      metodo_pago: '',
      tipo_pago: '',
      descargas: 0,
      estado: '',
      foro_id: '',
      tipo_id: '',
      insignia: ''
    });   // Reiniciamos el formulario

    this.formularioCRUD.get('contrasinal')?.setValidators([
      Validators.required,
      Validators.minLength(8)
    ]);

    this.formularioCRUD.get('contrasinal_confirmation')?.setValidators([
      Validators.required,
      Validators.minLength(8)
    ]);

    this.formularioCRUD.get("contrasinal")?.updateValueAndValidity();
    this.formularioCRUD.get("contrasinal_confirmation")?.updateValueAndValidity();
  }

  //Funcion para añadir el usuario llamando al servicio
  engadirUsuario() {
    this.formularioCRUD.get('contrasinal')?.setValidators([
      Validators.required,
      Validators.minLength(8)
    ]);

    this.formularioCRUD.get('contrasinal_confirmation')?.setValidators([
      Validators.required,
      Validators.minLength(8)
    ]);

    this.formularioCRUD.get("contrasinal")?.updateValueAndValidity();
    this.formularioCRUD.get("contrasinal_confirmation")?.updateValueAndValidity();

    const nuevoUsuario = {
      name: this.formularioCRUD.value.nombre,
      email: this.formularioCRUD.value.email,
      password: this.formularioCRUD.value.contrasinal,
      password_confirmation: this.formularioCRUD.value.contrasinal_confirmation,
      rol: this.formularioCRUD.value.rol,
      descargas: this.formularioCRUD.value.descargas,
      plan: this.formularioCRUD.value.plan,
    }

    this.servizo.engadirUsuario(nuevoUsuario).subscribe({
      next: (usuario) => {
        //Añadimos el usuario mediante suscripcion
        this.usuarios.push(usuario);
        this.formularioCRUD.reset({
          rol: '',
          tipo_pago: '',
          descargas: 0,
        });
      },
      error: (erro) => {
        //console.error('Error al añadir un nuevo usuario:', erro);
      }
    });

  }

  // Método para rellenar el formulario con los datos del usuario seleccionado
  editar(usuario: any) {
    this.errorMensaje = "";
    this.error = false;
    this.formularioCRUD.reset();
    this.cambiar = true; // Activamos el modo edición

    this.usuarioSeleccionar = usuario; // Guardamos el usuario seleccionado

    if (this.usuarioSeleccionar.id == this.usuarioLogueado.id) {
      this.admin = true;

      this.formularioCRUD.get('contrasinal_actual')?.setValidators([
        Validators.minLength(8),
      ]);
      this.formularioCRUD.get("contrasinal_actual")?.updateValueAndValidity();
    } else {
      this.admin = false;
      this.formularioCRUD.get('contrasinal_actual')?.clearValidators();
      this.formularioCRUD.get("contrasinal_actual")?.updateValueAndValidity();
    }

    // Rellenamos el formulario con los datos del usuario
    this.formularioCRUD.patchValue({
      nombre: usuario.name,
      rol: usuario.rol,
      descargas: usuario.descargas || 0,
      email: usuario.email,
    });

    this.formularioCRUD.get('contrasinal')?.clearValidators();
    this.formularioCRUD.get('contrasinal_confirmation')?.clearValidators();
    this.formularioCRUD.get('contrasinal')?.updateValueAndValidity();
    this.formularioCRUD.get('contrasinal_confirmation')?.updateValueAndValidity();
  }

  // Método para guardar la modificación de un usuario
  modificarUsuario() {
    this.errorMensaje = "";
    this.error = false;
    this.cambiar = false; // Salimos del modo edición

    if (this.usuarioSeleccionar) {

      // Actualizamos los datos del usuario con los valores del formulario

      if (this.usuarioSeleccionar.id == this.usuarioLogueado.id) {
        this.usuarioSeleccionar.current_password = this.formularioCRUD.get('contrasinal_actual')?.value || undefined
      }

      this.usuarioSeleccionar.name = this.formularioCRUD.get('nombre')?.value;
      this.usuarioSeleccionar.rol = this.formularioCRUD.get('rol')?.value;
      this.usuarioSeleccionar.new_password = this.formularioCRUD.get('nueva_contrasinal')?.value || this.usuarioSeleccionar.new_password;
      this.usuarioSeleccionar.new_password_confirmation = this.formularioCRUD.get('nueva_contrasinal_confirmation')?.value || this.usuarioSeleccionar.new_password_confirmation;
      this.usuarioSeleccionar.descargas = this.formularioCRUD.get('descargas')?.value || this.usuarioSeleccionar.descargas;
      this.usuarioSeleccionar.email = this.formularioCRUD.get('email')?.value;

      // Enviamos la actualización al servicio
      this.servizo.modificarUsuario(this.usuarioSeleccionar.id, this.usuarioSeleccionar).subscribe({
        next: () => {
          this.admin = false;

          this.formularioCRUD.reset({
            rol: '',
            descargas: 0,
          });
        },
        error: (erro) => {
          this.cambiar = true;

          //console.error("Error al modificar al usuario", erro, this.usuarioSeleccionar) // Mostramos error en consola si ocurre

          if (erro.status == 403) {
            this.errorMensaje = erro.error.error;
            this.error = true;
            this.formularioCRUD.patchValue({
              contrasinal_actual: '',
              nueva_contrasinal: '',
              nueva_contrasinal_confirmation: '',
            });
          } else {
            this.errorMensaje = "Error inesperado del servidor";
          }

          this.formularioCRUD.get('contrasinal_actual')?.clearValidators();
          this.formularioCRUD.get("contrasinal_actual")?.updateValueAndValidity();
        },
      });

    }

  }

  mostrarUsuarios() {
    this.servizo.mostrarUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response;

      },
      error: (err) => {
        // console.error('❌ Error al mostrar los usuarios', err);
        //Mensaje de error

      }
    })
  }

  // Método para eliminar un usuario por su ID
  eliminarUsuario(id: number) {
    this.servizo.eliminarUsuario(id).subscribe({
      next: () => {
        // Eliminamos el usuario del array local
        this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
      },
      error: (erro) => {
        //console.error('Error al eliminar al usuario', erro)
      }
    });
  }

  mostrarForos() {

    this.servizo.mostrarForos().subscribe({
      next: (response) => {
        this.foros = response;
      },
      error: (err) => {
        //console.error('❌ Error al mostrar los foros', err);
        //Mensaje de error

      }
    })
  }

  //Funcion para añadir el foro llamando al servicio
  engadirForo() {
    const nuevoForo = {
      tema: this.formularioCRUDForo.value.tema,
    }

    this.servizo.engadirForo(nuevoForo).subscribe({
      next: (foro) => {
        //Añadimos el tema mediante suscripcion
        this.foros.push(foro);
        this.formularioCRUDForo.reset();
      },
      error: (erro) => {
        //console.error('Error al añadir un foro:', erro);
      }
    });
  }

  // Método para editar un foro
  editarForo(foro: any) {
    this.cambiar = true; // Activamos el modo edición
    this.foroSeleccionar = foro; // Guardamos el foro seleccionado
    // Rellenamos el formulario con los datos del foro
    this.formularioCRUDForo.patchValue({
      tema: foro.tema,
    });
  }

  // Método para guardar la modificación de un foro
  modificarForo() {
    this.cambiar = false;

    if (this.foroSeleccionar) {
      // Actualizamos el tema del foro
      this.foroSeleccionar.tema = this.formularioCRUDForo.get('tema')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarForo(this.foroSeleccionar.id, this.foroSeleccionar).subscribe({
        next: () => {
          this.formularioCRUDForo.reset(); // Limpiamos el formulario
        },
        error: (erro) => {
          //console.error("Error en el modificar del foro", erro)
        }
      });
    }
  }

  // Método para eliminar un foro por su ID
  eliminarForo(id: number) {
    this.servizo.eliminarForo(id).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.foros = this.foros.filter(foro => foro.id !== id);
      },
      error: (erro) => {
        //console.error('Error al eliminar el foro', erro)

      }
    });
  }

  mostrarComentarios(page: number) {

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
  }

  //Funcion para añadir el comentario llamando al servicio
  engadirComentario() {

    const nuevoComentario = new FormData();
    nuevoComentario.append('texto', this.formularioCRUDComentario.get('texto')?.value);
    nuevoComentario.append('foro_id', this.formularioCRUDComentario.get('foro_id')?.value);

    if (this.archivoSelect) {
      nuevoComentario.append('foto', this.archivoSelect);
    }

    this.servizo.engadirComentario(nuevoComentario).subscribe({
      next: (comentario) => {
        //Añadimos el tema mediante suscripcion
        this.comentarios.push(comentario);
        this.formularioCRUDComentario.reset({
          foro_id: ''
        });
        this.archivoSelect = null;
      },
      error: (erro) => {
        //console.error('Error al añadir un comentario', erro);
      }
    });
  }

  // Método para editar un comentario
  editarComentario(comentario: any) {
    this.cambiar = true; // Activamos el modo edición
    this.comentarioSeleccionar = comentario; // Guardamos el comentario seleccionado
    // Rellenamos el formulario con el texto del comentario
    this.formularioCRUDComentario.patchValue({
      texto: comentario.texto,
      foro_id: comentario.foro_id,
    });
  }

  // Método para guardar la modificación de un comentario
  modificarComentario() {
    this.cambiar = false;

    const modificarComentario = new FormData();

    if (this.comentarioSeleccionar) {

      if (this.archivoSelect) {
        modificarComentario.append('foto', this.archivoSelect);
      }

      modificarComentario.append('texto', this.formularioCRUDComentario.get('texto')?.value);
      modificarComentario.append('foro_id', this.formularioCRUDComentario.get('foro_id')?.value);
      modificarComentario.append('_method', 'PUT');

      // Llamamos al servicio para modificar
      this.servizo.modificarComentario(this.comentarioSeleccionar.id, modificarComentario).subscribe({
        next: (respuesta) => {
          this.comentarioSeleccionar.foro_id = this.formularioCRUDComentario.get('foro_id')?.value;
          this.comentarioSeleccionar.texto = this.formularioCRUDComentario.get('texto')?.value;
          if (respuesta.foto) {
            this.comentarioSeleccionar.foto = respuesta.foto;
          }
          this.formularioCRUDComentario.reset({
            foro_id: ''
          }); // Limpiamos el formulario
        },
        error: (erro) => {
          //console.error("Error al modificar del comentario", erro)
        }

      });
    }
  }

  // Método para eliminar un comentario por su ID
  eliminarComentario(id: number) {
    this.servizo.eliminarComentario(id).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.comentarios = this.comentarios.filter(comentario => comentario.id !== id);
      },
      error: (erro) => {
        //console.error('Error al eliminar el comentario:', erro)
      }
    });
  }

  // Método para añadir una nueva publicación
  engadirPublicacion(): void {
    const nuevoPublicacion = new FormData();
    nuevoPublicacion.append('titulo', this.formularioCRUDPublicacion.get('titulo')?.value);
    nuevoPublicacion.append('descripcion', this.formularioCRUDPublicacion.get('descripcion')?.value);
    nuevoPublicacion.append('zona_geografica', this.formularioCRUDPublicacion.get('zona_geografica')?.value);

    if (this.archivoSelect) {
      nuevoPublicacion.append('imagen', this.archivoSelect);
      this.faltaArchivo = false;

    } else {
      this.faltaArchivo = true;
      return;
    }

    this.servizo.engadirPublicacion(nuevoPublicacion).subscribe({
      next: (publicacion) => {
        //Añadimos el tema mediante suscripcion
        this.publicaciones.push(publicacion);
        this.formularioCRUDPublicacion.reset();
      },
      error: (erro) => {
        //console.error('Error al añadir una publicacion: ',erro);
      }
    });
  }

  mostrarPublicaciones() {

    this.servizo.mostrarPublicaciones().subscribe({
      next: (response) => {
        this.publicaciones = response.publicacions;
      },
      error: (err) => {
        console.error('❌ Error al mostrar las publicaciones', err);
        //Mensaje de error
      }
    })
  }

  // Método para editar una publicación
  editarPublicacion(publicacion: any) {
    this.cambiar = true; // Activamos el modo edición
    this.publicacionSeleccionar = publicacion; // Guardamos la publicación seleccionada
    // Rellenamos el formulario con los datos de la publicación
    this.formularioCRUDPublicacion.patchValue({
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      zona_geografica: publicacion.zona_geografica,
    });
  }

  // Método para guardar la modificación de una publicación
  modificarPublicacion() {
    this.cambiar = false;
    this.errorMensaje = "";
    this.error = false;

    const modificarPublicacion = new FormData();

    if (this.publicacionSeleccionar) {

      if (this.archivoSelect) {
        modificarPublicacion.append('imagen', this.archivoSelect);
      }

      modificarPublicacion.append('titulo', this.formularioCRUDPublicacion.get('titulo')?.value);
      modificarPublicacion.append('descripcion', this.formularioCRUDPublicacion.get('descripcion')?.value);
      modificarPublicacion.append('zona_geografica', this.formularioCRUDPublicacion.get('zona_geografica')?.value);
      modificarPublicacion.append('_method', 'PUT');

      // Llamamos al servicio para modificar
      this.servizo.modificarPublicacion(this.publicacionSeleccionar.id, modificarPublicacion).subscribe({
        next: (response) => {
          this.publicacionSeleccionar.titulo = this.formularioCRUDPublicacion.get('titulo')?.value;
          this.publicacionSeleccionar.descripcion = this.formularioCRUDPublicacion.get('descripcion')?.value;
          this.publicacionSeleccionar.zona_geografica = this.formularioCRUDPublicacion.get('zona_geografica')?.value;
          this.publicacionSeleccionar.imagen = response.imagen;
          this.formularioCRUDPublicacion.reset(); // Limpiamos el formulario
        },
        error: (erro) => {
          console.error("Error al modificar de la publicacion", erro)
        }

      });
    }
  }

  // Método para eliminar una publicación
  eliminarPublicacion(id: number) {
    this.servizo.eliminarPublicacion(id).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.publicaciones = this.publicaciones.filter(publicacion => publicacion.id !== id);
      },
      error: (erro) => console.error(erro)
    });
  }

  // Método para editar un evento
  editarEvento(evento: any) {
    this.errorMensaje = "";
    this.error = false;
    this.cambiar = true; // Activamos el modo edición
    this.eventoSeleccionar = evento; // Guardamos el evento seleccionado
    // Rellenamos el formulario con los datos del evento
    this.formularioCRUDEvento.patchValue({
      nombre: evento.evento,
      fecha: evento.fecha,
      descripcion: evento.descripcion,
      direccion: evento.direccion,
      visibilidad: evento.visibilidad,
      instrumento: evento.instrumento,
      observacion: evento.observacion
    });
  }

  // Método para añadir un nuevo evento
  engadirEvento() {
    this.errorMensaje = "";
    this.error = false;
    const nuevoEvento = {
      evento: this.formularioCRUDEvento.value.nombre,
      fecha: this.formularioCRUDEvento.value.fecha,
      descripcion: this.formularioCRUDEvento.value.descripcion,
      direccion: this.formularioCRUDEvento.value.direccion,
      visibilidad: this.formularioCRUDEvento.value.visibilidad,
      instrumento: this.formularioCRUDEvento.value.instrumento,
      observacion: this.formularioCRUDEvento.value.observacion,
    }

    this.servizo.engadirEvento(nuevoEvento).subscribe({
      next: (evento) => {
        //Añadimos el tema mediante suscripcion
        this.eventos.push(evento);
        this.formularioCRUDEvento.reset();
      },
      error: (erro) => {
        console.error(erro);
        if (erro.status == 409) {
          this.error = true;
          this.errorMensaje = erro.error.error;
        }
      }
    });
  }

  mostrarEventos() {

    this.servizo.mostrarEventos().subscribe({
      next: (response) => {
        this.eventos = response;
      },
      error: (err) => {
        console.error('❌ Error al mostrar los eventos', err);
        //Mensaje de error
      }
    })
  }

  // Método para guardar la modificación de un evento
  modificarEvento(): void {
    this.cambiar = false;

    if (this.eventoSeleccionar) {
      // Actualizamos el tema del foro
      this.eventoSeleccionar.evento = this.formularioCRUDEvento.get('nombre')?.value;
      this.eventoSeleccionar.fecha = this.formularioCRUDEvento.get('fecha')?.value;
      this.eventoSeleccionar.descripcion = this.formularioCRUDEvento.get('descripcion')?.value;
      this.eventoSeleccionar.direccion = this.formularioCRUDEvento.get('direccion')?.value;
      this.eventoSeleccionar.visibilidad = this.formularioCRUDEvento.get('visibilidad')?.value;
      this.eventoSeleccionar.instrumento = this.formularioCRUDEvento.get('instrumento')?.value;
      this.eventoSeleccionar.observacion = this.formularioCRUDEvento.get('observacion')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarEvento(this.eventoSeleccionar.id, this.eventoSeleccionar).subscribe({
        next: () => {
          this.formularioCRUDEvento.reset(); // Limpiamos el formulario
        },
        error: (erro) => {
          console.error("Error en el modificar del evento", erro);
          (this.eventoSeleccionar)

        }
      });
    }
  }

  // Método para eliminar un evento
  eliminarEvento(id: number) {
    this.servizo.eliminarEvento(id).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.eventos = this.eventos.filter(evento => evento.id !== id);
      },
      error: (erro) => console.error(erro)
    });
  }

  mostrarPlanes() {

    this.servizo.mostrarPlanes().subscribe({
      next: (response) => {
        this.planes = response;
      },
      error: (err) => {
        console.error('❌ Error al mostrar los planes', err);
        //Mensaje de error
      }
    })
  }

  // Método para editar un evento
  editarPlan(plan: any) {
    this.errorMensaje = "";
    this.error = false;
    this.planSeleccionar = plan; // Guardamos el evento seleccionado
    (this.planSeleccionar);
    // Rellenamos el formulario con los datos del evento
    this.formularioCRUDPlan.patchValue({
      plan: plan.user.stripe_id ? "premium" : "gratuito",
      tipo_pago: plan.tipo_pago ? plan.tipo_pago : '',
      metodo_pago: plan.metodo_pago,
    });
  }

  portalUrl() {
    let data = {
      rol: this.usuarioLogueado.rol,
      stripe_id: this.planSeleccionar?.user?.stripe_id
    };

    (data);

    this.servizo.portalUrl(data).subscribe({
      next: (data) => {
        window.location.href = data.url;
      }

    })
  }

  accesoPremium() {
    let data = {
      rol: this.usuarioLogueado.rol,
      id: this.planSeleccionar.user_id,
      tipo_pago: this.formularioCRUDPlan.get('tipo_pago')?.value
    };

    this.servizo.accesoPremium(data).subscribe({
      next: (data) => {
        window.location.href = data.url;

      }
    })
  }

  // Método para guardar la modificación de un evento
  modificarPlanes(): void {
    /* this.cambiar = false; */
    if (this.planSeleccionar) {
      // Actualizamos el tema del foro
      this.planSeleccionar.plan = this.formularioCRUDPlan.get('plan')?.value;
      this.planSeleccionar.tipo_pago = this.formularioCRUDPlan.get('tipo_pago')?.value;
      this.planSeleccionar.metodo_pago = this.formularioCRUDPlan.get('metodo_pago')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarPlanes(this.planSeleccionar.user_id, this.planSeleccionar).subscribe({
        next: () => {
          this.portalUrl();
          (this.planSeleccionar);
          this.formularioCRUDPlan.reset({
            metodo_pago: ''
          }); // Limpiamos el formulario
        },
        error: (erro) => {
          console.error("Error en el modificar del plan", erro);
          /* (this.eventoSeleccionar) */

        }
      });
    }
  }


  mostrarPerfil() {
    {
      this.servizo.mostrarPerfiles().subscribe({
        next: (response) => {
          this.perfiles = response;

        },
        error: (err) => {
          console.error('Error al mostrar el perfil', err);
        }
      })
    }
  }

  editarPerfil(perfil: any) {
    this.cambiar = true; // Activamos el modo edición
    this.perfilSeleccionar = perfil;
    /* (this.perfilSeleccionar) */ // Guardamos el foro seleccionado
    // Rellenamos el formulario con los datos del foro
    this.perfilCRUD.patchValue({
      telefono: perfil.telefono,
      red_social_principal: perfil.red_social_principal,
      biografia: perfil.biografia,
      usuario_red_social: perfil.usuario_red_social,
      pais: perfil.pais,
      estado: perfil.estado,
    });
  }

  modificarPerfil() {

    const modificarPerfil = new FormData();

    if (this.perfilSeleccionar) {

      if (this.archivoSelect) {
        modificarPerfil.append('foto', this.archivoSelect);
      } else {
        this.faltaArchivo = true;
      }

      modificarPerfil.append('telefono', this.perfilCRUD.get('telefono')?.value);
      modificarPerfil.append('red_social_principal', this.perfilCRUD.get('red_social_principal')?.value);
      modificarPerfil.append('usuario_red_social', this.perfilCRUD.get('usuario_red_social')?.value);
      modificarPerfil.append('pais', this.perfilCRUD.get('pais')?.value);
      modificarPerfil.append('biografia', this.perfilCRUD.get('biografia')?.value);
      modificarPerfil.append('estado', this.perfilCRUD.get('estado')?.value);
      modificarPerfil.append('_method', 'PUT');

      // Llamamos al servicio para modificar
      this.servizo.modificarPerfil(this.perfilSeleccionar.user_id, modificarPerfil).subscribe({
        next: (response) => {
          this.cambiar = false;
          this.archivoSelect = null;
          this.perfilSeleccionar.telefono = this.perfilCRUD.get('telefono')?.value;
          this.perfilSeleccionar.red_social_principal = this.perfilCRUD.get('red_social_principal')?.value;
          this.perfilSeleccionar.usuario_red_social = this.perfilCRUD.get('usuario_red_social')?.value;
          this.perfilSeleccionar.pais = this.perfilCRUD.get('pais')?.value;
          this.perfilSeleccionar.biografia = this.perfilCRUD.get('biografia')?.value;
          this.perfilSeleccionar.foto = response.foto;
          this.perfilCRUD.reset();
        },
        error: (erro) => {
          console.error("Error al modificar el perfill", erro)
        }

      });
    }

  }

  mostrarPremiums() {
    {
      this.servizo.mostrarPremiums().subscribe({
        next: (response) => {
          this.premiums = response;
        },
        error: (err) => {
          console.error('Error al mostrar los usuairos premium', err);
        }
      })
    }
  }

  editarPremium(premium: any) {
    this.errorMensaje = "";
    this.error = false;
    this.premiumSeleccionar = premium; // Guardamos el evento seleccionado
    // Rellenamos el formulario con los datos del evento
    this.formularioCRUDPremium.patchValue({
      insignia: premium.insignia,
    });

  }

  modificarPremium(): void {
    /* this.cambiar = false; */
    if (this.premiumSeleccionar) {
      // Actualizamos el tema del foro
      this.premiumSeleccionar.insignia = this.formularioCRUDPremium.get('insignia')?.value;

      (this.premiumSeleccionar);
      // Llamamos al servicio para modificar
      this.servizo.modificarPremium(this.premiumSeleccionar.plan_id, this.premiumSeleccionar).subscribe({
        next: () => {
          /* (this.planSeleccionar); */
          this.formularioCRUDPremium.reset({
            insignia: ''
          }); // Limpiamos el formulario
        },
        error: (erro) => {
          console.error("Error en el modificar premium", erro);
          /* (this.eventoSeleccionar) */

        }
      });
    }
  }

  mostrarGratuitos() {
    {
      this.servizo.mostrarGratuitos().subscribe({
        next: (response) => {
          this.gratuitos = response;

        },
        error: (err) => {
          console.error('Error al mostrar los usuairos gratuitos', err);
        }
      })
    }
  }

  editarGratuito(gratuito: any) {
    this.errorMensaje = "";
    this.error = false;
    this.gratuitoSeleccionar = gratuito; // Guardamos el evento seleccionado
    // Rellenamos el formulario con los datos del evento
    this.formularioCRUDGratuito.patchValue({
      cantidad_maxima_descargas: gratuito.cantidad_maxima_descargas,
      limite_publicacion: gratuito.limite_publicacion,
      tamano_maximo_archivo: gratuito.tamano_maximo_archivo,
    });

  }

  modificarGratuito(): void {
    /* this.cambiar = false; */
    if (this.gratuitoSeleccionar) {
      // Actualizamos el tema del foro
      this.gratuitoSeleccionar.cantidad_maxima_descargas = this.formularioCRUDGratuito.get('cantidad_maxima_descargas')?.value;
      this.gratuitoSeleccionar.limite_publicacion = this.formularioCRUDGratuito.get('limite_publicacion')?.value;
      this.gratuitoSeleccionar.tamano_maximo_archivo = this.formularioCRUDGratuito.get('tamano_maximo_archivo')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarGratuito(this.gratuitoSeleccionar.plan_id, this.gratuitoSeleccionar).subscribe({
        next: () => {

          this.formularioCRUDGratuito.reset(); // Limpiamos el formulario
        },
        error: (erro) => {
          console.error("Error en el modificar gratuito", erro);

        }
      });
    }
  }

  /* NUEVAS TABLAS */
  mostrarTipos() {

    this.servizo.mostrarTipos().subscribe({
      next: (response) => {
        this.tipos = response;
      },
      error: (err) => {
        //console.error('❌ Error al mostrar los foros', err);
        //Mensaje de error

      }
    })
  }

  //Funcion para añadir el foro llamando al servicio
  engadirTipo() {
    const nuevoTipo = {
      nombre: this.formularioCRUDTipo.value.nombre,
    }

    this.servizo.engadirTipo(nuevoTipo).subscribe({
      next: (tipo) => {
        //Añadimos el tema mediante suscripcion
        this.tipos.push(tipo);
        this.formularioCRUDTipo.reset();
      },
      error: (erro) => {
        //console.error('Error al añadir un foro:', erro);
      }
    });
  }

  // Método para editar un tipo
  editarTipo(tipo: any) {
    this.cambiar = true; // Activamos el modo edición
    this.tipoSeleccionar = tipo; // Guardamos el tipo seleccionado
    // Rellenamos el formulario con los datos del tipo
    this.formularioCRUDTipo.patchValue({
      nombre: tipo.nombre
    });
  }

  // Método para guardar la modificación de un foro
  modificarTipo() {
    this.cambiar = false;

    if (this.tipoSeleccionar) {
      // Actualizamos el tema del foro
      this.tipoSeleccionar.nombre = this.formularioCRUDTipo.get('nombre')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarTipo(this.tipoSeleccionar.id, this.tipoSeleccionar).subscribe({
        next: () => {
          this.formularioCRUDTipo.reset(); // Limpiamos el formulario
        },
        error: (erro) => {
          //console.error("Error en el modificar del foro", erro)
        }
      });
    }
  }

  // Método para eliminar un foro por su ID
  eliminarTipo(id: number) {
    this.servizo.eliminarTipo(id).subscribe({
      next: () => {
        // Eliminamos el foro del array local
        this.tipos = this.tipos.filter(tipo => tipo.id !== id);
      },
      error: (erro) => {
        //console.error('Error al eliminar el foro', erro)

      }
    });
  }

  mostrarEquipos() {

    this.servizo.mostrarEquipos().subscribe({
      next: (response) => {
        this.equipos = response;
      },
      error: (err) => {
        //console.error('❌ Error al mostrar los equipos', err);
        //Mensaje de error

      }
    })
  }

  //Funcion para añadir el equipo llamando al servicio
  engadirEquipo() {
    const nuevoEquipo = {
      marca: this.formularioCRUDEquipo.value.marca,
      modelo: this.formularioCRUDEquipo.value.modelo,
      tipo_id: this.formularioCRUDEquipo.value.tipo_id,
    }

    this.servizo.engadirEquipo(nuevoEquipo).subscribe({
      next: (equipo) => {
        //Añadimos el tema mediante suscripcion
        this.equipos.push(equipo);
        this.formularioCRUDEquipo.reset({
          tipo_id: ''
        });
      },
      error: (erro) => {
        //console.error('Error al añadir un equipo:', erro);
      }
    });
  }

  // Método para editar un equipo
  editarEquipo(equipo: any) {
    this.cambiar = true; // Activamos el modo edición
    this.equipoSeleccionar = equipo; // Guardamos el equipo seleccionado
    // Rellenamos el formulario con los datos del equipo
    this.formularioCRUDEquipo.patchValue({
      marca: equipo.marca,
      modelo: equipo.modelo,
      tipo_id: equipo.tipo_id
    });
  }

  // Método para guardar la modificación de un equipo
  modificarEquipo() {
    this.cambiar = false;

    if (this.equipoSeleccionar) {

      this.equipoSeleccionar.marca = this.formularioCRUDEquipo.get('marca')?.value;
      this.equipoSeleccionar.modelo = this.formularioCRUDEquipo.get('modelo')?.value;
      this.equipoSeleccionar.tipo_id = this.formularioCRUDEquipo.get('tipo_id')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarEquipo(this.equipoSeleccionar.id, this.equipoSeleccionar).subscribe({
        next: () => {
          this.formularioCRUDEquipo.reset({
            tipo_id: ''
          }); // Limpiamos el formulario
        },
        error: (erro) => {
          //console.error("Error en el modificar del equipo", erro)
        }
      });
    }
  }

  // Método para eliminar un equipo por su ID
  eliminarEquipo(id: number) {
    this.servizo.eliminarEquipo(id).subscribe({
      next: () => {
        // Eliminamos el equipo del array local
        this.equipos = this.equipos.filter(equipo => equipo.id !== id);
      },
      error: (erro) => {
        //console.error('Error al eliminar el equipo', erro)

      }
    });
  }

  // Método ejecutado al iniciar el componente, carga todos los datos desde el servicio
  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.servizo.middlewareAdmin().subscribe({
        next: () => {
        },
        error: (err) => {
          if (err.status === 403 || err.status === 401) {
            this.router.navigate(['/']);
          }
        }
      })

      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioLogueado = usuario;
        this.carga = false;

      });

      this.servizo.actualizarMeta(
        'Administración | Cosmyo',
        'Panel de control'
      );


      if (this.servizo.token) {

        this.mostrarPerfil();

        this.mostrarUsuarios();

        this.mostrarForos();

        this.mostrarComentarios(1);

        this.mostrarPublicaciones();

        this.mostrarEventos();

        this.mostrarPlanes();

        this.mostrarPremiums();

        this.mostrarGratuitos();

        this.mostrarTipos();

        this.mostrarEquipos();

      }
    }


    this.formularioCRUD.get('plan')?.valueChanges.subscribe(valor => {
      if (valor == 'gratuito') {
        this.gratuito = true;

        this.formularioCRUD.get('descargas')?.setValidators([
          Validators.required,
        ]);

        this.formularioCRUD.get("descargas")?.updateValueAndValidity();

        this.formularioCRUD.get("metodo_pago")?.clearValidators();
        this.formularioCRUD.get("tipo_pago")?.clearValidators();
      } else if (valor == "premium") {
        this.gratuito = false;

        this.formularioCRUD.get('metodo_pago')?.setValidators([
          Validators.required,
        ]);

        this.formularioCRUD.get("descargas")?.clearValidators();
        this.formularioCRUD.get('tipo_pago')?.setValidators([
          Validators.required,
        ]);

      }
      this.formularioCRUD.get("metodo_pago")?.updateValueAndValidity();
      this.formularioCRUD.get("tipo_pago")?.updateValueAndValidity();
    })

  }


}
