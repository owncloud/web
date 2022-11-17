import tippy from 'tippy.js'
import merge from 'deepmerge'
import __logger from '../utils/logger'

export const hideOnEsc = {
  name: 'hideOnEsc',
  defaultValue: true,
  fn({ hide }) {
    const onKeyDown = (e) => {
      if (e.keyCode === 27) {
        hide()
      }
    }

    return {
      onShow: () => {
        document.addEventListener('keydown', onKeyDown)
      },
      onHide: () => {
        document.removeEventListener('keydown', onKeyDown)
      }
    }
  }
}

export const ariaHidden = {
  name: 'ariaHidden',
  defaultValue: true,
  fn(instance) {
    return {
      onCreate() {
        instance.popper.setAttribute('aria-hidden', true)
      }
    }
  }
}

export const destroy = (_tippy) => {
  if (!_tippy) {
    return
  }

  try {
    _tippy.destroy()
  } catch (e) {
    __logger(e)
  }
}

const initOrUpdate = (el, { value = {} }, { elm }) => {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    value = { content: value }
  }

  if (value.content !== 0 && !value.content) {
    destroy(elm.tooltip)
    elm.tooltip = null
    return
  }

  const props = merge.all([
    {
      ignoreAttributes: true,
      aria: {
        content: null,
        expanded: false
      }
    },
    value
  ])

  if (!elm.tooltip) {
    elm.tooltip = tippy(el, {
      ...props,
      plugins: [hideOnEsc, ariaHidden]
    })
    return
  }

  elm.tooltip.setProps(props)
}

export default {
  name: 'OcTooltip',
  bind: initOrUpdate,
  componentUpdated: initOrUpdate,
  unbind: (el, binding, { elm }) => destroy(elm.tooltip)
}
