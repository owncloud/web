import {
  Before,
  setDefaultTimeout,
  setWorldConstructor,
  ITestCaseHookParameter
} from '@cucumber/cucumber'

import { World } from '../world'

setDefaultTimeout(process.env.PWDEBUG ? -1 : 60 * 1000)

Before(function(this: World, { pickle }: ITestCaseHookParameter) {
  this.feature = pickle
})

setWorldConstructor(World)
