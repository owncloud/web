<template>
  <div>
    <div ref="dropdown" class="oc-expanding-dropdown" :class="expandingDropdownClasses">
      <div ref="head" class="head">
        <oc-button
          ref="toggle"
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
            <div v-if="expandHead" class="space-divider oc-pb-s"></div>
            <div>
              <slot name="body" />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, unref, onMounted, onUnmounted, computed } from 'vue'

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
  setup(props, { emit }) {
    const dropdown = ref(null)
    const toggle = ref(null)
    const head = ref(null)
    const content = ref(null)
    const dropdownVisible = ref(false)
    const resizeObserver = ref(null)

    const contentWidth = ref(-1)
    const contentHeight = ref(-1)

    const expandingDropdownClasses = computed(() => {
      return {
        active: unref(dropdownVisible),
        'expand-head': props.expandHead,
        'open-left': unref(dropdownOpeningDirection) === 'left'
      }
    })
    const toggleDropdown = () => {
      dropdownVisible.value = !dropdownVisible.value
      if (dropdownVisible.value) {
        emit('dropdown-open', true)
      } else {
        emit('dropdown-close', true)
      }
    }
    const dropdownOpeningDirection = computed(() => {
      const toggleButton = unref(toggle)
      if (toggleButton == null) {
        // Page load
        return 'right'
      }
      const buttonRect = toggleButton.$el.getBoundingClientRect()
      const spaceLeft = buttonRect.left
      const spaceRight = window.innerWidth - buttonRect.right

      if (spaceRight >= spaceLeft) {
        return 'right'
      }
      return 'left'
    })
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

      contentWidth.value = el.clientWidth
      contentHeight.value = el.clientHeight

      setContentCssProperty('display', 'none')
      setContentCssProperty('max-width', `${unref(contentWidth)}px`)
      setContentCssProperty('max-height', `${unref(contentHeight)}px`)
      removeContentCssProperty('top')
      removeContentCssProperty('position')

      resizeObserver.value = new ResizeObserver(() => {
        setContentCssProperty('max-width', `${unref(el.clientWidth)}px`)
        setContentCssProperty('max-height', `${unref(el.clientHeight)}px`)
      })
      resizeObserver.value.observe(el)

      if (!props.expandHead) {
        return
      }
      unref(head).style.setProperty('width', `${unref(contentWidth) - 10}px`)
    }
    const handleClick = () => {
      const el = unref(dropdown)
      const inner = unref(content)
      el.clickOutsideEvent = (event) => {
        if (!unref(dropdownVisible)) {
          // Don't check for clicks outside if dropdown is not visible/active
          return
        }
        if (props.closeOnClick && (inner == event.target || inner.contains(event.target))) {
          dropdownVisible.value = false
          emit('dropdown-close', true)
        }
        if (!(el == event.target || el.contains(event.target))) {
          dropdownVisible.value = false
          emit('dropdown-close', true)
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
      resizeObserver.value.unobserve(el)
      resizeObserver.value = null
    })
    return {
      dropdown,
      head,
      toggle,
      content,
      dropdownVisible,
      toggleDropdown,
      expandingDropdownClasses,
      dropdownOpeningDirection
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

  &.open-left {
    display: inline-flex;
    justify-content: flex-end;

    .dropdown-content {
      border-radius: 5px;
      border-top-right-radius: 0px !important;
    }
  }

  &.active {
    filter: drop-shadow(0px 2px 4px rgba(20, 20, 20, 0.45));
    &:not(.expand-head) {
      .head {
        border-radius: 5px;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        background-color: var(--oc-color-background-secondary);
      }
    }
  }
  &:not(.active) {
    .dropdown-button:focus:not([disabled]):not(:hover) {
      background-color: transparent !important;
    }
    .dropdown-button:hover {
      background-color: var(--oc-color-background-hover) !important;
      transform: scale(0.9);
      border-radius: 5px;
    }
  }
  &.expand-head {
    .head {
      justify-content: left;
    }
    .space-divider {
      height: 45px;
      &::after {
        content: '';
        display: block;
        border-bottom: 2px solid rgba(0, 0, 0, 0.15);
        padding: 0 4px;
        height: 120%;
        width: calc(100% - 30px);
        margin-left: 10px;
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
      display: flex;
      background-color: transparent;
      border: none;
      cursor: pointer;
      height: 45px;
      width: 45px;
      z-index: 1;
      transition: all 0.15s ease-in;

      i {
        font-size: 22px;
      }
      & > * {
        display: flex;
      }
    }
  }
  .dropdown-content {
    position: absolute;
    top: 0px;
    min-width: 300px;
    background-color: var(--oc-color-background-secondary);
    overflow: hidden;
    z-index: -1;
    border-bottom-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  &:not(.expand-head) {
    .dropdown-content {
      top: 45px;
    }
  }
  &.expand-head {
    .dropdown-content {
      border-radius: 5px;
    }
  }
}

/* Transitions */
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

/* Transition to the left */
/*.drop-down-slide-left-enter-active {
  transition: all 0.2s ease-out;
  transform-origin: top right;
  transform: scale(0, 0);
}

.drop-down-slide-left-leave-active {
  transition: all 0.2s ease-out;
  transform-origin: top right;
  transform: scale(1, 1);
}

.drop-down-slide-left-enter-to {
  transform: scale(1, 1);
}

.drop-down-slide-left-leave-to {
  transform: scale(0, 0);
}*/
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
