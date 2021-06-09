import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'

export class HttpClient {
  private readonly instance: AxiosInstance
  private readonly cancelToken: CancelTokenSource

  constructor(config?: AxiosRequestConfig) {
    this.cancelToken = axios.CancelToken.source()
    this.instance = axios.create({ cancelToken: this.cancelToken.token, ...config })
  }

  public cancel(msg?: string): void {
    this.cancelToken.cancel(msg)
  }

  delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.delete(url, config)
  }

  get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.get(url, config)
  }

  head(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.head(url, config)
  }

  options(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.options(url, config)
  }

  patch(url: string, data?: never, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.patch(url, data, config)
  }

  post(url: string, data?: never, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.post(url, data, config)
  }

  put(url: string, data?: never, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.put(url, data, config)
  }

  request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(config)
  }
}
