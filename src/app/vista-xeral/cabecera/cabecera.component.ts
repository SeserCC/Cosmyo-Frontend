import { Component, OnInit } from '@angular/core';
import { Route, Router, RouterLink } from '@angular/router';
import { Usuario } from '../../usuario';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css'
})
export class CabeceraComponent implements OnInit {

  //Variable para almacenar el usuario actual
  usuarioActual: any;

  // Constructor del componente, donde se inyectan el servicio de login y el router
  constructor(public servizo: ServizoLoginService, private router: Router) {
    // No es necesario realizar acciones aquí en este caso
  }

  // Método para cerrar sesión
  cerrarSesion() {
    // Elimina el usuario guardado en localStorage

    this.servizo.cerrarSesion(this.usuarioActual, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: () => {

        this.usuarioActual = null
        this.servizo.usuarioActual$.next(null);
        // Redirige a la portada de la aplicación
        this.router.navigate(['/']);
      }
    })

  }

  // Método que se ejecuta automáticamente al iniciar el componente
  ngOnInit(): void {

    this.servizo.usuarioActual$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

}
