smoke:
	k6 run tests/smoke.test.js

load:
	k6 run tests/load.test.js

stress:
	k6 run tests/stress.test.js

smoke-report:
	k6 run tests/smoke.test.js --summary-export=reports/smoke-summary.json

load-report:
	k6 run tests/load.test.js --summary-export=reports/load-summary.json

stress-report:
	k6 run tests/stress.test.js --summary-export=reports/stress-summary.json

ci: smoke load

.PHONY: smoke load stress smoke-report load-report stress-report ci
