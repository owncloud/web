<template>
  <div
    :data-test-item-name="name"
    :aria-label="accessibleLabel === '' ? null : accessibleLabel"
    :aria-hidden="accessibleLabel === '' ? 'true' : null"
    :focusable="accessibleLabel === '' ? 'false' : null"
    :role="accessibleLabel === '' ? null : 'img'"
  >
    <span
      class="oc-avatar-item"
      :style="{
        backgroundColor,
        '--icon-color': iconColor,
        '--width': avatarWidth
      }"
    >
      <oc-icon v-if="hasIcon" :name="icon" :size="iconSize" :fill-type="iconFillType" />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'

export default defineComponent({
  name: 'OcAvatarItem',
  status: 'ready',
  release: '10.0.0',
  components: {
    OcIcon
  },
  props: {
    /**
     * Name of the public link used as an accessible label
     */
    name: {
      type: String,
      required: true
    },
    /**
     * Icon that should be used for the avatar
     */
    icon: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Color that should be used for the icon
     */
    iconColor: {
      type: String,
      required: false,
      default: 'var(--oc-color-inverseOnSurface)'
    },
    /**
     * Fill-type that should be used for the icon
     */
    iconFillType: {
      type: String,
      required: false,
      default: 'fill'
    },
    /**
     * Describes the size of the avatar icon e.g.(small)
     */
    iconSize: {
      type: String,
      required: false,
      default: 'small'
    },
    /**
     * Background color that should be used for the avatar. If empty
     * a random color will be picked
     */
    background: {
      type: String,
      required: false,
      default: 'var(--oc-color-secondary)'
    },
    /**
     * Accessibility label used as alt. Use only in case the avatar is used alone.
     * In case the avatar is used next to username or display name leave empty.
     * If not specified, avatar will get `aria-hidden="true"`.
     **/
    accessibleLabel: {
      type: String,
      required: false,
      default: ''
    },

    /**
     * Describes the width of the avatar
     */
    width: {
      type: Number,
      required: false,
      default: 30
    }
  },

  computed: {
    avatarWidth() {
      return this.width + 'px'
    },
    hasIcon() {
      return this.icon !== null
    },
    backgroundColor() {
      return this.background || this.pickBackgroundColor
    },
    pickBackgroundColor() {
      const backgroundColors = [
        '#b82015',
        '#c21c53',
        '#9C27B0',
        '#673AB7',
        '#3F51B5',
        '#106892',
        '#055c68',
        '#208377',
        '#1a761d',
        '#476e1a',
        '#636d0b',
        '#8e5c11',
        '#795548',
        '#465a64'
      ]
      return backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
    }
  }
})
</script>

<style lang="scss">
.oc-avatar-item {
  align-items: center;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 18px;
  border-radius: 50%;
  display: inline-flex;
  height: var(--width);
  justify-content: center;
  width: var(--width);

  .oc-icon > svg {
    fill: var(--icon-color) !important;
  }
}
</style>

<docs>
```js
<h3>Empty OcAvatarItem</h3>
<oc-avatar-item name="Public link" accessible-label="Public link" />
<h3>OcAvatarItem with icon and default background</h3>
<oc-avatar-item name="Public link" icon="close" accessible-label="Public link" />
<h3>OcAvatarItem with icon and custom background</h3>
<oc-avatar-item name="Public link" icon="close" background="#465a64" accessible-label="Public link" />
<h3>OcAvatarItem with icon and custom background and custom width and iconsize</h3>
<oc-avatar-item :width="100" iconSize="large" name="Public link" icon="close" background="#465a64" accessible-label="Public link" />
```
</docs>
