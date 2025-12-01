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
export class RegistroComponent implements OnInit {

  formularioRegistro: FormGroup;
  usuarios: any[];
  errorMensaje: string = "";
  gratuito: boolean = true;

  constructor(private servizo: ServizoLoginService, private router: Router) {
    this.formularioRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required]), // Control para el nombre de usuario
      contrasinal: new FormControl('', [Validators.required, Validators.minLength(8)]), // Control para el nombre de usuario
      contrasinal_confirmation: new FormControl('', [Validators.required]), // Control para el nombre de usuario
      plan: new FormControl('', [Validators.required]), // Control para el nombre de usuario
      metodo_pago: new FormControl(''), // Control para el nombre de usuario
      tipo_pago: new FormControl(''), // Control para el nombre de usuario
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
      plan: this.formularioRegistro.value.plan,
      metodo_pago: this.formularioRegistro.value.metodo_pago,
      tipo_pago: this.formularioRegistro.value.tipo_pago,
    }

    // Se llama al servicio para añadir el nuevo usuario con rol 'usuario'
    this.servizo.registro(nuevoUsuario, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: () => {
        this.router.navigate(['/portada']);

      },
      error: (erro) => {
        console.error('Error en el registro', erro);
        if (erro.status == 409) {
          this.errorMensaje = erro.error.error;
        }

      }
    });


  }

  ngOnInit(): void {
    this.formularioRegistro.get('plan')?.valueChanges.subscribe(valor => {

      if (valor == 'gratuito' || valor == '') {
        this.gratuito = true;

        this.formularioRegistro.get("metodo_pago")?.clearValidators();
        this.formularioRegistro.get("tipo_pago")?.clearValidators();
        this.formularioRegistro.get('metodo_pago')?.markAsUntouched();
        this.formularioRegistro.get('tipo_pago')?.markAsUntouched();
        this.formularioRegistro.get('tipo_pago')?.setValue('');
        this.formularioRegistro.get('metodo_pago')?.setValue('');
      } else {
        this.gratuito = false;

        this.formularioRegistro.get('metodo_pago')?.setValidators([
          Validators.required,
        ]);

        this.formularioRegistro.get('tipo_pago')?.setValidators([
          Validators.required,
        ]);

      }
      this.formularioRegistro.get("metodo_pago")?.updateValueAndValidity();
      this.formularioRegistro.get("tipo_pago")?.updateValueAndValidity();
    })
  }
}
