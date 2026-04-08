import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { VistaXeralComponent } from "./vista-xeral/vista-xeral.component";
import { ServizoLoginService } from './servizo-login.service';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, VistaXeralComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Astronexus';

  constructor(private servizo: ServizoLoginService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  estado() {
    let urlActual = window.location.href;
    this.servizo.mostrarEstado({
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(timeout(1500)).subscribe({
      next: (response) => {

        if (response.maintenance) {
          this.router.navigate(['/mantenimiento']);
        } else if (response.maintenance == false && urlActual.includes('mantenimiento')) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Error al consultar el estado, redirigiendo a mantenimiento', err);
        if (!urlActual.includes('/mantenimiento')) {
          this.router.navigate(['/mantenimiento']);

        }
      }
    })
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.estado();
    }

  }

}

