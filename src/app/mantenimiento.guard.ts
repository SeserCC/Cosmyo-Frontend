import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ServizoLoginService } from './servizo-login.service';

export const mantenimientoGuard: CanActivateFn = (route, state) => {
  let servicio = inject(ServizoLoginService)
  let router = inject(Router);

  servicio.mostrarEstado().subscribe({
    next: (response) => {
      if (response.maintenance) {
        router.navigate(['/mantenimiento']);
      }

    }
  })

  return true;
};
