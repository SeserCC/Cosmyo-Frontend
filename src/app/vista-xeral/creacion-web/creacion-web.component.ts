import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';

@Component({
  selector: 'app-creacion-web',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './creacion-web.component.html',
  styleUrl: './creacion-web.component.css'
})
export class CreacionWebComponent implements OnInit {
  constructor(private servizo: ServizoLoginService) {

  }
  ngOnInit(): void {
    this.servizo.actualizarMeta(
      'Sobre nosotros | Cosmyo',
      'Historia de la creación de Cosmyo'
    );
  }
}
