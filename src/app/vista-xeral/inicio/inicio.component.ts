
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  urlCloud = 'https://res.cloudinary.com/astronexus-cloud/image/upload/';
  usuarioActual: any;
  mensaje = '';

  constructor(public servizo: ServizoLoginService, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;
      });

      this.mensaje = history.state.mensaje;

      history.replaceState({}, document.title);
    }

  }
}
