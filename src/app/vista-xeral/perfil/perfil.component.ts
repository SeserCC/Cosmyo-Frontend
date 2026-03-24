import { Component, OnInit } from '@angular/core';
import { ServizoLoginService } from '../../servizo-login.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

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
  perfilSeleccionar: any;
  planSeleccionar: any;
  perfilCRUD: FormGroup;
  userCRUD: FormGroup;
  planCRUD: FormGroup;
  desactivar: boolean;
  cambiar: boolean;
  premium: boolean;
  cambiarPlan: boolean;
  cambiarUsuario: boolean;
  perfilFoto = "http://localhost:8000/img/perfiles/";
  archivoSelect: File | null;

  usuarioActual: any;

  constructor(private servizo: ServizoLoginService, private router: ActivatedRoute) {
    this.perfilCRUD = new FormGroup({
      telefono: new FormControl('', [Validators.minLength(9)]),
      red_social_principal: new FormControl(''),
      usuario_red_social: new FormControl(''),
      pais: new FormControl('', [Validators.required]),
      biografia: new FormControl('', [Validators.required])
    });

    this.planCRUD = new FormGroup({
      tipo_pago: new FormControl('Ninguno'),
      metodo_pago: new FormControl({ value: 'Ninguno', disabled: true }),
      plan: new FormControl({ value: '', disabled: true }),
    });

    this.userCRUD = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      contrasena: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email]),
      contrasena_actual: new FormControl('', [Validators.required]),
      contrasena_confirmacion: new FormControl('', [Validators.required]),
    });

  }

  mostrarPerfil() {
    {
      this.servizo.mostrarPerfil(Number(this.router.snapshot.paramMap.get('user_id')), {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        }),
      }).subscribe({
        next: (response) => {
          this.perfil = response;

        },
        error: (err) => {
          console.error('Error al mostrar el perfil', err);
          /* Te falta añadir un reenvio a la pagina 404 indicando que no existe el usuario */
        }
      })
    }

  }

  usuarioLogueado() {
    this.servizo.usuarioLogueado({
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (data) => {
        this.usuarioActual = data;
        //console.log(this.usuarioActual);
        //this.desactivar = this.usuarioActual.stripe_id ? true : false;
      }
    });

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
        },
        error: (err) => {
          console.error('Error al mostrar el plan', err);
        }
      })
    }

  }

  editar() {
    this.cambiar = true;// Activamos el modo edición
    this.cambiarPlan = false;
    this.cambiarUsuario = false;// Activamos el modo edición
    this.perfilSeleccionar = this.perfil;
    //(this.perfilSeleccionar) // Guardamos el foro seleccionado
    // Rellenamos el formulario con los datos del foro
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
    /* Eliminaste la variable planSeleccionar aqui */
    (this.plan);
    this.planCRUD.patchValue({
      plan: this.plan.anuncio ? "gratuito" : "premium",
      tipo_pago: this.plan.tipo_pago,
      metodo_pago: this.plan.metodo_pago,
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
          console.error("Error al modificar del comentario", erro)
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
      this.plan.plan = this.planCRUD.get('plan')?.value;
      this.plan.tipo_pago = this.planCRUD.get('tipo_pago')?.value;
      this.plan.metodo_pago = this.planCRUD.get('metodo_pago')?.value;

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
          console.error("Error en el modificar del plan", erro);

        }
      });
    }
  }


  modificarUsuario(): void {

    if (this.usuarioActual) {
      // Actualizamos
      this.usuarioActual.name = this.userCRUD.get('nombre')?.value;
      this.usuarioActual.current_password = this.userCRUD.get('contrasena_actual')?.value;
      this.usuarioActual.new_password = this.userCRUD.get('contrasena')?.value;
      this.usuarioActual.new_password_confirmation = this.userCRUD.get('contrasena_confirmacion')?.value;
      this.usuarioActual.email = this.userCRUD.get('email')?.value;
      this.usuarioActual.rol = 'user';

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
          console.error("Error en el modificar del usuario", erro);

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
    if (this.servizo.token) {
      this.mostrarPerfil();
      this.mostrarPlan();
      this.usuarioLogueado();
    }
  }
}
