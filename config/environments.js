// URL base del servicio bajo prueba.
// Para usar otro entorno: k6 run tests/load.test.js -e ENV=staging

const environments = {
  production: 'https://fakestoreapi.com',
  staging:    'https://fakestoreapi.com', // mismo host (no hay staging en la API pública)
};

const env = __ENV.ENV || 'production';

if (!environments[env]) {
  throw new Error('Entorno desconocido: ' + env + '. Opciones: ' + Object.keys(environments).join(', '));
}

export const BASE_URL = environments[env];
