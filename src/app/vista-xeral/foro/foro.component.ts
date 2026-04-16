import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-foro',
  standalone: true,
  animations: [
    trigger('slideForm', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(20px)',
        height: '0px',
        overflow: 'hidden'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)',
        height: '*'
      })),
      transition('hidden <=> visible', animate('400ms ease')),
      transition('visible <=> hidden', animate('400ms ease'))
    ])
  ],
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css'
})
export class ForoComponent implements OnInit {
  // Array donde se almacenan todos los foros
  foros: any[];

  usuarioActual: any;

  // Formulario reactivo para añadir o editar un foro
  formularioCRUDForo: FormGroup;

  // Bandera que indica si se debe mostrar el formulario o si estamos en modo edición
  cambiar: boolean = false;

  animacion: boolean = false;

  // Foro actualmente seleccionado para editar
  foroSeleccionar: any;

  menuAbierto: number | null = null;

  mensajeError: any;

  // Constructor del componente, se inyecta el servicio y se inicializa el formulario
  constructor(private servizo: ServizoLoginService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.formularioCRUDForo = new FormGroup({
      tema: new FormControl('', [Validators.required, Validators.minLength(4)]) // Campo obligatorio para el tema del foro
    });
  }

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  // Método para mostrar el formulario de creación/edición
  mostrarFormulario() {
    this.animacion = true;
    this.cambiar = false;
    this.formularioCRUDForo.reset();
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
        this.animacion = false;
      },
      error: (erro) => {
        //console.error('No se pudo crear el foro', erro);
        if (erro.status == 422) {
          this.mensajeError = erro.error;
        }

      }
    });
  }

  // Método para editar un foro
  editarForo(foro: any) {
    this.animacion = true; 
    this.cambiar = true;
    this.foroSeleccionar = foro; // Guardamos el foro seleccionado
    // Rellenamos el formulario con los datos del foro
    this.formularioCRUDForo.patchValue({
      tema: foro.tema,
    });
  }

  // Método para guardar la modificación de un foro
  modificarForo() {
  
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
          this.cambiar = false;
          this.animacion = false;
        },
        error: (erro) => {
          //console.error("Error en el modificar del foro", erro)

        }
      });
    }
  }

  cancelar(formulario: FormGroup) {
    this.animacion = false;
    this.mensajeError = '';
    formulario.reset();
  }

  mostrarForos() {

    this.servizo.mostrarForos({
      headers: new HttpHeaders({
        /* 'Authorization': `Bearer ${this.servizo.token}`, */
        'Accept': 'application/json',
      }),
    }).subscribe({
      next: (response) => {
        this.foros = response;
      },
      error: (err) => {
        //console.error('❌ Error al mostrar los foros', err);

      }
    })
  }

  // Método para eliminar un foro por su ID
  eliminarForo(id: number) {
    this.servizo.eliminarForo(id, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.servizo.token}`,
        'Accept': 'application/json',
      })
    }).subscribe({
      next: () => {
        // Filtra y elimina el foro del array local
        this.foros = this.foros.filter(foro => foro.id !== id);
      },
      error: (erro) => {
        //console.error('Error al eliminar el foro', erro)

      }
    });
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    // Se suscribe al observable que notifica cambios en la lista de foros
    if (isPlatformBrowser(this.platformId)) {
      this.servizo.usuarioActual$.subscribe((usuario) => {
        this.usuarioActual = usuario;
      });
    }
    this.mostrarForos();



  }

}
