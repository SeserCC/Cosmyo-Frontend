import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { Usuario } from '../../usuario';
import { ServizoLoginService } from '../../servizo-login.service';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css'
})
export class CabeceraComponent implements OnInit {

  perfil: any;

  //Variable para almacenar el usuario actual
  usuarioActual: any;

  cerrandoSesionCarga = false;

  ocultar = false;

  // Constructor del componente, donde se inyectan el servicio de login y el router
  constructor(public servizo: ServizoLoginService, private router: Router, private routerActivate: ActivatedRoute) {

  }

  eliminarMensaje() {
    this.ocultar = true;
    this.servizo.ocultarMensajeDemo();
  }

  // Método para cerrar sesión
  cerrarSesion() {
    // Elimina el usuario guardado en localStorage
    this.cerrandoSesionCarga = true;
    this.servizo.cerrarSesion(this.usuarioActual).subscribe({
      next: () => {
        // Redirige a la portada de la aplicación
        this.cerrandoSesionCarga = false;
        this.router.navigate(['/']);
      },
      error: () => (this.cerrandoSesionCarga = false)
    })

  }

  // Método que se ejecuta automáticamente al iniciar el componente
  ngOnInit(): void {
    this.servizo.usuarioActual$.subscribe((data) => {
      //console.log(data);
      this.usuarioActual = data;
    });

    this.ocultar = this.servizo.estadoMensaje();

  }

}
