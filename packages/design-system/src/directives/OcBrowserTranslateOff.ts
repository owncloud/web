export default {
  name: 'OcBrowserTranslateOff',
  beforeMount: (el: Element) => {
    el.setAttribute('translate', 'no')
  }
}
