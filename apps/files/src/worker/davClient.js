/*
 * vim: expandtab shiftwidth=4 softtabstop=4
 */

const jsdom = require('jsdom')
const { JSDOM } = jsdom

const _XML_CHAR_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&apos;'
}

const _escapeXml = function (s) {
  return s.replace(/[<>&"']/g, function (ch) {
    return _XML_CHAR_MAP[ch]
  })
}

const Client = function (options) {
  var i
  for (i in options) {
    this[i] = options[i]
  }
}

Client.prototype = {

  baseUrl: null,

  userName: null,

  password: null,

  xmlNamespaces: {
    'DAV:': 'd'
  },

  /**
     * Generates a propFind request.
     *
     * @param {string} url Url to do the propfind request on
     * @param {Array} properties List of properties to retrieve.
     * @param {string} depth "0", "1" or "infinity"
     * @param {Object} [headers] headers
     * @return {Promise}
     */
  propFind: function (url, properties, depth, headers, streamResult = false) {
    if (typeof depth === 'undefined') {
      depth = '0'
    }

    // depth header must be a string, in case a number was passed in
    depth = '' + depth

    headers = headers || {}

    headers.Depth = depth
    headers['Content-Type'] = 'application/xml; charset=utf-8'

    var body =
            '<?xml version="1.0"?>\n' +
            '<d:propfind '
    var namespace
    for (namespace in this.xmlNamespaces) {
      body += ' xmlns:' + this.xmlNamespaces[namespace] + '="' + namespace + '"'
    }
    body += '>\n' +
            '  <d:prop>\n'

    for (var ii in properties) {
      if (!Object.prototype.hasOwnProperty.call(properties, ii)) {
        continue
      }

      var property = this.parseClarkNotation(properties[ii])
      if (this.xmlNamespaces[property.namespace]) {
        body += '    <' + this.xmlNamespaces[property.namespace] + ':' + property.name + ' />\n'
      } else {
        body += '    <x:' + property.name + ' xmlns:x="' + property.namespace + '" />\n'
      }
    }
    body += '  </d:prop>\n'
    body += '</d:propfind>'

    return fetch(url, {
      method: 'PROPFIND',
      body: body,
      headers: headers
    })
  },

  /**
     * Renders a "d:set" block for the given properties.
     *
     * @param {Object.<String,String>} properties
     * @return {String} XML "<d:set>" block
     */
  _renderPropSet: function (properties) {
    var body = '  <d:set>\n' +
            '   <d:prop>\n'

    for (var ii in properties) {
      if (!Object.prototype.hasOwnProperty.call(properties, ii)) {
        continue
      }

      var property = this.parseClarkNotation(ii)
      var propName
      var propValue = properties[ii]
      if (this.xmlNamespaces[property.namespace]) {
        propName = this.xmlNamespaces[property.namespace] + ':' + property.name
      } else {
        propName = 'x:' + property.name + ' xmlns:x="' + property.namespace + '"'
      }

      // FIXME: hard-coded for now until we allow properties to
      // specify whether to be escaped or not
      if (propName !== 'd:resourcetype') {
        propValue = _escapeXml(propValue)
      }
      body += '      <' + propName + '>' + propValue + '</' + propName + '>\n'
    }
    body += '    </d:prop>\n'
    body += '  </d:set>\n'
    return body
  },

  /**
     * Generates a propPatch request.
     *
     * @param {string} url Url to do the proppatch request on
     * @param {Object.<String,String>} properties List of properties to store.
     * @param {Object} [headers] headers
     * @return {Promise}
     */
  propPatch: function (url, properties, headers) {
    headers = headers || {}

    headers['Content-Type'] = 'application/xml; charset=utf-8'

    var body =
            '<?xml version="1.0"?>\n' +
            '<d:propertyupdate '
    var namespace
    for (namespace in this.xmlNamespaces) {
      body += ' xmlns:' + this.xmlNamespaces[namespace] + '="' + namespace + '"'
    }
    body += '>\n' + this._renderPropSet(properties)
    body += '</d:propertyupdate>'

    return this.request('PROPPATCH', url, headers, body).then(
      function (result) {
        return {
          status: result.status,
          body: result.body,
          xhr: result.xhr
        }
      }
    )
  },

  /**
     * Generates a MKCOL request.
     * If attributes are given, it will use an extended MKCOL request.
     *
     * @param {string} url Url to do the proppatch request on
     * @param {Object.<String,String>} [properties] list of properties to store.
     * @param {Object} [headers] headers
     * @return {Promise}
     */
  mkcol: function (url, properties, headers) {
    var body = ''
    headers = headers || {}
    headers['Content-Type'] = 'application/xml; charset=utf-8'

    if (properties) {
      body =
                '<?xml version="1.0"?>\n' +
                '<d:mkcol'
      var namespace
      for (namespace in this.xmlNamespaces) {
        body += ' xmlns:' + this.xmlNamespaces[namespace] + '="' + namespace + '"'
      }
      body += '>\n' + this._renderPropSet(properties)
      body += '</d:mkcol>'
    }

    return this.request('MKCOL', url, headers, body).then(
      function (result) {
        return {
          status: result.status,
          body: result.body,
          xhr: result.xhr
        }
      }
    )
  },

  /**
   * Performs a HTTP request, and returns a Promise
   *
   * @param {string} method HTTP method
   * @param {string} url Relative or absolute url
   * @param {Object} headers HTTP headers as an object.
   * @param {string} body HTTP request body.
   * @param {string} responseType HTTP request response type.
   * @param streamResult
   * @return {Promise}
   */
  request: function (method, url, headers, body, responseType, streamResult = false) {
    var self = this
    var xhr = this.xhrProvider()
    headers = headers || {}
    responseType = responseType || ''

    if (this.userName) {
      headers.Authorization = 'Basic ' + btoa(this.userName + ':' + this.password)
      // xhr.open(method, this.resolveUrl(url), true, this.userName, this.password);
    }
    xhr.open(method, this.resolveUrl(url), true)
    var ii
    for (ii in headers) {
      xhr.setRequestHeader(ii, headers[ii])
    }
    xhr.responseType = responseType

    // Work around for edge
    if (body === undefined) {
      xhr.send()
    } else {
      xhr.send(body)
    }

    return new Promise(function (resolve, reject) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
          return
        }

        console.log('[worker] response fully received - start xml parsing')

        var resultBody = xhr.response
        if (xhr.status === 207) {
          resultBody = self.parseMultiStatus(xhr.response)
          if (!streamResult) {
            resultBody = Array.from(resultBody)
          }
        }
        console.log('[worker] xml parsing finished')

        resolve({
          body: resultBody,
          status: xhr.status,
          xhr: xhr
        })
      }

      xhr.ontimeout = function () {
        reject(new Error('Timeout exceeded'))
      }
    })
  },

  /**
     * Returns an XMLHttpRequest object.
     *
     * This is in its own method, so it can be easily overridden.
     *
     * @return {XMLHttpRequest}
     */
  xhrProvider: function () {
    return new XMLHttpRequest()
  },

  /**
     * Parses a property node.
     *
     * Either returns a string if the node only contains text, or returns an
     * array of non-text subnodes.
     *
     * @param {Object} propNode node to parse
     * @return {string|Array} text content as string or array of subnodes, excluding text nodes
     */
  _parsePropNode: function (propNode) {
    var content = null
    if (propNode.childNodes && propNode.childNodes.length > 0) {
      var subNodes = []
      // filter out text nodes
      for (var j = 0; j < propNode.childNodes.length; j++) {
        var node = propNode.childNodes[j]
        if (node.nodeType === 1) {
          subNodes.push(node)
        }
      }
      if (subNodes.length) {
        content = subNodes
      }
    }

    return content || propNode.textContent || propNode.text || ''
  },

  /**
     * Parses a multi-status response body.
     *
     * @param {string} xmlBody
     * @param {Array}
     */
  parseMultiStatus: function * (xmlBody) {
    const dom = new JSDOM()
    var parser = new dom.window.DOMParser()
    var doc = parser.parseFromString(xmlBody, 'application/xml')

    var resolver = function (foo) {
      var ii
      for (ii in this.xmlNamespaces) {
        if (this.xmlNamespaces[ii] === foo) {
          return ii
        }
      }
    }.bind(this)

    var responseIterator = doc.evaluate('/d:multistatus/d:response', doc, resolver, dom.window.XPathResult.ANY_TYPE, null)

    var responseNode = responseIterator.iterateNext()

    while (responseNode) {
      var response = {
        href: null,
        propStat: []
      }

      response.href = doc.evaluate('string(d:href)', responseNode, resolver, dom.window.XPathResult.ANY_TYPE, null).stringValue

      var propStatIterator = doc.evaluate('d:propstat', responseNode, resolver, dom.window.XPathResult.ANY_TYPE, null)
      var propStatNode = propStatIterator.iterateNext()

      while (propStatNode) {
        var propStat = {
          status: doc.evaluate('string(d:status)', propStatNode, resolver, dom.window.XPathResult.ANY_TYPE, null).stringValue,
          properties: {}
        }

        var propIterator = doc.evaluate('d:prop/*', propStatNode, resolver, dom.window.XPathResult.ANY_TYPE, null)

        var propNode = propIterator.iterateNext()
        while (propNode) {
          var content = this._parsePropNode(propNode)
          propStat.properties['{' + propNode.namespaceURI + '}' + propNode.localName] = content
          propNode = propIterator.iterateNext()
        }
        response.propStat.push(propStat)
        propStatNode = propStatIterator.iterateNext()
      }

      yield response
      responseNode = responseIterator.iterateNext()
    }
  },

  /**
     * Takes a relative url, and maps it to an absolute url, using the baseUrl
     *
     * @param {string} url
     * @return {string}
     */
  resolveUrl: function (url) {
    // Note: this is rudamentary.. not sure yet if it handles every case.
    if (/^https?:\/\//i.test(url)) {
      // absolute
      return url
    }

    var baseParts = this.parseUrl(this.baseUrl)
    if (url.charAt('/')) {
      // Url starts with a slash
      return baseParts.root + url
    }

    // Url does not start with a slash, we need grab the base url right up until the last slash.
    var newUrl = baseParts.root + '/'
    if (baseParts.path.lastIndexOf('/') !== -1) {
      newUrl = baseParts.path.subString(0, baseParts.path.lastIndexOf('/')) + '/'
    }
    newUrl += url
    return newUrl
  },

  /**
     * Parses a url and returns its individual components.
     *
     * @param {String} url
     * @return {Object}
     */
  parseUrl: function (url) {
    var parts = url.match(/^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/)
    var result = {
      url: parts[0],
      scheme: parts[1],
      host: parts[3],
      port: parts[4],
      path: parts[5],
      query: parts[6],
      fragment: parts[7]
    }
    result.root =
            result.scheme + '://' +
            result.host +
            (result.port ? ':' + result.port : '')

    return result
  },

  parseClarkNotation: function (propertyName) {
    var result = propertyName.match(/^{([^}]+)}(.*)$/)
    if (!result) {
      return
    }

    return {
      name: result[2],
      namespace: result[1]
    }
  }
}

export default Client
