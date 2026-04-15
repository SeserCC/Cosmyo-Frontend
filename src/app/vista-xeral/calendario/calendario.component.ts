import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { Evento } from '../../evento';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  // Array para almacenar todos los eventos recibidos del servicio
  eventos: any[];

  // Array para almacenar los eventos que han sido filtrados (debería tener un tipo más específico)
  eventosFiltrados: [];

  // Array con los nombres de los meses, usado para mostrar el mes actual en texto
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Constructor del componente, donde se inyecta el servicio
  constructor(private servizo: ServizoLoginService) {
    // No se realizan acciones adicionales en el constructor por ahora
  }

  // Nombre del mes actual, obtenido según la fecha del sistema
  nombreMesActual = this.meses[new Date().getMonth()];

  mostrarEventos() {

    this.servizo.mostrarEventos({
      headers: new HttpHeaders({
        /* 'Authorization': `Bearer ${this.servizo.token}`, */
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.eventos = response;
      },
      error: (err) => {
        //console.error('❌ Error al mostrar los eventos', err);
        //Mensaje de error
      }
    })
  }



  // Método que se ejecuta automáticamente al iniciar el componente
  ngOnInit(): void {
    this.mostrarEventos();
  }


}
