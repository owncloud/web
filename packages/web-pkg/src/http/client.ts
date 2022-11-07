import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'
import merge from 'lodash-es/merge'

export class HttpClient {
  private readonly instance: AxiosInstance
  private readonly cancelToken: CancelTokenSource

  constructor(config?: AxiosRequestConfig) {
    this.cancelToken = axios.CancelToken.source()
    this.instance = axios.create(config)
  }

  public cancel(msg?: string): void {
    this.cancelToken.cancel(msg)
  }

  public delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.delete(url, this.obtainConfig(config))
  }

  public get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.get(url, this.obtainConfig(config))
  }

  public head(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.head(url, this.obtainConfig(config))
  }

  public options(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.options(url, this.obtainConfig(config))
  }

  public patch(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.patch(url, data, this.obtainConfig(config))
  }

  public post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.post(url, data, this.obtainConfig(config))
  }

  public put(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.put(url, data, this.obtainConfig(config))
  }

  public request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(this.obtainConfig(config))
  }

  private obtainConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    return merge({ cancelToken: this.cancelToken.token }, config)
  }
}
