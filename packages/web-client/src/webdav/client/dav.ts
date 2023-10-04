import { Ref, unref } from 'vue'
import {
  Headers,
  ProgressEventCallback,
  RequestOptionsCustom,
  WebDAVClient,
  createClient
} from 'webdav'
import { v4 as uuidV4 } from 'uuid'
import { encodePath, urlJoin } from '../../utils'
import { DavMethod, DavPropertyValue } from '../constants'
import { buildPropFindBody } from './builders'
import { parseError, parseMultiStatus, parseTusHeaders } from './parsers'
import { WebDavResponseResource } from '../../helpers'
import { HttpError } from '../../errors'

interface DAVOptions {
  accessToken: Ref<string>
  baseUrl: string
  language: Ref<string>
}

interface DavResult {
  body: WebDavResponseResource[] | undefined
  status: number
  result: Response
}

export class DAV {
  private accessToken: Ref<string>
  private client: WebDAVClient
  private davPath: string
  private language: Ref<string>

  constructor({ accessToken, baseUrl, language }: DAVOptions) {
    this.davPath = urlJoin(baseUrl, 'remote.php/dav')
    this.accessToken = accessToken
    this.client = createClient(this.davPath, {})
    this.language = language
  }

  public mkcol(path: string, { headers = {} }: { headers?: Headers } = {}) {
    return this.request(DavMethod.mkcol, path, { headers })
  }

  public async propfind(
    path: string,
    {
      depth = 1,
      properties = [],
      headers = {}
    }: { depth?: number; properties?: DavPropertyValue[]; headers?: Headers } = {}
  ) {
    const requestHeaders = { ...headers, Depth: depth.toString() }
    const { body, result } = await this.request(DavMethod.propfind, path, {
      body: buildPropFindBody(properties),
      headers: requestHeaders
    })

    if (body?.length) {
      // add tus info to current folder only
      body[0].tusSupport = parseTusHeaders(result.headers)
    }

    return body
  }

  public async search(
    pattern: string,
    path: string,
    {
      limit = 30,
      properties
    }: {
      limit?: number
      properties?: DavPropertyValue[]
    } = {}
  ) {
    const { body, result } = await this.request(DavMethod.report, path, {
      body: buildPropFindBody(properties, { pattern, limit })
    })

    return {
      results: body,
      range: result.headers.get('content-range')
    }
  }

  public copy(
    source: string,
    target: string,
    { overwrite = false, headers = {} }: { overwrite?: boolean; headers?: Headers } = {}
  ) {
    const targetUrl = urlJoin(this.davPath, encodePath(target))
    return this.request(DavMethod.copy, source, {
      headers: { ...headers, Destination: targetUrl, overwrite: overwrite ? 'T' : 'F' }
    })
  }

  public move(
    source: string,
    target: string,
    { overwrite = false, headers = {} }: { overwrite?: boolean; headers?: Headers } = {}
  ) {
    const targetUrl = urlJoin(this.davPath, encodePath(target))
    return this.request(DavMethod.move, source, {
      headers: { ...headers, Destination: targetUrl, overwrite: overwrite ? 'T' : 'F' }
    })
  }

  public put(
    path: string,
    content: string,
    {
      headers = {},
      onUploadProgress,
      previousEntityTag,
      overwrite
    }: {
      headers?: Headers
      onUploadProgress?: ProgressEventCallback
      previousEntityTag?: string
      overwrite?: boolean
    } = {}
  ) {
    const requestHeaders = { ...headers }
    if (previousEntityTag) {
      // will ensure that no other client uploaded a different version meanwhile
      requestHeaders['If-Match'] = previousEntityTag
    } else if (!overwrite) {
      // will trigger 412 precondition failed if a file already exists
      requestHeaders['If-None-Match'] = '*'
    }

    return this.request(DavMethod.put, path, {
      body: content,
      headers: requestHeaders,
      options: { onUploadProgress }
    })
  }

  public delete(path: string, { headers = {} }: { headers?: Headers } = {}) {
    return this.request(DavMethod.delete, path, { headers })
  }

  public getFileUrl(path: string) {
    return urlJoin(this.davPath, encodePath(path))
  }

  private buildHeaders(headers: Headers = {}): Headers {
    return {
      'Accept-Language': unref(this.language),
      Authorization: 'Bearer ' + unref(this.accessToken),
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Request-ID': uuidV4(),
      ...headers
    }
  }

  private async request(
    method: DavMethod,
    path: string,
    {
      body,
      headers,
      options
    }: {
      body?: string
      headers?: Headers
      options?: Partial<RequestOptionsCustom>
    } = {}
  ): Promise<DavResult> {
    const url = urlJoin(this.davPath, encodePath(path), { leadingSlash: true })

    const requestOptions = {
      url,
      method,
      headers: this.buildHeaders(headers),
      data: body,
      ...options
    } as RequestOptionsCustom

    try {
      const result = (await this.client.customRequest('', requestOptions)) as unknown as Response

      let resultBody: WebDavResponseResource[]
      if (result.status === 207) {
        const parsedBody = await result.text()
        resultBody = await parseMultiStatus(parsedBody)
      }

      return {
        body: resultBody,
        status: result.status,
        result
      }
    } catch (error) {
      const { response } = error
      const body = await response.text()
      const errorMessage = parseError(body)
      throw new HttpError(errorMessage, response, response.status)
    }
  }
}
