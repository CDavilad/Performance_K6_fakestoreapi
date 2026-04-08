PRUEBA DE CARGA — POST /auth/login (https://fakestoreapi.com)
=============================================================
Herramienta : k6
Versión k6  : >= 0.54.0
Sistema op. : Windows 10/11, macOS, Linux
Fecha       : Abril 2026


DESCRIPCIÓN
-----------
Prueba de carga del endpoint de autenticación de fakestoreapi.com mediante k6.
Las credenciales se parametrizan desde un archivo CSV. Se ejecutan tres tipos
de prueba: humo (smoke), carga (load) y estrés (stress).


ESTRUCTURA DEL PROYECTO
-----------------------
Performance_K6_fakestoreapi/
├── config/
│   ├── environments.js     URL base por entorno
│   └── options.js          Estadísticas de resumen
├── data/
│   └── users.csv           Credenciales parametrizadas (5 usuarios)
├── helpers/
│   └── checks.js           Validaciones y métricas de error
├── scenarios/
│   └── login.js            Lógica del escenario POST /auth/login
├── tests/
│   ├── smoke.test.js       Prueba de humo  (1 VU, 5 iteraciones)
│   ├── load.test.js        Prueba de carga (25 TPS objetivo, 1m30s)
│   └── stress.test.js      Prueba de estrés (hasta 100 TPS, 4m)
├── reports/                Reportes JSON generados tras la ejecución
├── Makefile
├── package.json
├── readme.txt              Este archivo
└── conclusiones.txt        Hallazgos y conclusiones


TECNOLOGÍAS Y VERSIONES
-----------------------
  k6         >= 0.54.0    https://k6.io/
  Node.js    >= 18.x      https://nodejs.org/  (solo para npm run)
  make       cualquier    https://www.gnu.org/software/make/ (opcional)


INSTALACIÓN DE K6
-----------------
Windows (requiere winget):
  winget install k6 --source winget

  Alternativa — descarga el instalador MSI:
  https://dl.k6.io/msi/k6-latest-amd64.msi

macOS:
  brew install k6

Linux (Debian / Ubuntu):
  sudo gpg --no-default-keyring \
    --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
    --keyserver hkp://keyserver.ubuntu.com:80 \
    --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] \
    https://dl.k6.io/deb stable main" \
    | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update && sudo apt-get install k6

Verificar instalación:
  k6 version


EJECUCIÓN PASO A PASO
---------------------
Todos los comandos deben executarse desde la raíz del proyecto
(carpeta Performance_K6_fakestoreapi/).

PASO 1 — Prueba de humo (verificación básica)
  k6 run tests/smoke.test.js

  Qué valida:
    - Los 5 usuarios del CSV autentican correctamente.
    - p(95) < 1 500 ms.
    - Error rate = 0 %.
  Duración esperada: ~2 segundos.

PASO 2 — Prueba de carga (requisito mínimo: 20 TPS)
  k6 run tests/load.test.js

  Qué valida:
    - Throughput sostenido >= 20 TPS durante 60 s.
    - p(95) < 1 500 ms.
    - Error rate < 3 %.
    - Sin errores 5xx.
  Duración esperada: ~1 minuto 30 segundos.

PASO 3 — Prueba de estrés (punto de quiebre)
  k6 run tests/stress.test.js

  Qué valida:
    - Comportamiento del servicio hasta 100 TPS.
    - p(95) < 3 000 ms.
    - Error rate < 15 %.
  Duración esperada: ~4 minutos.

PASO 4 — Generar reportes JSON (opcional)
  k6 run tests/smoke.test.js  --out json=reports/smoke.json
  k6 run tests/load.test.js   --out json=reports/load.json
  k6 run tests/stress.test.js --out json=reports/stress.json

Con Makefile:
  make smoke
  make load
  make stress


CRITERIOS DE ACEPTACIÓN
-----------------------
  Umbral                        Smoke    Load     Stress
  ─────────────────────────────────────────────────────
  TPS mínimo                    —        >= 20    —
  p(95) duración HTTP           < 1500ms < 1500ms < 3000ms
  Tasa de errores               < 3%     < 3%     < 15%
  Errores 5xx                   = 0      = 0      < 10


NOTA SOBRE CREDENCIALES
-----------------------
El enunciado del ejercicio incluye el par "user/passwd" como ejemplo en el CURL.
Esta credencial no existe en la base de datos de fakestoreapi y devuelve HTTP 401.
Los usuarios válidos de la API son los 5 restantes del CSV:
  donero / ewedon
  kevinryan / kev02937@
  johnd / m38rmF$
  derek / jklg*_56
  mor_2314 / 83r5^_
