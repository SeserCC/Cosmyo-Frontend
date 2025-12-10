import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './exitoPago.component.html',
  styleUrl: './exitoPago.component.css'
})
export class ExitoPagoComponent {
  constructor(private router: ActivatedRoute) {

  }
}