// from https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/
// src/utils/external-component.js
export default async function externalComponent (url) {
  const name = url.split('/').reverse()[0].match(/^(.*?)\.js/)[1]

  if (window[name]) return window[name]

  window[name] = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.addEventListener('load', () => {
      resolve(window[name])
    })
    script.addEventListener('error', () => {
      reject(new Error(`Error loading ${url}`))
    })
    script.src = url
    document.head.appendChild(script)
  })

  return window[name]
}
