import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css'
})
export class InicioSesionComponent { // Implementa la interfaz OnInit para ejecutar código al inicializarse

  // Formulario reactivo para la autenticación del usuario
  formularioLogin: FormGroup;

  // Variable para mostrar mensajes de error en el login
  errorMensaje: string = "";

  // Variable para controlar estados
  cambiar: boolean = false;

  // Constructor donde se inicializa el formulario con validaciones y se inyectan servicios necesarios
  constructor(private servizo: ServizoLoginService, private router: Router) {
    this.formularioLogin = new FormGroup({
      usuario: new FormControl('', [Validators.required]),       // Campo obligatorio para el nombre de usuario
      contrasinal: new FormControl('', [Validators.required]),    // Campo obligatorio para la contraseña
      captcha: new FormControl(false, [Validators.requiredTrue])  // Checkbox de captcha obligatorio (debe estar marcado)
    });
  }

  // Método que se ejecuta al enviar el formulario para iniciar sesión
  iniciarSesion(evento: Event) {
    evento.preventDefault();  // Evita que el formulario se envíe de forma tradicional y recargue la página

    // Validamos que el formulario esté completo y correcto
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();  // Marca todos los campos como tocados para mostrar errores
      return;  // Sale si el formulario es inválido
    }

    // Obtenemos los datos del formulario (usuario y contraseña)
    const loginData = { email: this.formularioLogin.value.usuario, password: this.formularioLogin.value.contrasinal };

    this.servizo.login(loginData,
      {
        headers: new HttpHeaders({
          'accept': 'application/json',
        }),

      }).subscribe({
        next: (response) => {
          //REVISAR ya que me permite acceder a administracion siendo user
          if (response.user.rol == "admin") {
            this.router.navigate(['/administracion']);
          } else {
            this.router.navigate(['/portada']);
          }
        },

        error: (err) => {

          console.error('❌ Error login', err);
          if (err.status == 401) {
            this.errorMensaje = err.error.error;
            this.formularioLogin.reset()
          } else {
            this.errorMensaje = "Error inesperado del servidor";
          }

        }
      });
  }

}
