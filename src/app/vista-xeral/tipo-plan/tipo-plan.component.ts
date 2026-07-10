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
  plan: any;
  premium: boolean = true;
  carga: boolean = true;
  constructor(public servizo: ServizoLoginService, private router: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  esPremium() {
    {
      this.servizo.mostrarPlan(this.usuarioActual.id).subscribe({
        next: (response) => {
          this.premium = response.premium;
          this.carga = false;

        },
        error: (err) => {
          this.carga = false;

          //console.error('Error al mostrar el plan', err);
        }
      })
    }

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.servizo.usuarioActual$.subscribe((data) => {
        //console.log(data);
        this.usuarioActual = data;
        this.servizo.actualizarMeta(
          'Tipo de plan | Cosmyo',
          'Escoge entre dos tipos de plan: Lite o Premium'
        );
        if (this.usuarioActual) {
          this.esPremium();

        } else {
          this.carga = false;

        }
      });

    }

  }
}
