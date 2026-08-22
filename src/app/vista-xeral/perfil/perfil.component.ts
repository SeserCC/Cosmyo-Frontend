import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ServizoLoginService } from '../../servizo-login.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  perfil: any;
  plan: any;
  foros: any;
  valor_insignia: any;
  perfilSeleccionar: any;
  user_id: number;
  publicaciones: any[];
  publicacionSeleccionar: any;
  equipoSeleccionar: any;
  planSeleccionar: any;
  mostrarInfo: boolean;
  mostrarEquipos: 'perfil' | 'publicacion' | null = null;
  tipoEliminacion: 'equipo' | 'publicacion' | null = null;
  equipos: any[];
  equiposOriginales: any[] = [];
  equiposOriginalesPub: any[] = [];
  equipoEscogido: any[] = [];
  equiposUsuario: any[];
  usuarios: any[];
  mostrarMensajeConfirmacion: boolean = false;
  mostrarConfiguracion: boolean = false;
  perfilCRUD: FormGroup;
  publicacionCRUD: FormGroup;
  userCRUD: FormGroup;
  planCRUD: FormGroup;
  equipoCRUD: FormGroup;
  desactivar: boolean;
  cambiar: boolean;
  premium: boolean;
  menuAbierto: number | null = null;
  mostrarMas: number | null;
  mensajeEquipos: any;
  mensajeError: any;
  cambiarPublicacion: boolean;
  cambiarPlan: boolean;
  cambiarUsuario: boolean;
  perfilFoto = "http://localhost:8000/img/perfiles/";
  archivoSelect: File | null;
  mostrarActual: string = 'password';
  mostrarContrasinal: string = 'password';
  carga: boolean = true;
  cargaEquipos: boolean;
  mostrarConfirmacion: string = 'password';
  loading = false;

  usuarioActual: any;

  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute, private routerR: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.perfilCRUD = new FormGroup({
      telefono: new FormControl('', [Validators.minLength(9)]),
      pais: new FormControl('', [Validators.required]),
      biografia: new FormControl('', [Validators.required]),
    });

    this.planCRUD = new FormGroup({
      tipo_pago: new FormControl(''),
    });

    this.userCRUD = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      changePassword: new FormControl(false),
      contrasena: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contrasena_actual: new FormControl(''),
      contrasena_confirmacion: new FormControl(''),
    });

    this.publicacionCRUD = new FormGroup({
      titulo: new FormControl('', [Validators.required, Validators.maxLength(124)]),      // Campo obligatorio para el título
      descripcion: new FormControl('', [Validators.required]),  // Campo obligatorio para la descripción
      zona_geografica: new FormControl('', [Validators.required, Validators.maxLength(79)])
    });


    this.equipoCRUD = new FormGroup({
      modelo: new FormControl(''),
    });

  }

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  listarEquipos() {
    this.mostrarEquipos = 'perfil';
    this.actualizarEquipos(this.equipos);
  }

  listarEquiposPub() {
    this.mostrarEquipos = 'publicacion';
  }

  reducirInfo(id: number) {
    if (this.mostrarMas == id) {
      this.mostrarMas = null
    } else {
      this.mostrarMas = id;
    }

  }

  seleccionarEquipo(equipo: any) {
    if (this.mostrarEquipos == 'perfil') {
      this.guardarEquipos(equipo.id);

    } else if (this.mostrarEquipos == 'publicacion') {
      this.guardarEquiposPub(equipo);
    }

  }

  guardarEquiposPub(equipo: any) {
    this.publicacionSeleccionar.equipos.push(equipo);
    this.equipoEscogido = this.publicacionSeleccionar.equipos;
    this.actualizarEquipos(this.equipos);
    /* const equiposIds = this.publicacionSeleccionar.equipos.map((equipo: any) => equipo.id); */
  }

  eliminarEquipoPub(equipo_id: number) {
    this.publicacionSeleccionar.equipos = this.publicacionSeleccionar.equipos.filter((equip: any) => equip.id != equipo_id);
    this.equipoEscogido = this.publicacionSeleccionar.equipos;
    this.actualizarEquipos(this.equipos);
    /* const equiposIds = this.publicacionSeleccionar.equipos.map((equipo: any) => equipo.id); */
  }

  actualizarEquipos(equipos: any[]) {
    /* console.log(this.mostrarEquipos); */
    /* Bucle para recorrer los equipos y devolver true si encuentra relacion */
    equipos.forEach(equipo => {
      const listarEquipos = this.mostrarEquipos == 'perfil' ? this.equiposUsuario : this.equipoEscogido;

      equipo.guardado = listarEquipos.some(equipoLista => equipoLista.id == equipo.id);
    });
  }

  buscadorEquipos(equipo: string) {
    this.mensajeEquipos = null;
    if (equipo == null) {
      equipo = '';
    }
    this.cargaEquipos = true;
    this.servizo.buscadorEquipos(equipo).subscribe({
      next: (response) => {
        this.equipos = response.equipos;

        this.actualizarEquipos(this.equipos);
        this.cargaEquipos = false;
      },
      error: (erro) => {
        this.cargaEquipos = false;

        //console.error('Error en el filtro de publicaciones', erro);
        if (erro.status == 404) {
          this.mensajeEquipos = erro.error.message;
        }
      }
    })

  }

  guardarEquipos(equipo_id: number) {
    this.carga = true;
    this.servizo.guardarEquipoUsuario(this.user_id, equipo_id).subscribe({
      next: (equipo) => {
        const equipoActualizado = this.equipos.find(e => e.id == equipo_id);

        if (equipoActualizado) {
          this.equiposUsuario.push(equipo);
        }
        this.actualizarEquipos(this.equipos);
        this.actualizarEquipos(this.equiposOriginales);

        this.carga = false;
      },
      error: (erro) => {
        /* console.error('Error al añadir el equipo', erro); */
        this.mostrarEquipos = null;
        this.carga = false;

      }
    })
  }

  mensajeEliminacionEquipo(equipo: any) {
    this.tipoEliminacion = 'equipo';
    this.equipoSeleccionar = equipo;
  }

  mensajeEliminacionPub(publicacion: any) {
    this.tipoEliminacion = 'publicacion';
    this.publicacionSeleccionar = publicacion;
  }

  confirmarEliminacion() {

    if (this.tipoEliminacion == 'equipo') {
      this.eliminarEquipo();
    }

    if (this.tipoEliminacion == 'publicacion') {
      this.eliminarPublicacion(this.publicacionSeleccionar.id);
    }

  }

  eliminarEquipo() {
    this.tipoEliminacion = null;
    this.carga = true;
    let equipo_id = Number(this.equipoSeleccionar.id);
    this.servizo.eliminarEquipoUsuario(this.user_id, equipo_id).subscribe({
      next: (response) => {
        const equipoActualizado = this.equipos.find(e => e.id == equipo_id);

        if (equipoActualizado) {
          this.equiposUsuario = this.equiposUsuario.filter(equip => equip.id !== equipo_id);
        }
        this.actualizarEquipos(this.equipos);

        this.actualizarEquipos(this.equiposOriginales);

        this.carga = false;
      },
      error: (erro) => {
        /* console.error('Error en la eliminación del equipo', erro); */
        this.carga = false;

      }
    }
    )
  }

  @HostListener('window:keydown', ['$event'])
  onkeyDown(event: KeyboardEvent) {
    if (event.key == 'Escape') {
      this.menuAbierto = null;
      this.mostrarConfiguracion = false;
      /* this.confirmacionEliminacionEquipo = false; */
      this.mostrarEquipos = null;

    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (!target.closest('.menu_opciones')) {
      this.menuAbierto = null;
    }

    if (!target.closest('.menu-configuracion')) {
      this.mostrarConfiguracion = false;

    }
  }
  // Método para iniciar la edición de una publicación
  editarPublicacion(publicacion: any) {
    /* this.mostrarEquipos = 'publicacion'; */
    this.mensajeError = null;
    this.mensajeEquipos = null;
    this.cambiarPublicacion = true;     // Cambiamos estado para mostrar el formulario o la UI de edición      

    setTimeout(() => {
      document.querySelector('.datos-publicacion')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    });

    this.publicacionSeleccionar = publicacion;  // Guardamos la publicación a editar

    this.equiposOriginalesPub = [...publicacion.equipos];

    const pub = this.publicaciones.find(publicacion => publicacion.id == this.publicacionSeleccionar.id);
    this.equipoEscogido = pub.equipos ?? [];

    /* equipo.guardado = listarEquipos.some(equipoLista => equipoLista.id == equipo.id); */
    this.actualizarEquipos(this.equipos);

    // Rellenamos el formulario con los valores actuales de la publicación
    this.publicacionCRUD.patchValue({
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      zona_geografica: publicacion.zona_geografica == "undefined" ? '' : publicacion.zona_geografica,
    });

    this.archivoSelect = null;

  }

  // Método para modificar una publicación existente
  modificarPublicacion() {
    this.carga = true;
    /* Guarda en un array los ids de los equipos */

    const equiposIds = this.publicacionSeleccionar.equipos.map((equipo: any) => equipo.id);

    if (this.publicacionSeleccionar) {
      let video = this.archivoSelect;

      this.publicacionSeleccionar.titulo = this.publicacionCRUD.get('titulo')?.value;
      this.publicacionSeleccionar.descripcion = this.publicacionCRUD.get('descripcion')?.value;
      this.publicacionSeleccionar.zona_geografica = this.publicacionCRUD.get('zona_geografica')?.value;
      this.publicacionSeleccionar.equipos = equiposIds;

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
                  this.routerR.navigate(['/publicacion', response.slug], {
                    state: {
                      mensaje: 'Publicación actualizada correctamente'
                    }
                  });
                  /* console.log(response) */
                  this.publicacionSeleccionar.titulo = this.publicacionCRUD.get('titulo')?.value;
                  this.publicacionSeleccionar.descripcion = this.publicacionCRUD.get('descripcion')?.value;
                  this.publicacionSeleccionar.zona_geografica = this.publicacionCRUD.get('zona_geografica')?.value;
                  this.publicacionSeleccionar.imagen = response.imagen;
                  this.publicacionSeleccionar.public_id = response.public_id;
                  this.publicacionSeleccionar.equipos = response.equipos;
                  this.publicacionCRUD.reset();
                  this.cambiarPublicacion = false;
                  this.carga = false;
                },
                error: (erro) => {
                  //console.error("Error al modificar la publicacion", erro)
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
              this.carga = false;
            }
          })
        })

      } else {
        this.servizo.modificarPublicacion(this.publicacionSeleccionar.id, this.publicacionSeleccionar).subscribe({
          next: (response) => {
            /* console.log(response) */
            this.routerR.navigate(['/publicacion', response.id, response.slug], {
              state: {
                mensaje: 'Publicación actualizada correctamente'
              }
            });
            this.publicacionSeleccionar.imagen = response.imagen;
            this.publicacionSeleccionar.public_id = response.public_id;
            this.publicacionSeleccionar.equipos = response.equipos;
            this.publicacionCRUD.reset();
            this.archivoSelect = null;
            this.cambiarPublicacion = false;
            this.carga = false;
            /* MENSAJE DE QUE LA PUBLICACION FUE EDITADA CORRECTAMENTE */
          },
          error: (erro) => {
            //console.error("Error al modificar la publicacion", erro)
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
    this.tipoEliminacion = null;
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

  mostrarDatos() {
    this.mostrarInfo = !this.mostrarInfo;
    this.cambiar = false;
    this.cambiarPlan = false;
    this.cambiarPublicacion = false;
    this.cambiarUsuario = false;
  }

  mostrarPasswActual() {
    this.mostrarActual = 'text';
  }

  mostrarPassw() {
    this.mostrarContrasinal = 'text';
  }

  mostrarConf() {
    this.mostrarConfirmacion = 'text';
  }

  ocultarPasswActual() {
    this.mostrarActual = 'password';
  }

  ocultarPassw() {
    this.mostrarContrasinal = 'password';
  }

  ocultarConf() {
    this.mostrarConfirmacion = 'password';
  }


  changePassw() {
    if (this.userCRUD.get('changePassword')?.value) {
      this.userCRUD.get('contrasena')?.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
      this.userCRUD.get('contrasena_actual')?.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
      this.userCRUD.get('contrasena_confirmacion')?.setValidators([
        Validators.required,
      ]);
      this.userCRUD.get("contrasena")?.updateValueAndValidity();
      this.userCRUD.get("contrasena_actual")?.updateValueAndValidity();
      this.userCRUD.get("contrasena_confirmacion")?.updateValueAndValidity();

    } else {
      this.userCRUD.get('contrasena')?.clearValidators();
      this.userCRUD.get('contrasena_actual')?.clearValidators();
      this.userCRUD.get('contrasena_confirmacion')?.clearValidators();
      this.userCRUD.get("contrasena")?.updateValueAndValidity();
      this.userCRUD.get("contrasena_actual")?.updateValueAndValidity();
      this.userCRUD.get("contrasena_confirmacion")?.updateValueAndValidity();
      this.userCRUD.reset({
        nombre: this.userCRUD.get('nombre')?.value,
        email: this.userCRUD.get('email')?.value,
      });
      this.mensajeError = null;
    }
  }

  mensajeEliminacionCuenta() {
    this.mostrarMensajeConfirmacion = true;
  }

  cancelarEliminacion() {
    this.mostrarMensajeConfirmacion = false;
  }

  eliminarUsuario() {
    this.servizo.eliminarUsuarioActual().subscribe({
      next: () => {
        this.usuarioActual = null;
        this.routerR.navigate(['/'], {
          state: { mensaje: 'Usuario eliminado con exito' }
        })
      },
      error: (erro) => {
        if (erro.status == 404) {
          this.mensajeError = erro.error.message;
        }
      }
    })
  }

  mostrarPlan() {
    {
      this.servizo.mostrarPlan(Number(this.router.snapshot.paramMap.get('user_id'))).subscribe({
        next: (response) => {
          this.plan = response.plan;
          this.premium = response.premium;
          this.valor_insignia = response.insignia;
        },
        error: (err) => {
          //console.error('Error al mostrar el plan', err);
        }
      })
    }

  }

  editar() {
    this.cambiar = true;// Activamos el modo edición
    this.cambiarPlan = false;
    this.cambiarUsuario = false;// Activamos el modo edición
    this.perfilSeleccionar = this.perfil;

    setTimeout(() => {
      document.getElementById('editar-perfil')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    });

    this.perfilCRUD.patchValue({
      telefono: this.perfil.telefono,
      biografia: this.perfil.biografia,
      pais: this.perfil.pais,
    });
  }

  editarUsuario() {
    this.cambiarUsuario = true;// Activamos el modo edición
    this.cambiarPlan = false
    this.cambiar = false
    setTimeout(() => {
      document.getElementById('editar-usuario')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    });
    // Rellenamos el formulario con los datos del foro
    this.userCRUD.patchValue({
      nombre: this.usuarioActual.name,
      email: this.usuarioActual.email,
    });
  }

  editarPlan() {
    this.cambiarUsuario = false;// Activamos el modo edición
    this.cambiar = false;// Activamos el modo edición
    this.cambiarPlan = true; // Activamos el modo edición
    setTimeout(() => {
      document.getElementById('editar-plan')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    });
    this.planCRUD.patchValue({

      tipo_pago: this.plan.tipo_pago ?? '',
      metodo_pago: this.plan.metodo_pago ?? '',
    });

    this.usuarioActual.stripe_id ? this.planCRUD.get('tipo_pago')?.disable() : this.planCRUD.get('tipo_pago')?.enable();

  }

  modificarPerfil() {
    this.carga = true;

    if (this.perfilSeleccionar) {

      let multimedia = this.archivoSelect;

      this.perfilSeleccionar.telefono = this.perfilCRUD.get('telefono')?.value;
      this.perfilSeleccionar.pais = this.perfilCRUD.get('pais')?.value;
      this.perfilSeleccionar.biografia = this.perfilCRUD.get('biografia')?.value;

      if (multimedia) {
        this.servizo.recibirFirma().subscribe((firma: any) => {
          this.servizo.subirVideo(multimedia, firma).subscribe({
            next: (data: any) => {
              const perfilMultimedia = {
                ...this.perfilSeleccionar,
                foto: data.secure_url,
                public_id: data.public_id,
                bytes: data.bytes,
                resource_type: data.resource_type,
              };

              // Llamamos al servicio para modificar
              this.servizo.modificarPerfil(this.perfilSeleccionar.user_id, perfilMultimedia).subscribe({
                next: (response) => {
                  this.cambiar = false;
                  this.archivoSelect = null;
                  perfilMultimedia.telefono = this.perfilCRUD.get('telefono')?.value;
                  perfilMultimedia.pais = this.perfilCRUD.get('pais')?.value;
                  perfilMultimedia.biografia = this.perfilCRUD.get('biografia')?.value;

                  this.perfilSeleccionar.foto = response.foto;
                  this.perfilSeleccionar.public_id = response.public_id;
                  this.carga = false;
                  this.perfilCRUD.reset();
                },
                error: (erro) => {
                  this.carga = false;
                  if (erro.status == 422) {
                    this.mensajeError = erro.error.message;
                  }
                }

              });
            },
            error: (erro) => {
              //console.log('Error al modificar el perfil', erro);
              if (erro.status == 400 || erro.status == 413) {
                this.mensajeError = 'La imagen supera el tamaño máximo permitido: 10 MB';
              }
              this.carga = false;
              this.archivoSelect = null;
              this.loading = false;

            }
          })
        })

      } else {

        this.servizo.modificarPerfil(this.perfilSeleccionar.user_id, this.perfilSeleccionar).subscribe({
          next: (response) => {
            this.perfilSeleccionar.public_id = response.public_id;
            this.perfilSeleccionar.foto = response.foto;
            this.cambiar = false;

            this.archivoSelect = null;

            this.perfilCRUD.reset();
            this.carga = false;
          },
          error: (erro) => {
            /* console.error('Error al editar el perfil ', erro); */
            this.carga = false;
            if (erro.status == 422) {
              this.mensajeError = erro.error.message;
            }

            this.archivoSelect = null;
          }
        })
      }
    }

  }


  portalUrl() {
    this.loading = true;

    let data = {
      plan_id: this.plan.id,
      user_id: this.usuarioActual.id,
      rol: this.usuarioActual.rol,
      stripe_id: this.usuarioActual?.stripe_id
    };

    this.servizo.portalUrl(data).subscribe({
      next: (data) => {
        //console.log(data)
        window.location.href = data.url;


      },
      error: () => {
        this.loading = false;

      }

    })
  }

  modificarPlan(): void {
    this.carga = true;

    if (this.plan) {
      // Actualizamos
      this.plan.tipo_pago = this.planCRUD.get('tipo_pago')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarPlan(this.plan.user_id, this.plan).subscribe({
        next: () => {
          this.carga = false;
          this.portalUrl();
          this.cambiarPlan = false;
          this.planCRUD.reset({
            plan: '',
            tipo_pago: '',
          }); // Limpiamos el formulario
        },
        error: (erro) => {
          this.carga = false;
          //console.error("Error en el modificar del plan", erro);
        }
      });
    }
  }


  modificarUsuario(): void {
    this.carga = true;

    if (this.usuarioActual) {
      // Actualizamos
      this.usuarioActual.name = this.userCRUD.get('nombre')?.value;
      if (this.userCRUD.get('changePassword')?.value) {
        this.usuarioActual.current_password = this.userCRUD.get('contrasena_actual')?.value;
        this.usuarioActual.new_password = this.userCRUD.get('contrasena')?.value;
        this.usuarioActual.new_password_confirmation = this.userCRUD.get('contrasena_confirmacion')?.value;
      }

      this.usuarioActual.email = this.userCRUD.get('email')?.value;
      if (this.usuarioActual.rol == 'admin') {
        this.usuarioActual.rol = 'admin';
      } else {
        this.usuarioActual.rol = 'user';

      }

      // Llamamos al servicio para modificar
      this.servizo.modificarUsuario(this.usuarioActual.id, this.usuarioActual).subscribe({
        next: () => {
          this.cambiarUsuario = false;
          this.userCRUD.reset(); // Limpiamos el formulario
          this.carga = false;

        },
        error: (erro) => {
          this.carga = false;
          //console.error("Error al modificar el usuario", erro);
          if (erro.status == 403) {
            this.mensajeError = erro.error.message;
          }
        }
      });
    }
  }

  accesoPremium() {
    this.loading = true;
    let data = {
      plan_id: this.plan.id,
      user_id: this.usuarioActual.id,
      tipo_pago: this.planCRUD.get('tipo_pago')?.value
    };

    this.servizo.accesoPremium(data).subscribe({
      next: (data) => {
        window.location.href = data.url;
      },
      error: () => {
        this.loading = false;

      }
    })
  }

  archivoSeleccionado(event: any): void {
    this.archivoSelect = event.target.files[0];
  }

  cancelar() {
    this.desactivar = false;
    this.cambiar = false;
    this.cambiarPublicacion = false;
    this.cambiarPlan = false;
    this.cambiarUsuario = false;
    this.archivoSelect = null;
    this.publicacionSeleccionar.equipos = [...this.equiposOriginalesPub];
    this.equipoEscogido = [...this.equiposOriginalesPub];
    this.actualizarEquipos(this.equipos);
    this.perfilCRUD.reset();
    this.publicacionCRUD.reset();
    this.userCRUD.reset();
    this.planCRUD.reset();
    setTimeout(() => {
      document.querySelector('section.section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    });
  }

  cancelarEquipo() {
    this.tipoEliminacion = null;
    this.mostrarEquipos = null;
    this.equipos = [...this.equiposOriginales];
    /* this.actualizarEquipos(this.equipos); */
    /* LA LISTA DE EQUIPOS DEL USUARIO ESTÁ DESINCRONIZADO */
    this.equipoCRUD.reset();
    /* this.buscadorEquipos(''); */
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.servizo.usuarioActual$.subscribe((data) => {
        this.usuarioActual = data;
      });

      this.router.params.pipe(

        switchMap(params =>
          forkJoin({
            publicaciones: this.servizo.publicacionesUsuario(params['user_id']),
            foros: this.servizo.forosUsuario(params['user_id']),
            perfil: this.servizo.mostrarPerfil(params['user_id']),
            equipos: this.servizo.mostrarEquipos(),
            equiposUsuario: this.servizo.equiposUsuario(params['user_id']),
          })

        )
      ).subscribe(({ publicaciones, equipos, equiposUsuario, foros, perfil }) => {
        this.publicaciones = publicaciones.publicaciones;
        this.equiposOriginales = equipos;
        this.equipos = [...equipos];
        this.equiposUsuario = equiposUsuario;
        this.actualizarEquipos(this.equipos);

        this.foros = foros.foros;
        this.perfil = perfil;
        this.user_id = Number(this.router.snapshot.paramMap.get('user_id'));
        this.servizo.actualizarMeta(
          perfil.user.name + ' | Cosmyo',
          'Perfil del usuario'
        );
        this.carga = false;

      })

      this.mostrarPlan();

    }

  }
}
