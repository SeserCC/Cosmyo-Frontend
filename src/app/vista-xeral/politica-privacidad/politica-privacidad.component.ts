import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './politica-privacidad.component.html',
  styleUrl: './politica-privacidad.component.css'
})
export class PoliticaPrivacidadComponent implements OnInit {
  constructor(private servizo: ServizoLoginService) {

  }
  ngOnInit(): void {
    this.servizo.actualizarMeta(
      'Política de privacidad | Cosmyo',
      'Datos recolectados de los usuarios y su gestión'
    );
  }
}
