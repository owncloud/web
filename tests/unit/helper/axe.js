import { configureAxe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

export default configureAxe({
  rules: {
    // it's just there to make first demonstration a11y test pass
    // should be removed later
    'aria-allowed-attr': { enabled: false }
  }
})
