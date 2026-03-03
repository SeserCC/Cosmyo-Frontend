import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Foro } from '../../foro';
import { ServizoLoginService } from '../../servizo-login.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css'
})
export class ForoComponent implements OnInit {
  // Array donde se almacenan todos los foros
  foros: any[];

  // Formulario reactivo para añadir o editar un foro
  formularioCRUDForo: FormGroup;

  // Bandera que indica si se debe mostrar el formulario o si estamos en modo edición
  cambiar: boolean = false;

  // Foro actualmente seleccionado para editar
  foroSeleccionar: any;

  // Constructor del componente, se inyecta el servicio y se inicializa el formulario
  constructor(private servizo: ServizoLoginService) {
    this.formularioCRUDForo = new FormGroup({
      tema: new FormControl('', [Validators.required]) // Campo obligatorio para el tema del foro
    });
  }

  // Método para mostrar el formulario de creación/edición
  mostrarFormulario() {
    this.cambiar = true;
  }

  // Método para añadir un nuevo foro llamando al servicio
  engadirForo() {
    const nuevoForo = {
      tema: this.formularioCRUDForo.value.tema,
    }

    this.servizo.engadirForo(nuevoForo, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (foro) => {
        //Añadimos el tema mediante suscripcion
        this.foros.push(foro);
        this.formularioCRUDForo.reset();
      },
      error: (erro) => {
        console.error(erro);
      }
    });
  }

  // Método para editar un foro
  editarForo(foro: any) {
    this.cambiar = true; // Activamos el modo edición
    this.foroSeleccionar = foro; // Guardamos el foro seleccionado
    // Rellenamos el formulario con los datos del foro
    this.formularioCRUDForo.patchValue({
      tema: foro.tema,
    });
  }

  // Método para guardar la modificación de un foro
  modificarForo() {
    this.cambiar = false;

    if (this.foroSeleccionar) {
      // Actualizamos el tema del foro
      this.foroSeleccionar.tema = this.formularioCRUDForo.get('tema')?.value;

      // Llamamos al servicio para modificar
      this.servizo.modificarForo(this.foroSeleccionar.id, this.foroSeleccionar, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.servizo.token}`,
          'Accept': 'application/json',
        })
      }).subscribe({
        next: () => {
          this.formularioCRUDForo.reset(); // Limpiamos el formulario
        },
        error: (erro) => console.error("Error en el modificar del foro", erro)
      });
    }
  }

  // Método para cancelar la edición y limpiar el formulario
  cancelar(formulario: FormGroup) {
    this.cambiar = false;     // Sale del modo edición
    formulario.reset();       // Limpia el formulario
  }

  mostrarForos() {

    this.servizo.mostrarForos({
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.foros = response;
      },
      error: (err) => {
        console.error('❌ Error al mostrar los foros', err);
        //Mensaje de error

      }
    })
  }

  // Método para eliminar un foro por su ID
  eliminarForo(id: number) {
    this.servizo.eliminarForo(id).subscribe({
      next: () => {
        // Filtra y elimina el foro del array local
        this.foros = this.foros.filter(foro => foro.id !== id);
      },
      error: (erro) => console.error(erro)
    });
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    // Se suscribe al observable que notifica cambios en la lista de foros
    if (this.servizo.token) {

      this.mostrarForos();
    }
  }

}
