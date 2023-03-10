<template>
  <div>
    <div ref="dropdown" class="oc-expanding-dropdown" :class="{ active: dropdownVisible }">
      <oc-button
        appearance="raw"
        variation="inverse"
        class="dropdown-button"
        @click="toggleDropdown"
      >
        <oc-icon name="grid" size="large" class="oc-flex" />
      </oc-button>
      <transition name="drop-down-slide" mode="out-in">
        <div v-show="dropdownVisible" class="dropdown-content">
          <div ref="content">
            <slot />
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
    closeOnClick: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const dropdown = ref(null)
    const content = ref(null)
    const dropdownVisible = ref(false)
    const buttonText = ref('Toggle Dropdown')

    const toggleDropdown = () => {
      dropdownVisible.value = !dropdownVisible.value
    }

    const calculateContentMax = () => {
      const el = unref(content)
      el.parentNode.style.setProperty('top', '-99999px')
      el.parentNode.style.setProperty('display', 'block')
      el.parentNode.style.setProperty('position', 'absolute')

      const maxWidth = el.clientWidth
      const maxHeight = el.clientHeight
      el.parentNode.style.setProperty('display', 'none')
      el.parentNode.style.setProperty('max-width', `${maxWidth}px`)
      el.parentNode.style.setProperty('max-height', `${maxHeight}px`)
      el.parentNode.style.removeProperty('top')
      el.parentNode.style.removeProperty('position')
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
      const el = unref(dropdown)
      document.removeEventListener('click', el.clickOutsideEvent)
    })
    return {
      dropdown,
      content,
      dropdownVisible,
      buttonText,
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
}
.oc-expanding-dropdown.active {
  filter: drop-shadow(0px 2px 4px #232323);
}
.oc-expanding-dropdown.active > .dropdown-button {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  background-color: #4f4f4f;
  transition-delay: 0s;
}
.dropdown-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  height: 45px;
  width: 45px;
  border-radius: 5px;
  transition: all 0.2s ease-out;
  z-index: 1;
}
.oc-expanding-dropdown.active > .dropdown-button:focus:not([disabled]) {
  background-color: #4f4f4f !important;
}
.oc-expanding-dropdown.active > .dropdown-button:hover {
  background-color: #4f4f4f !important;
}

.dropdown-button i {
  font-size: 22px;
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
<div style="background: #dddddd; height: 200px; background-color: #292929; padding: 20px;">
  <oc-expanding-dropdown>
		<span>Hello World Hello World Hello World</span><br/>
		<span>Hello World Hello World</span><br/>
		<span>Hello World</span><br/>
		<span>Hello World</span><br/>
	</oc-expanding-dropdown>
</div>
```
</docs>
