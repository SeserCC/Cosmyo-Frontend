import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServizoLoginService } from './servizo-login.service';

export const adminGuard: CanActivateFn = (route, state) => {
  let servicio = inject(ServizoLoginService)
  let router = inject(Router);

  const user = servicio.usuarioActual$.value;

  return user?.rol == 'admin'
    ? true
    : router.createUrlTree(['/prohibido']);

};
