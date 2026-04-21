import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { PieComponent } from "./pie/pie.component";
import { CabeceraComponent } from "./cabecera/cabecera.component";
import { ServizoLoginService } from '../servizo-login.service';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs';


@Component({
  selector: 'app-vista-xeral',
  standalone: true,
  imports: [RouterOutlet, PieComponent, CabeceraComponent, CommonModule],
  templateUrl: './vista-xeral.component.html',
  styleUrl: './vista-xeral.component.css'
})
export class VistaXeralComponent implements OnInit {
  carga: boolean = true;
  usuarioActual: any;

  constructor(private servizo: ServizoLoginService, private route: Router) {

  }

  ngOnInit(): void {

    /* this.route.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.carga = true;
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        setTimeout(() => this.carga = false, 300)
      }
    }) */


  }
}
