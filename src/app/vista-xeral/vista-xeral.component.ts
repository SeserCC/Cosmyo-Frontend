import { Component, EventEmitter, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PieComponent } from "./pie/pie.component";
import { CabeceraComponent } from "./cabecera/cabecera.component";
import { ServizoLoginService } from '../servizo-login.service';


@Component({
  selector: 'app-vista-xeral',
  standalone: true,
  imports: [RouterOutlet, PieComponent, CabeceraComponent],
  templateUrl: './vista-xeral.component.html',
  styleUrl: './vista-xeral.component.css'
})
export class VistaXeralComponent {

}
