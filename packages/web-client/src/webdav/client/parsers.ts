import { parseXML, prepareFileFromProps } from 'webdav'
import { XMLParser } from 'fast-xml-parser'
import { WebDavResponseResource, WebDavResponseTusSupport } from '../../helpers'
import { urlJoin } from '../../utils'

export const parseTusHeaders = (headers: Headers) => {
  const result: WebDavResponseTusSupport = {}

  const version = headers.get('tus-version')
  if (!version) {
    return null
  }

  result.version = version.split(',')
  if (headers.get('tus-extension')) {
    result.extension = headers.get('tus-extension').split(',')
  }
  if (headers.get('tus-resumable')) {
    result.resumable = headers.get('tus-resumable')
  }
  if (headers.get('tus-max-size')) {
    result.maxSize = parseInt(headers.get('tus-max-size'), 10)
  }
  return result
}

export const parseMultiStatus = async (xmlBody: string) => {
  const parseFileName = (name: string) => {
    const decoded = decodeURIComponent(name)
    if (name?.startsWith('/remote.php/dav/')) {
      // strip out '/remote.php/dav/' from the beginning
      return urlJoin(decoded.replace('/remote.php/dav/', ''), {
        leadingSlash: true,
        trailingSlash: false
      })
    }

    return decoded
  }

  const parsedXML = await parseXML(xmlBody)

  return parsedXML.multistatus.response.map(({ href, propstat }) => {
    const data = {
      ...prepareFileFromProps(propstat.prop, parseFileName(href), true),
      processing: propstat.status === 'HTTP/1.1 425 TOO EARLY'
    }

    if (data.props.name) {
      data.props.name = data.props.name.toString()
    }

    return data
  }) as unknown as WebDavResponseResource[]
}

export const parseError = (xmlBody: string) => {
  const parser = new XMLParser()
  try {
    const parsed = parser.parse(xmlBody)

    if (parsed['d:error'] && parsed['d:error']['s:message']) {
      const message = parsed['d:error']['s:message']
      if (typeof message === 'string') {
        return message
      }
      return ''
    }
  } catch (error) {
    return 'Unknown error'
  }

  return 'Unknown error'
}
