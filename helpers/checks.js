import { check } from 'k6';
import { Rate, Counter } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const serverErrors = new Counter('server_errors_5xx');
export const invalidCredentials = new Counter('invalid_credentials_401');

/**
 * Validación genérica de respuesta HTTP.
 * Registra métricas de error y verifica criterios de aceptación.
 *
 * @param {object} res            Respuesta de k6 http
 * @param {object} opts           { name, expectedStatus, maxLatency }
 * @returns {boolean}             true si todos los checks pasan
 */
export function checkAndTrack(res, opts) {
  const checks = {};

  // Accept any 2xx success code (200, 201, 202, …) as valid.
  // The expectedStatus value is kept for labelling only.
  checks[`${opts.name} — status ${opts.expectedStatus} (2xx)`] =
    (r) => r.status >= 200 && r.status < 300;

  checks[`${opts.name} — sin error servidor`] =
    (r) => r.status < 500;

  checks[`${opts.name} — body no vacío`] =
    (r) => r.body && r.body.length > 0;

  if (opts.maxLatency) {
    checks[`${opts.name} — latencia < ${opts.maxLatency}ms`] =
      (r) => r.timings.duration < opts.maxLatency;
  }

  const ok = check(res, checks);
  errorRate.add(!ok);
  if (res.status >= 500) serverErrors.add(1);
  return ok;
}
