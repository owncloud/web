import Vue from 'vue'
import { RuntimeApi } from '../types'

export abstract class NextApplication {
  protected readonly runtimeApi: RuntimeApi

  protected constructor(runtimeApi: RuntimeApi) {
    this.runtimeApi = runtimeApi
  }

  abstract initialize(): Promise<void>

  abstract ready(): Promise<void>

  abstract mounted(instance: Vue): Promise<void>

  abstract userReady(instance: Vue): Promise<void>
}
