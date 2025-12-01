import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-fotos-videos',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './fotos-videos.component.html',
  styleUrl: './fotos-videos.component.css'
})
export class FotosVideosComponent implements OnInit {
  // Array que almacenará todas las publicaciones de imágenes
  publicaciones: any[];
  fotosPublicaciones = "http://localhost:8000/img/publicaciones/";
  buscadorForm: FormGroup;
  usuarioActual: any;
  like: boolean = false;
  likes: number[] = [];
  colorLike: boolean[] = [];

  // Array con todos los usuarios disponibles (probablemente para asociar autores a imágenes)
  usuarios: any[];

  // Constructor del componente, se inyecta el servicio de login y el router
  constructor(private servizo: ServizoLoginService, private formularioBuscador: FormBuilder) {
    this.buscadorForm = this.formularioBuscador.group({
      titulo: ['']
    })
  }

  cancelar() {

  }


  filtrarPublicaciones(publicacion: string) {
    this.servizo.buscadorPublicaciones(publicacion, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {

        this.publicaciones = response[0];

      }
    })
  }

  mostrarPublicaciones() {

    this.servizo.mostrarPublicaciones({
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.publicaciones = response[0];
        this.likes = response[1];
        this.usuarioActual = response[2];
        this.colorLike = response[3];

      },
      error: (err) => {
        console.error('❌ Error al mostrar las publicaciones', err);
        //Mensaje de error
      }
    })
  }

  darLike(publicacion_id: number) {
    this.servizo.usuarioLogueado({
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (usuario) => {
        this.usuarioActual = usuario;

        const estado = this.colorLike[publicacion_id];

        const likePublicacion = {
          user_id: this.usuarioActual.id,
          publicacion_id: publicacion_id,
          like: !estado,
          _method: "PUT",
        }
        this.servizo.darLike(publicacion_id, likePublicacion, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this.servizo.token}`,
            'Accept': 'application/json',
          }),
        }).subscribe({
          next: (response) => {
            this.colorLike[publicacion_id] = response.like;
            this.likes[publicacion_id] = response.likes;

          },
          error: (err) => {
            console.error("Error en el like de la publicacion", err);
          }
        })

      }
    })
  }

  mostrarUsuarios() {
    this.servizo.mostrarUsuarios({
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.usuarios = response;

      },
      error: (err) => {
        console.error('❌ Error al mostrar los usuarios', err);
        //Mensaje de error

      }
    })
  }

  // Método que se ejecuta automáticamente al iniciar el componente
  ngOnInit(): void {

    if (this.servizo.token) {
      this.mostrarPublicaciones();

      this.mostrarUsuarios();
    }

  }

}
