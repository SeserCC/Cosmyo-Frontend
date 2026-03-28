import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-tipo-plan',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './tipo-plan.component.html',
  styleUrl: './tipo-plan.component.css'
})
export class TipoPlanComponent implements OnInit {
  usuarioActual: any;
  premium: boolean = true;
  constructor(public servizo: ServizoLoginService, private router: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  esPremium() {
    {
      this.servizo.mostrarPlan(this.usuarioActual.id, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        }),
      }).subscribe({
        next: (response) => {
          this.premium = response.premium;

        },
        error: (err) => {
          console.error('Error al mostrar el plan', err);
        }
      })
    }

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;

        if (this.usuarioActual) {
          this.esPremium();
        }
      });

    }

  }
}
