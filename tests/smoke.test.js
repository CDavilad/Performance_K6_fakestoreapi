/**
 * Smoke Test — Verificación básica de disponibilidad
 *
 * 1 VU, 6 iteraciones (una por usuario del CSV).
 * Valida que el endpoint responde correctamente antes de ejecutar
 * pruebas de carga.
 *
 * Ejecución: k6 run tests/smoke.test.js
 */
import { summaryTrendStats } from '../config/options.js';
import { exec } from '../scenarios/login.js';

export { exec as login };

export const options = {
  scenarios: {
    login: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 6,
      exec: 'login',
    },
  },
  thresholds: {
    'http_req_duration{scenario:login}': ['p(95)<1500'],
    errors:          ['rate<0.03'],
    server_errors_5xx: ['count==0'],
  },
  summaryTrendStats,
};
