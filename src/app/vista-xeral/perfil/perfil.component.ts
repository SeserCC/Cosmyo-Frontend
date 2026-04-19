import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ServizoLoginService } from '../../servizo-login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  perfil: any;
  plan: any;
  valor_insignia: any;
  perfilSeleccionar: any;
  planSeleccionar: any;
  usuarios: any[];
  mostrarMensajeConfirmacion: boolean = false;
  perfilCRUD: FormGroup;
  userCRUD: FormGroup;
  planCRUD: FormGroup;
  desactivar: boolean;
  cambiar: boolean;
  premium: boolean;
  mensajeError: any;
  cambiarPlan: boolean;
  cambiarUsuario: boolean;
  perfilFoto = "http://localhost:8000/img/perfiles/";
  archivoSelect: File | null;
  mostrarActual: string = 'password';
  mostrarContrasinal: string = 'password';
  mostrarConfirmacion: string = 'password';

  usuarioActual: any;

  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute, private routerR: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.perfilCRUD = new FormGroup({
      telefono: new FormControl('', [Validators.minLength(9)]),
      red_social_principal: new FormControl(''),
      usuario_red_social: new FormControl(''),
      pais: new FormControl('', [Validators.required]),
      biografia: new FormControl('', [Validators.required])
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

  eliminarUsuario(id: number) {
    this.servizo.eliminarUsuario(id, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.usuarioActual = null;
        this.routerR.navigate(['/'], {
          state: { mensaje: 'Usuario eliminado con exito' }
        })
      },
      error: (erro) => {
        if (erro.status == 404) {
          this.mensajeError = erro.error;
        }
      }
    })
  }

  mostrarPlan() {
    {
      this.servizo.mostrarPlan(Number(this.router.snapshot.paramMap.get('user_id')), {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        }),
      }).subscribe({
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

    this.perfilCRUD.patchValue({
      telefono: this.perfil.telefono,
      red_social_principal: this.perfil.red_social_principal,
      biografia: this.perfil.biografia,
      usuario_red_social: this.perfil.usuario_red_social,
      pais: this.perfil.pais,
    });
  }

  editarUsuario() {
    this.cambiarUsuario = true;// Activamos el modo edición
    this.cambiarPlan = false
    this.cambiar = false
    //(this.perfilSeleccionar) // Guardamos el foro seleccionado
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
    //console.log(this.plan);
    this.planCRUD.patchValue({

      tipo_pago: this.plan.tipo_pago ?? '',
      metodo_pago: this.plan.metodo_pago ?? '',
    });

    this.usuarioActual.stripe_id ? this.planCRUD.get('tipo_pago')?.disable() : this.planCRUD.get('tipo_pago')?.enable();

  }

  modificarPerfil() {

    const modificarPerfil = new FormData();

    if (this.perfilSeleccionar) {

      if (this.archivoSelect) {
        modificarPerfil.append('foto', this.archivoSelect);
      }

      modificarPerfil.append('telefono', this.perfilCRUD.get('telefono')?.value);
      modificarPerfil.append('red_social_principal', this.perfilCRUD.get('red_social_principal')?.value);
      modificarPerfil.append('usuario_red_social', this.perfilCRUD.get('usuario_red_social')?.value);
      modificarPerfil.append('pais', this.perfilCRUD.get('pais')?.value);
      modificarPerfil.append('biografia', this.perfilCRUD.get('biografia')?.value);
      modificarPerfil.append('estado', this.perfil.estado);
      modificarPerfil.append('_method', 'PUT');

      // Llamamos al servicio para modificar
      this.servizo.modificarPerfil(this.perfilSeleccionar.user_id, modificarPerfil, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        })
      }).subscribe({
        next: (response) => {
          this.cambiar = false;
          this.archivoSelect = null;
          this.perfilSeleccionar.telefono = this.perfilCRUD.get('telefono')?.value;
          this.perfilSeleccionar.red_social_principal = this.perfilCRUD.get('red_social_principal')?.value;
          this.perfilSeleccionar.usuario_red_social = this.perfilCRUD.get('usuario_red_social')?.value;
          this.perfilSeleccionar.pais = this.perfilCRUD.get('pais')?.value;
          this.perfilSeleccionar.biografia = this.perfilCRUD.get('biografia')?.value;
          this.perfilSeleccionar.foto = response.foto;
        },
        error: (erro) => {
          //console.error("Error al modificar los datos personales", erro)
          if (erro.status == 422) {
            this.mensajeError = erro.error;
          }
        }

      });
    }

  }


  portalUrl() {
    let data = {
      plan_id: this.plan.id,
      user_id: this.usuarioActual.id,
      rol: this.usuarioActual.rol,
      stripe_id: this.usuarioActual?.stripe_id
    };

    this.servizo.portalUrl(data, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      })
    }).subscribe({
      next: (data) => {
        //console.log(data)
        window.location.href = data.url;
      }

    })
  }

  modificarPlan(): void {

    if (this.plan) {
      // Actualizamos
      this.plan.tipo_pago = this.planCRUD.get('tipo_pago')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarPlan(this.plan.user_id, this.plan, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        })
      }).subscribe({
        next: () => {
          this.portalUrl();
          this.cambiarPlan = false;
          this.planCRUD.reset({
            plan: '',
            tipo_pago: '',
          }); // Limpiamos el formulario
        },
        error: (erro) => {
          //console.error("Error en el modificar del plan", erro);
        }
      });
    }
  }


  modificarUsuario(): void {

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
      this.servizo.modificarUsuario(this.usuarioActual.id, this.usuarioActual, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        })
      }).subscribe({
        next: () => {
          this.cambiarUsuario = false;
          this.userCRUD.reset(); // Limpiamos el formulario
        },
        error: (erro) => {
          //console.error("Error al modificar el usuario", erro);
          if (erro.status == 403) {
            this.mensajeError = erro.error;
          }
        }
      });
    }
  }

  accesoPremium() {
    let data = {
      plan_id: this.plan.id,
      user_id: this.usuarioActual.id,
      tipo_pago: this.planCRUD.get('tipo_pago')?.value
    };

    this.servizo.accesoPremium(data, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      })
    }).subscribe({
      next: (data) => {
        window.location.href = data.url;

      }
    })
  }

  archivoSeleccionado(event: any): void {
    this.archivoSelect = event.target.files[0];
  }

  cancelar() {
    this.desactivar = false;
    this.cambiar = false;
    this.cambiarPlan = false;
    this.cambiarUsuario = false;
    this.perfilCRUD.reset();
    this.userCRUD.reset();
    this.planCRUD.reset();

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;
      });

      this.router.params.pipe(
        switchMap(params => {
          return this.servizo.mostrarPerfil(params['user_id']);
        })
      ).subscribe(perfil => {
        this.perfil = perfil;
      })

      this.mostrarPlan();

    }

  }
}
