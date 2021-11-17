import {
  Before,
  BeforeAll,
  setDefaultTimeout,
  setWorldConstructor,
  ITestCaseHookParameter
} from '@cucumber/cucumber'
import { userStore } from '../store'
import { api } from '../api'
import { config } from '../config'
import { World } from '../world'

setDefaultTimeout(process.env.PWDEBUG ? -1 : 60 * 1000)

BeforeAll(async function () {
  if (config.ocis) {
    return
  }

  await api.config.setLocking({ value: false, user: userStore.get('admin') })
})

Before(function (this: World, { pickle }: ITestCaseHookParameter) {
  this.feature = pickle
})

setWorldConstructor(World)
