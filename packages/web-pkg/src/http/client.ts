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

  public delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.delete(url, this.obtainConfig<D>(config))
  }

  public get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.get(url, this.obtainConfig<D>(config))
  }

  public head<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.head(url, this.obtainConfig<D>(config))
  }

  public options<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.options(url, this.obtainConfig<D>(config))
  }

  public patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.patch(url, data, this.obtainConfig<D>(config))
  }

  public post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.post(url, data, this.obtainConfig<D>(config))
  }

  public put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.put(url, data, this.obtainConfig<D>(config))
  }

  public request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.request(this.obtainConfig<D>(config))
  }

  private obtainConfig<D = any>(config?: AxiosRequestConfig): AxiosRequestConfig<D> {
    return merge({ cancelToken: this.cancelToken.token }, config)
  }
}
