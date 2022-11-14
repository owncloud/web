import { mockDeep } from 'jest-mock-extended'
import { AxiosPromise, AxiosResponse } from 'axios'

export const mockAxiosResolve = <T>(data: T = {} as any): AxiosPromise<T> => {
  const response = mockDeep<AxiosResponse>({ data })
  return Promise.resolve(response)
}

export const mockAxiosReject = <T>(message = ''): AxiosPromise<T> => {
  return Promise.reject(new Error(message))
}
