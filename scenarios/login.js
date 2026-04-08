/**
 * Escenario: Login — POST /auth/login
 *
 * Autenticación en https://fakestoreapi.com/auth/login con credenciales
 * parametrizadas desde data/users.csv.
 *
 * Criterios de aceptación:
 *   - Mínimo 20 TPS
 *   - p(95) < 1 500 ms
 *   - Tasa de errores < 3 %
 */
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { Counter } from 'k6/metrics';
import { BASE_URL } from '../config/environments.js';
import { checkAndTrack, invalidCredentials } from '../helpers/checks.js';

export const requests = new Counter('login_requests');

// Los usuarios se cargan una sola vez en el init stage y se comparten
// entre todos los VUs mediante SharedArray (eficiente en memoria).
export const users = new SharedArray('users', function () {
  const raw = open('../data/users.csv');
  const lines = raw.split('\n').filter((line) => line.trim() !== '');
  // Saltar encabezado username,password
  return lines.slice(1).map((line) => {
    const parts = line.split(',');
    return { username: parts[0].trim(), password: parts[1].trim() };
  });
});

/**
 * Función principal del escenario.
 * Cada VU selecciona un usuario del CSV de forma rotativa.
 */
export function exec() {
  // __ITER increments per iteration (0,1,2,...) — correct for rotating users
  // across iterations even when only 1 VU is active (smoke test).
  const user = users[__ITER % users.length];

  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: user.username, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  // HTTP 401 = credencial inválida conocida (ej. user/passwd del enunciado).
  // Se contabiliza por separado y NO suma al error rate de la prueba.
  if (res.status === 401) {
    invalidCredentials.add(1);
    requests.add(1);
    return;
  }

  checkAndTrack(res, {
    name: 'Login',
    expectedStatus: 200,
    maxLatency: 1500,
  });

  requests.add(1);
}
