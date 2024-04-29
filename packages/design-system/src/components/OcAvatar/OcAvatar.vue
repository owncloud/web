<template>
  <span
    class="vue-avatar--wrapper oc-avatar"
    :style="style"
    :width="width"
    :aria-label="accessibleLabel === '' ? null : accessibleLabel"
    :aria-hidden="accessibleLabel === '' ? 'true' : null"
    :focusable="accessibleLabel === '' ? 'false' : null"
    :role="accessibleLabel === '' ? null : 'img'"
    :data-test-user-name="userName"
  >
    <oc-img v-if="isImage" loading-type="lazy" class="avatarImg" :src="src" @error="onImgError" />
    <span v-else class="avatarInitials">{{ userInitial }}</span>
  </span>
</template>

<script lang="ts">
import OcImg from '../OcImage/OcImage.vue'
import { extractInitials } from './extractInitials'
import { defineComponent } from 'vue'

/**
 * Avatar is a thumbnail representing user or group
 */
export default defineComponent({
  name: 'OcAvatar',
  status: 'ready',
  release: '1.0.0',
  components: { OcImg },
  props: {
    /**
     * Source of the avatar img. If none is provided, the avatar's initials get rendered on a colorful background
     */
    src: {
      type: String,
      default: ''
    },
    /**
     * User name to display initials if src is not set
     */
    userName: {
      type: String,
      default: ''
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
     * The size of the avatar in pixels
     */
    width: {
      type: Number,
      required: false,
      default: 50
    }
  },
  data() {
    return {
      backgroundColors: [
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
      ],
      imgError: false
    }
  },
  computed: {
    background() {
      if (!this.isImage) {
        return this.randomBackgroundColor(this.userName.length, this.backgroundColors)
      }
      return ''
    },

    isImage() {
      return !this.imgError && Boolean(this.src)
    },

    style() {
      const style = {
        width: `${this.width}px`,
        height: `${this.width}px`,
        lineHeight: `${this.width}px`
      }

      const initialBackgroundAndFontStyle = {
        backgroundColor: this.background,
        fontSize: `${Math.floor(this.width / 2.5)}px`,
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: 'white'
      }

      Object.assign(style, initialBackgroundAndFontStyle)

      return style
    },

    userInitial() {
      if (!this.isImage) {
        return extractInitials(this.userName)
      }
      return ''
    }
  },
  methods: {
    onImgError() {
      this.imgError = true
    },

    randomBackgroundColor(seed: number, colors: string[]) {
      return colors[seed % colors.length]
    }
  }
})
</script>

<style lang="scss">
.oc-avatar {
  font-weight: normal;
  align-items: center;
  justify-content: center;
  text-align: center;
  user-select: none;
  display: flex;
  border-radius: 50%;

  .avatarImg {
    width: 100%;
    height: auto;
    border-radius: 50%;
  }

  .avatarInitials {
    color: white !important;
  }
}
</style>

<docs>
```js
  <oc-avatar class="oc-mb-s" src="https://picsum.photos/50/50?image=1074" accessible-label="Lion" />
  <oc-avatar class="oc-mb-s" user-name="Bruce Lee" accessible-label="Lion" />
```
</docs>
