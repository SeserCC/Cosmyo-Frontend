import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  let router = inject(Router); // Inxectamos o Router (singleton) para poder redirixir o tráfico
  // Recuperamos o valor do usuario actual dende localStorage
  let platformId = inject(PLATFORM_ID);
  // Comprobamos se había usuario gardado en localStorage

  if (isPlatformBrowser(platformId)) {
    let usuario = localStorage.getItem("token");
    if (usuario) {
      return true;
    }
  }

  router.navigate(['/portada']); // Si no hay sesión, redirige
  return false;

};
