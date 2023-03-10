<template>
  <div>
    <div ref="dropdown" class="oc-expanding-dropdown" :class="{ active: dropdownVisible }">
      <div ref="head" class="head">
        <oc-button
          appearance="raw"
          variation="inverse"
          class="dropdown-button"
          @click="toggleDropdown"
        >
          <slot name="toggle" />
        </oc-button>
        <slot name="head" />
      </div>
      <transition name="drop-down-slide" mode="out-in">
        <div v-show="dropdownVisible" class="dropdown-content">
          <div ref="content">
            <slot name="body" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, unref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'OcExpandingDropdown',
  status: 'ready',
  release: '0.0.1',
  props: {
    expandHead: {
      type: Boolean,
      required: false,
      default: false
    },
    closeOnClick: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const dropdown = ref(null)
    const head = ref(null)
    const content = ref(null)
    const dropdownVisible = ref(false)

    const toggleDropdown = () => {
      dropdownVisible.value = !dropdownVisible.value
    }
    const calculateContentMax = () => {
      const el = unref(content)
      const setContentCssProperty = (property, value) => {
        el.parentNode.style.setProperty(property, value)
      }
      const removeContentCssProperty = (property) => {
        el.parentNode.style.removeProperty(property)
      }
      setContentCssProperty('top', '-99999px')
      setContentCssProperty('display', 'block')
      setContentCssProperty('position', 'absolute')

      const maxWidth = el.clientWidth
      const maxHeight = el.clientHeight

      setContentCssProperty('display', 'none')
      setContentCssProperty('max-width', `${maxWidth}px`)
      setContentCssProperty('max-height', `${maxHeight}px`)
      removeContentCssProperty('top')
      removeContentCssProperty('position')

      if (!props.expandHead) {
        return
      }
      const headEl = unref(head)
      headEl.style.setProperty('width', `${maxWidth - 10}px`)
    }
    const handleClick = () => {
      const el = unref(dropdown)
      const inner = unref(content)
      el.clickOutsideEvent = (event) => {
        if (props.closeOnClick && (inner == event.target || inner.contains(event.target))) {
          dropdownVisible.value = false
        }
        if (!(el == event.target || el.contains(event.target))) {
          dropdownVisible.value = false
        }
      }
      document.addEventListener('click', el.clickOutsideEvent)
    }
    onMounted(() => {
      calculateContentMax()
      handleClick()
    })
    onUnmounted(() => {
      document.removeEventListener('click', unref(dropdown).clickOutsideEvent)
    })
    return {
      dropdown,
      head,
      content,
      dropdownVisible,
      toggleDropdown
    }
  }
}
</script>

<style lang="scss">
.oc-expanding-dropdown {
  position: relative;
  display: inline-block;
  filter: none;
  transition: opacity 0.5s;

  &.active {
    filter: drop-shadow(0px 2px 4px #232323);
    .head {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      background-color: #4f4f4f;

      .dropdown-button:focus:not([disabled]) {
        background-color: transparent !important;
      }
      .dropdown-button:hover {
        background-color: transparent !important;
      }
    }
  }
  .head {
    padding-left: 5px;
    padding-right: 5px;
    border-radius: 5px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-out;

    & > * {
      display: inline-block;
    }
    .dropdown-button {
      background-color: transparent;
      color: white;
      border: none;
      cursor: pointer;
      height: 45px;
      width: 45px;
      z-index: 1;

      i {
        font-size: 22px;
      }
    }
  }
  .dropdown-content {
    position: absolute;
    top: 45px;
    left: 0;
    color: #cccccc;
    background-color: #4f4f4f;
    overflow: visible;
    z-index: 999999;
    border-bottom-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}

/* Transition */
.drop-down-slide-enter-active {
  transition: all 0.2s;
  transition-timing-function: ease-out;
}
.drop-down-slide-leave-active {
  transition: all 0.2s;
}
.drop-down-slide-enter-to,
.drop-down-slide-leave-from {
  overflow: hidden;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  opacity: 1;
}
.drop-down-slide-enter-from,
.drop-down-slide-leave-to {
  overflow: hidden;
  max-height: 2px !important;
  max-width: 45px !important;
  border-radius: 0px;
  opacity: 0;
}
</style>

<docs>
```js
<div>
  <oc-expanding-dropdown>
		<span>Hello World Hello World Hello World</span><br/>
		<span>Hello World Hello World</span><br/>
		<span>Hello World</span><br/>
		<span>Hello World</span><br/>
	</oc-expanding-dropdown>
</div>
```
</docs>
