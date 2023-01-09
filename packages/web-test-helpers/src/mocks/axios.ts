import { AxiosPromise, AxiosResponse } from 'axios'
import { mock } from 'jest-mock-extended'

export const mockAxiosResolve = <T>(data: T = {} as any): AxiosPromise<T> => {
  const response = mock<AxiosResponse>({ data })
  return Promise.resolve(response)
}

export const mockAxiosReject = <T>(message = ''): AxiosPromise<T> => {
  return Promise.reject(new Error(message))
}
