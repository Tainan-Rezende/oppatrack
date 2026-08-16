import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.tmdb.baseUrl)) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${environment.tmdb.apiToken}`
      },
      setParams: {
        language: 'pt-BR'
      }
    });
    return next(authReq);
  }

  return next(req);
};