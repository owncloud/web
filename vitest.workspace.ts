import { defineWorkspace } from 'vitest/config'
import { globSync } from 'glob'

// set timezone for snapshot reproducibility on different machines
process.env.TZ = 'UTC'

const pattern = './packages/*/tests'
const testDirs = [...globSync(pattern), './packages/design-system/src']

export default defineWorkspace(
  testDirs.map((dir) => {
    const name = dir.split('/')[1]
    return {
      extends: './tests/unit/config/vitest.config.ts',
      test: {
        name,
        dir
      }
    }
  })
)
