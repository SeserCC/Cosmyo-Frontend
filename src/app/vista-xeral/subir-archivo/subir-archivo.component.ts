import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { Imagen } from '../../imagen';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../usuario';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-subir-archivo',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './subir-archivo.component.html',
  styleUrl: './subir-archivo.component.css'
})
export class SubirArchivoComponent {
  // Array que contiene todas las imágenes/publicaciones
  publicaciones: any[] = [];
  nombreArchivo = '';

  // Formulario reactivo para añadir una publicación (imagen)
  formularioPublicacion: FormGroup;

  // Indicador para saber si falta seleccionar un archivo al crear la publicación
  faltaArchivo: boolean = false;

  // Archivo seleccionado por el usuario para subir la imagen
  archivoSelect: File | null = null;

  // Constructor donde se inicializa el formulario con validaciones y se inyectan servicios
  constructor(private servizo: ServizoLoginService, private router: Router) {
    this.formularioPublicacion = new FormGroup({
      titulo: new FormControl('', [Validators.required, Validators.minLength(4)]),       // Campo título obligatorio y mínimo 4 caracteres
      descripcion: new FormControl('', [Validators.required, Validators.minLength(4)]),  // Campo descripción obligatorio y mínimo 4 caracteres
      zona_geografica: new FormControl('', [Validators.required, Validators.minLength(4)]),  // Campo descripción obligatorio y mínimo 4 caracteres
    })
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

  // Función para añadir una nueva publicación llamando al servicio correspondiente
  engadirPublicacion(): void {

    const nuevaPublicacion = new FormData();
    nuevaPublicacion.append('titulo', this.formularioPublicacion.get('titulo')?.value);
    nuevaPublicacion.append('descripcion', this.formularioPublicacion.get('descripcion')?.value);
    nuevaPublicacion.append('zona_geografica', this.formularioPublicacion.get('zona_geografica')?.value);

    if (this.archivoSelect) {
      nuevaPublicacion.append('imagen', this.archivoSelect);
    }

    this.servizo.engadirPublicacion(nuevaPublicacion, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (publicacion) => {
        //Añadimos el tema mediante suscripcion
        this.publicaciones.push(publicacion);
        /* (this.archivoSelect) */
        this.formularioPublicacion.reset();
        /*  this.archivoSelect = null; */
        this.router.navigate(['/foto'])
      },
      error: (erro) => {
        console.error(erro);
      }
    });
  }

}
