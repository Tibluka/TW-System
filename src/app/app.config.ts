import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { JwtInterceptor } from './shared/services/interceptors/jwt.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaskDirectiveModule } from 'mask-directive';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // ✨ CONFIGURAÇÃO PARA MANTER INTERCEPTORS DE CLASSE (formato legado)
    provideHttpClient(
      withInterceptorsFromDi() // Esta linha permite usar HTTP_INTERCEPTORS
    ),

    provideAnimationsAsync(),
    provideAnimations(),
    importProvidersFrom(
      FormsModule,
      MaskDirectiveModule
    ),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
};