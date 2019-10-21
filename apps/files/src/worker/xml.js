const Parser = require('node-xml-stream-parser')

export default function parseXml (stream, eventMap) {
  const parser = new Parser()

  const stack = []
  let topNode = null

  function getNamespace (name) {
    const splittedName = name.split(':', 2)
    if (splittedName.length !== 2) {
      return null
    }
    const ns = splittedName[0]
    for (const item of stack) {
      if (item.attrs[`xmlns:${ns}`]) {
        return item.attrs[`xmlns:${ns}`]
      }
    }

    return null
  }
  function replaceXmlNS (name) {
    const splittedName = name.split(':', 2)
    if (splittedName.length !== 2) {
      return
    }
    const ns = splittedName[0]
    const tagName = splittedName[1]
    for (const item of stack) {
      if (item.attrs[`xmlns:${ns}`]) {
        const fullNS = item.attrs[`xmlns:${ns}`]
        return `{${fullNS}}${tagName}`
      }
    }

    return name
  }

  parser.on('opentag', (name, attrs) => {
    topNode = {
      name: name,
      nodeName: name,
      attrs: attrs,
      $markup: []
    }
    stack.push(topNode)
    topNode.namespaceURI = getNamespace(topNode.nodeName)
    topNode.name = replaceXmlNS(topNode.nodeName)
  })

  // </tag>
  parser.on('closetag', tagName => {
    if (stack.length === 0) {
      return
    }

    let newTop = null
    tagName = replaceXmlNS(tagName)

    // emit
    emit(eventMap, `tag:${tagName}`, topNode)

    // Pop stack, and add to parent node
    stack.pop()
    if (stack.length > 0) {
      newTop = stack[stack.length - 1]
      newTop.$markup.push(topNode)
    }
    topNode = newTop
  })

  // <tag>TEXT</tag>
  parser.on('text', text => {
    if (topNode) {
      topNode.$markup.push(text)
    }
  })

  // <[[CDATA['data']]>
  parser.on('cdata', cdata => {
    console.log('cdata', cdata)
  })

  parser.on('instruction', (name, attrs) => {
    console.log('instruction', name, attrs)
  })

  // Only stream-errors are emitted.
  parser.on('error', error => {
    emit(eventMap, 'error', error)
  })

  parser.on('finish', () => {
    emit(eventMap, 'end', {})
  })

  const reader = stream.getReader()

  reader.read().then(function processText ({ done, value }) {
    if (done) {
      emit(eventMap, 'end', {})
      return
    }

    parser.write(value)

    return reader.read().then(processText)
  })
}
function emit (eventMap, eventName, payLoad) {
  if (eventMap[eventName]) {
    eventMap[eventName](payLoad)
  }
}
