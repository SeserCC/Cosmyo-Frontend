import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServizoLoginService } from './servizo-login.service';
import { catchError, filter, map, of, skipWhile, take, tap, timeout } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export const adminGuard: CanActivateFn = (route, state) => {
  let servicio = inject(ServizoLoginService)
  let router = inject(Router);

  return servicio.usuarioActual?.rol == 'admim' ? true : router.createUrlTree(['/prohibido'])

};
