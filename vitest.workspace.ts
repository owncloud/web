import { defineWorkspace } from 'vitest/config'

// set timezone for snapshot reproducibility on different machines
process.env.TZ = 'UTC'

export default defineWorkspace(['./tests/unit/config/vitest.config.ts'])
