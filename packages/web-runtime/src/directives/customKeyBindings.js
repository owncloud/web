import { bus } from 'web-pkg/src/instance'

function onFocus() {
  bus.publish('app.keybind.disable')
}
function onBlur() {
  bus.publish('app.keybind.enable')
}
export default {
  inserted: (el) => {
    el.addEventListener("focus", onFocus)
    el.addEventListener("blur", onBlur)
  },
  unbind: (el) => {
    el.removeEventListener("focus", onFocus)
    el.removeEventListener("blur", onBlur)
  }
}