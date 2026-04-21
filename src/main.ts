import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER } from '@angular/core';
import { ServizoLoginService } from './app/servizo-login.service';
import { firstValueFrom } from 'rxjs';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (servicio: ServizoLoginService) => () => firstValueFrom(servicio.cargarSesion()),
      deps: [ServizoLoginService],
      multi: true
    },
    ...(appConfig.providers || []),
    provideAnimations()
  ]
})
  .catch((err) => console.error(err));
