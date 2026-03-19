import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';

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
  errorMensaje: string = "";

  constructor(private servizo: ServizoLoginService, private router: Router) {
    this.formularioRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required]), // Control para el nombre de usuario
      contrasinal: new FormControl('', [Validators.required, Validators.minLength(8)]), // Control para el nombre de usuario
      contrasinal_confirmation: new FormControl('', [Validators.required]), // Control para el nombre de usuario
      email: new FormControl('', [Validators.required, Validators.email]), // Control para la contraseña
      captcha: new FormControl(false, [Validators.requiredTrue]), // Control para la contraseña
    });
  }

  registro(evento: Event) {
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
    this.servizo.registro(nuevoUsuario, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);

      },
      error: (erro) => {
        console.error('Error en el registro', erro);
        if (erro.status == 409) {
          this.errorMensaje = erro.error.error;
        }

      }
    });


  }

}
