import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServizoLoginService } from '../../servizo-login.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css'
})
export class AuthCallbackComponent implements OnInit {
  usuarioActual: any;

  constructor(public servizo: ServizoLoginService,
    private route: ActivatedRoute,
    private router: Router
  ) { }


  ngOnInit(): void {

    let token = this.route.snapshot.queryParamMap.get('token');

    if (!token) return;

    this.servizo.guardarToken(token);

    this.servizo.cargarSesion().subscribe({
      next: () => {
        //console.log(this.servizo.usuarioActual$.value);
        setTimeout(() => {

          this.router.navigate(['/']);

        }, 0);
      }
    })

  }
}
