import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServizoLoginService } from './servizo-login.service';
import { catchError, map, of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export const adminGuard: CanActivateFn = (route, state) => {
  let servicio = inject(ServizoLoginService)
  let router = inject(Router);

  return servicio.middlewareAdmin({
    headers: new HttpHeaders({
      'Authorization': `Bearer ${servicio.token}`,
      'Accept': 'application/json',
    }),
  }).pipe(
    map(() => true),
    catchError(erro => {
      return of(router.createUrlTree(['/prohibido']));
    })
  );

};
