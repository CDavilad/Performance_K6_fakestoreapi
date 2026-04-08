# Performance K6 — Fakestoreapi Login

Prueba de carga del endpoint `POST /auth/login` de **https://fakestoreapi.com**  
usando [k6](https://k6.io/) con credenciales parametrizadas desde un archivo CSV.

---

## Tecnologías

| Herramienta | Versión recomendada |
|-------------|---------------------|
| k6          | ≥ 0.54.0            |
| Node.js     | ≥ 18 (solo para `npm run`) |
| make        | Cualquier versión (opcional) |

---

## Estructura del proyecto

```
Performance_K6_fakestoreapi/
├── config/
│   ├── environments.js   # URL base por entorno
│   └── options.js        # Estadísticas de resumen
├── data/
│   └── users.csv         # Credenciales parametrizadas
├── helpers/
│   └── checks.js         # Validaciones y métricas de error
├── scenarios/
│   └── login.js          # Lógica del escenario de login
├── tests/
│   ├── smoke.test.js     # Prueba de humo (1 VU, 6 iteraciones)
│   ├── load.test.js      # Prueba de carga (25 TPS sostenidos, 60 s)
│   └── stress.test.js    # Prueba de estrés (escalado hasta 100 TPS)
├── Makefile
├── package.json
├── README.md
└── conclusiones.txt
```

---

## Instalación de k6

### Windows
```powershell
winget install k6 --source winget
```
O descarga el instalador desde https://dl.k6.io/msi/k6-latest-amd64.msi

### macOS
```bash
brew install k6
```

### Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

Verificar la instalación:
```bash
k6 version
```

---

## Ejecución paso a paso

> Todos los comandos deben ejecutarse desde la raíz del proyecto  
> (`Performance_K6_fakestoreapi/`).

### 1. Prueba de humo (smoke)
Verifica que el endpoint esté disponible antes de lanzar la carga.

```bash
k6 run tests/smoke.test.js
```

Resultado esperado: 6 iteraciones exitosas, sin errores, en menos de 1 500 ms p(95).

---

### 2. Prueba de carga (load)
Escala hasta **25 TPS** y los sostiene durante **60 segundos** (≥ 20 TPS requerido).

```bash
k6 run tests/load.test.js
```

Criterios de aceptación:
- `p(95) < 1 500 ms`
- `error rate < 3 %`
- `errores 5xx = 0`

---

### 3. Prueba de estrés (stress)
Escala progresivamente de 0 a 100 TPS para encontrar el punto de quiebre.

```bash
k6 run tests/stress.test.js
```

---

### Exportar resultados a JSON
```bash
k6 run tests/load.test.js --out json=results/load.json
k6 run tests/stress.test.js --out json=results/stress.json
```

### Con Makefile
```bash
make smoke
make load
make stress
```

---

## Descripción de la prueba

El endpoint bajo prueba es:

```
POST https://fakestoreapi.com/auth/login
Content-Type: application/json

{
  "username": "<usuario>",
  "password": "<contraseña>"
}
```

Los usuarios se leen de `data/users.csv` y se distribuyen de forma rotativa  
entre los VUs concurrentes usando `SharedArray` de k6.

### Usuarios parametrizados (`data/users.csv`)

| username   | password    |
|------------|-------------|
| user       | passwd      |
| donero     | ewedon      |
| kevinryan  | kev02937@   |
| johnd      | m38rmF$     |
| derek      | jklg*_56    |
| mor_2314   | 83r5^\_     |

---

## Umbrales por tipo de prueba

| Prueba  | p(95) máx | Error rate máx | Errores 5xx |
|---------|-----------|----------------|-------------|
| smoke   | 1 500 ms  | 3 %            | 0           |
| load    | 1 500 ms  | 3 %            | 0           |
| stress  | 3 000 ms  | 15 %           | < 10        |
