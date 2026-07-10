import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';

@Component({
  selector: 'app-tecnologias-empleadas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tecnologias-empleadas.component.html',
  styleUrl: './tecnologias-empleadas.component.css'
})
export class TecnologiasEmpleadasComponent implements OnInit {
  constructor(private servizo: ServizoLoginService) {

  }
  ngOnInit(): void {
    this.servizo.actualizarMeta(
      'Desarrollo web | Cosmyo',
      'Tecnologias empleadas para la creación de la página Cosmyo'
    );
  }
}
