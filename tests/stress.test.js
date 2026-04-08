/**
 * Stress Test — Prueba de estrés
 *
 * Incrementa progresivamente la tasa de peticiones para identificar
 * el punto de quiebre del servicio (degradación de latencia o errores).
 *
 * Stages:
 *   0 → 20 TPS en 30 s  (zona nominal)
 *   20 → 40 TPS en 1 m  (zona de estrés leve)
 *   40 → 70 TPS en 1 m  (zona de estrés alto)
 *   70 → 100 TPS en 1 m (zona de rotura)
 *   100 → 0 en 30 s     (ramp-down)
 *
 * Umbrales más permisivos que load para observar degradación gradual:
 *   - p(95) < 3 000 ms
 *   - Tasa de errores < 15 %
 *
 * Ejecución: k6 run tests/stress.test.js
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
      preAllocatedVUs: 120,
      maxVUs: 200,
      stages: [
        { target: 20,  duration: '30s' },
        { target: 40,  duration: '1m'  },
        { target: 70,  duration: '1m'  },
        { target: 100, duration: '1m'  },
        { target: 0,   duration: '30s' },
      ],
      exec: 'login',
    },
  },
  thresholds: {
    'http_req_duration{scenario:login}': ['p(95)<3000'],
    errors:            ['rate<0.15'],
    server_errors_5xx: ['count<10'],
  },
  summaryTrendStats,
};
