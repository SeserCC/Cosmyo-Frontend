import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { error } from 'node:console';
import { TiempoTranscurridoPipe } from '../../tiempo-transcurrido.pipe';

@Component({
  selector: 'app-fotos-videos',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, TiempoTranscurridoPipe],
  templateUrl: './fotos-videos.component.html',
  styleUrl: './fotos-videos.component.css'
})
export class FotosVideosComponent implements OnInit {
  // Array que almacenará todas las publicaciones de imágenes
  publicaciones: any[];
  buscadorForm: FormGroup;
  carga: boolean = true;
  usuarioActual: any;
  like: boolean = false;
  likes: number[] = [];
  colorLike: boolean[] = [];
  mensajeSesion = '';
  loading = false;
  mensajeError: any;

  // Array con todos los usuarios disponibles (probablemente para asociar autores a imágenes)
  usuarios: any[];

  // Constructor del componente, se inyecta el servicio de login y el router
  constructor(private servizo: ServizoLoginService, private formularioBuscador: FormBuilder, @Inject(PLATFORM_ID) private platform_id: Object) {
    this.buscadorForm = this.formularioBuscador.group({
      titulo: ['']
    })
  }


  filtrarPublicaciones(publicacion: string) {
    this.carga = true;

    this.servizo.buscadorPublicaciones(publicacion).subscribe({
      next: (response) => {

        this.publicaciones = response.publicacions;
        this.mensajeError = null;
        this.carga = false;
      },
      error: (erro) => {
        this.carga = false;

        //console.error('Error en el filtro de publicaciones', erro);
        if (erro.status == 404) {
          this.mensajeError = erro.error;
        }
      }
    })
  }

  mostrarPublicaciones() {
    this.servizo.mostrarPublicaciones().subscribe({
      next: (response) => {

        this.publicaciones = response.publicacions;
        this.carga = false;
      },
      error: (err) => {
        //console.error('❌ Error al mostrar las publicaciones', err);
      }
    })
  }

  // Método que se ejecuta automáticamente al iniciar el componente
  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.mostrarPublicaciones();
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;
        //console.log(this.usuarioActual);
      });
    }

  }

}
