import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './exitoPago.component.html',
  styleUrl: './exitoPago.component.css'
})
export class ExitoPagoComponent implements OnInit {
  usuarioActual: any;
  constructor(public servizo: ServizoLoginService, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;
      });
    }
  }

}