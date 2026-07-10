import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css'
})
export class InicioSesionComponent implements OnInit { // Implementa la interfaz OnInit para ejecutar código al inicializarse

  // Formulario reactivo para la autenticación del usuario
  formularioLogin: FormGroup;

  apiBackend: string = environment.apiBackend;

  // Variable para mostrar mensajes de error en el login
  errorMensaje: string = "";

  // Variable para controlar estados
  cambiar: boolean = false;

  mostrarContrasinal: string = 'password';

  abriendoSesionCarga = false;


  // Constructor donde se inicializa el formulario con validaciones y se inyectan servicios necesarios
  constructor(private servizo: ServizoLoginService, private router: Router) {
    this.formularioLogin = new FormGroup({
      usuario: new FormControl('', [Validators.required, Validators.email]),       // Campo obligatorio para el nombre de usuario
      contrasinal: new FormControl('', [Validators.required]),    // Campo obligatorio para la contraseña
      captcha: new FormControl(false, [Validators.requiredTrue])  // Checkbox de captcha obligatorio (debe estar marcado)
    });
  }

  loginGoogle() {
    window.location.href = this.apiBackend + '/auth/google'
  }

  mostrar() {
    this.mostrarContrasinal = 'text';
  }

  ocultar() {
    this.mostrarContrasinal = 'password';
  }

  // Método que se ejecuta al enviar el formulario para iniciar sesión
  iniciarSesion(evento: Event) {
    this.abriendoSesionCarga = true;
    evento.preventDefault();  // Evita que el formulario se envíe de forma tradicional y recargue la página

    // Validamos que el formulario esté completo y correcto
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();  // Marca todos los campos como tocados para mostrar errores
      return;  // Sale si el formulario es inválido
    }

    // Obtenemos los datos del formulario (usuario y contraseña)
    const loginData = { email: this.formularioLogin.value.usuario, password: this.formularioLogin.value.contrasinal };

    this.servizo.login(loginData).subscribe({
      next: (response) => {
        this.abriendoSesionCarga = false;
        if (response.user.rol == "admin") {
          this.router.navigate(['/administracion']);
        } else {
          this.router.navigate(['/']);
        }
      },

      error: (err) => {
        this.abriendoSesionCarga = false;

        //console.error('❌ Error login', err);
        if (err.status == 401) {
          this.errorMensaje = err.error.error;
          this.formularioLogin.reset()
        } else if (err.status == '422') {
          this.errorMensaje = "Correo inválido, ej: ton618@example.com"
        } else if (err.status == '503') {
          this.errorMensaje = "Estamos en mantenimiento, prueba más tarde";
        } else {
          this.errorMensaje = "Error inesperado del servidor";
          //console.error("El servidor no responde correctemante", err);
        }

      }
    });
  }
  ngOnInit(): void {
    this.servizo.actualizarMeta(
      'Inicio de sesión | Cosmyo',
      'Acceso al login'
    );
  }
}
