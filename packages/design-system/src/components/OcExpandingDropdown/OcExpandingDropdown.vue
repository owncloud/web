<template>
  <div>
    <div ref="dropdown" class="dropdown" :class="{ active: dropdownVisible }">
      <oc-button
        appearance="raw"
        variation="inverse"
        class="dropdown-button"
        @click="toggleDropdown"
      >
        <oc-icon name="grid" size="large" class="oc-flex" />
      </oc-button>
      <transition name="slidedrop">
        <div v-if="dropdownVisible" class="dropdown-content">
          <div style="width: 300px; padding: 10px">
            <!--<slot />-->
            <p>ferf</p>
            <p>ferf</p>
            <p>ferf</p>
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
  setup() {
    const dropdown = ref(null)
    const dropdownVisible = ref(false)
    const buttonText = ref('Toggle Dropdown')

    const toggleDropdown = () => {
      dropdownVisible.value = !dropdownVisible.value
    }
    onMounted(() => {
      const el = unref(dropdown)
      el.clickOutsideEvent = (event) => {
        if (!(el == event.target || el.contains(event.target))) {
          dropdownVisible.value = false
        }
      }
      document.addEventListener('click', el.clickOutsideEvent)
    })
    onUnmounted(() => {
      const el = unref(dropdown)
      document.removeEventListener('click', el.clickOutsideEvent)
    })
    return {
      dropdown,
      dropdownVisible,
      buttonText,
      toggleDropdown
    }
  }
}
</script>

<style lang="scss">
.dropdown {
  position: relative;
  display: inline-block;
  filter: none;
  transition: opacity 0.5s;
  z-index: 9999;
}
.dropdown.active {
  filter: drop-shadow(0px 2px 4px #232323);
}
.dropdown.active > .dropdown-button {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  background-color: #4f4f4f !important;
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
  transition: all 0.15s ease-out;
  z-index: 1;
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
  z-index: 999999;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

.slidedrop-enter-active {
  transition: all 10.15s;
  transition-timing-function: ease-out;
}

.slidedrop-leave-active {
  transition-duration: 0.1s;
}

.slidedrop-enter-to,
.slidedrop-leave {
  overflow: hidden;
  max-height: 200px;
  max-width: 500px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  opacity: 1;
}

.slidedrop-enter,
.slidedrop-leave-to {
  overflow: hidden;
  max-height: 2px;
  max-width: 45px;
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
