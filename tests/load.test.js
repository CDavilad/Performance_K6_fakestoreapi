/**
 * Load Test — Prueba de carga principal
 *
 * Objetivo: alcanzar y sostener 25 TPS (≥ 20 requerido) durante 1 minuto
 * con un período de ramp-up de 15 s y ramp-down de 15 s.
 *
 * Executor: constant-arrival-rate garantiza exactamente N iteraciones/s
 * independientemente de la latencia de la respuesta.
 *
 * Umbrales de aceptación:
 *   - p(95) de duración HTTP < 1 500 ms
 *   - Tasa de errores < 3 %
 *   - Errores 5xx = 0
 *
 * Ejecución: k6 run tests/load.test.js
 */
import { summaryTrendStats } from '../config/options.js';
import { exec } from '../scenarios/login.js';

export { exec as login };

export const options = {
  scenarios: {
    login: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 80,
      stages: [
        { target: 25, duration: '15s' }, // ramp-up hasta 25 TPS
        { target: 25, duration: '60s' }, // carga sostenida ≥ 20 TPS
        { target: 0,  duration: '15s' }, // ramp-down
      ],
      exec: 'login',
    },
  },
  thresholds: {
    'http_req_duration{scenario:login}': ['p(95)<1500'],
    errors:            ['rate<0.03'],
    server_errors_5xx: ['count==0'],
  },
  summaryTrendStats,
};
