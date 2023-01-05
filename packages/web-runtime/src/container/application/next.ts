import Vue from 'vue'
import { RuntimeApi } from '../types'

type VueConstructor = typeof Vue
export abstract class NextApplication {
  protected readonly runtimeApi: RuntimeApi

  protected constructor(runtimeApi: RuntimeApi) {
    this.runtimeApi = runtimeApi
  }

  abstract initialize(): Promise<void>

  abstract ready(): Promise<void>

  abstract mounted(instance: VueConstructor): Promise<void>
}
