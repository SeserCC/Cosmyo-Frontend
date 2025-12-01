
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  usuarioActual: any;
  constructor(public servizo: ServizoLoginService) {

  }

  /* usuarioLogueado() {
    this.servizo.usuarioLogueado({
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      })
    }).subscribe(usuario => {
      this.usuarioActual = usuario;
    })
  } */

  ngOnInit(): void {
    this.servizo.usuarioActual$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });

    /*     if (this.servizo.token) {
          this.usuarioLogueado();
        } */
  }
}
