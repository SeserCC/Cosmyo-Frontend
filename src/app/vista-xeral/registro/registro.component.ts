import { Component, input, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  formularioRegistro: FormGroup;
  usuarios: any[];
  errorMensaje: any;
  mostrarContrasinal: string = 'password';
  mostrarConfirmacion: string = 'password';
  loading = false;
  apiBackend: string = environment.apiBackend;

  constructor(private servizo: ServizoLoginService, private router: Router) {
    this.formularioRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required]), // Control para el nombre de usuario
      contrasinal: new FormControl('', [Validators.required, Validators.minLength(8)]), // Control para el nombre de usuario
      contrasinal_confirmation: new FormControl('', [Validators.required]), // Control para el nombre de usuario
      email: new FormControl('', [Validators.required]), // Control para la contraseña
      captcha: new FormControl(false, [Validators.requiredTrue]), // Control para la contraseña
    });
  }

  mostrar() {
    this.mostrarContrasinal = 'text';
  }

  mostrarConf() {
    this.mostrarConfirmacion = 'text';
  }

  ocultar() {
    this.mostrarContrasinal = 'password';
  }

  ocultarConf() {
    this.mostrarConfirmacion = 'password';
  }

  loginGoogle() {
    window.location.href = this.apiBackend + '/auth/google'
  }

  registro(evento: Event) {
    this.loading = true;

    // Evita que se recargue la página al enviar el formulario
    evento.preventDefault();

    // Si el formulario no es válido, se marcan todos los campos como tocados para mostrar errores y se detiene el proceso
    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();
      return;
    }

    const nuevoUsuario = {
      name: this.formularioRegistro.value.nombre,
      email: this.formularioRegistro.value.email,
      password: this.formularioRegistro.value.contrasinal,
      password_confirmation: this.formularioRegistro.value.contrasinal_confirmation,
      rol: "user",
      descargas: 0,
    }

    // Se llama al servicio para añadir el nuevo usuario con rol 'usuario'
    this.servizo.registro(nuevoUsuario).subscribe({
      next: () => {
        this.router.navigate(['/'], {
          state: { mensaje: 'Usuario creado correctamente, sesión iniciada' }
        });
      },
      error: (erro) => {
        //console.error('Error en el registro', erro);
        this.loading = false;
        if (erro.status == 422) {
          this.errorMensaje = erro.error;
        } else {
          this.errorMensaje = 'Error inesperado del servidor';
        }

        this.formularioRegistro.reset();
      }
    });


  }

}
