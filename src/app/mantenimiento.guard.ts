import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ServizoLoginService } from './servizo-login.service';
import { map } from 'rxjs';

export const mantenimientoGuard: CanActivateFn = (route, state) => {
  let servicio = inject(ServizoLoginService)
  let router = inject(Router);

  return servicio.mostrarEstado().pipe(
    map(res => res.maintenance
      ? router.createUrlTree(['/mantenimiento'])
      : true
    )
  );

};
