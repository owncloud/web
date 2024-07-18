<template>
  <div class="oc-notification oc-mb-s" :class="classes">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Notifications are used to inform users about errors, warnings and as confirmations for their actions. They will automatically disappear after a certain amount of time.
 *
 * The default slot can be filled with [OcNotificationMessage](#/oC%20Components/OcNotificationMessage) elements.
 *
 * ## Accessibility
 *
 * ### Notifications for screen reader users
 * This component uses so called live regions in order to announce its content to screen readers once the notification appeared (this is not the normal modus operandi for screen readers, since their reading order is usually the DOM order – when the user does not take shortcuts). There are two types of live regions: `aria-live="polite"` (equivalent to `role="status"`) and `aria-live="assertive"` (equivalent to `role="alert"`). The latter directly interrupts the current output of the screen reader, the former waits until the current output is finished and reads the announcement afterwards. Since 'assertive' should be used sparingly, only `<oc-notfication-message>`'s "danger" status prop value uses `aria-live="assertive"` (and `role="alert"`). Using `aria-live` and `role="assertive|status"` simultaneously is for compatibility reasons regarding different browser and assistive technology pairings.
 */
export default defineComponent({
  name: 'OcNotifications',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Position of the notifications.
     * Valid values are: `top-left, top-center and top-right`
     */
    position: {
      type: String,
      required: false,
      default: 'default',
      validator: (value: string) => {
        return ['default', 'top-left', 'top-center', 'top-right'].includes(value)
      }
    }
  },
  computed: {
    classes() {
      return `oc-notification-${this.position}`
    }
  }
})
</script>

<style lang="scss">
.oc-notification {
  box-sizing: border-box;
  max-width: 100%;
  width: 400px;
  z-index: 1040;

  &-top-left {
    position: fixed;
    top: var(--oc-space-small);
    left: var(--oc-space-small);
  }
  &-top-center {
    position: fixed;
    top: var(--oc-space-small);
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
  }
  &-top-right {
    position: fixed;
    top: var(--oc-space-small);
    right: var(--oc-space-small);
  }
}
</style>

<docs>
```js
  <template>
    <section>
      <h3 class="oc-heading-divider">
        Notifications examples
      </h3>

      <oc-button @click="show('left')">Show left notifications</oc-button>
      <oc-button @click="show('center')">Show center notifications</oc-button>
      <oc-button @click="show('right')">Show right notifications</oc-button>

      <oc-notifications position="top-left">
        <oc-notification-message
            v-for="item in messages.left"
            :key="item.title"
            :status="item.status"
            :title="item.title"
            :message="item.message"
            :timeout="item.timeout"
            @close="removeNotification('left', item)"
        />
      </oc-notifications>

      <oc-notifications position="top-center">
        <oc-notification-message
            v-for="item in messages.center"
            :key="item.title"
            :status="item.status"
            :title="item.title"
            :message="item.message"
            :timeout="item.timeout"
            @close="removeNotification('center', item)"
        />
      </oc-notifications>

      <oc-notifications position="top-right">
        <oc-notification-message
            v-for="(item, index) in messages.right"
            :key="item.title"
            :status="item.status"
            :title="item.title"
            :message="item.message"
            :timeout="item.timeout"
            @close="removeNotification('right', item)"
        />
      </oc-notifications>

    </section>
  </template>
  <script>
    export default {
      data: () => {
        return {
          messages: {
            left: [],
            center: [],
            right: []
          }
        }
      },
      methods: {
        removeNotification(position, item) {
          this.messages[position] = this.messages[position].filter(el => el !== item);
        },
        show(position) {
          this.messages[position] = [
            {
              title: 'Default without a message',
              status: 'passive'
            },
            {
              title: 'This is a primary notification with a long title that spans more than just one line',
              message: 'And I have a message, too.',
              status: 'primary'
            },
            {
              title: 'This action could have consequences',
              message: 'Are you sure?',
              status: 'warning'
            },
            {
              title: 'Folder created',
              message: 'Just another day in paradise',
              status: 'success'
            },
            {
              title: 'Upload failed',
              message: 'Holy Shoot. Something broke',
              status: 'danger'
            },
          ]
        }
      }
    }
  </script>
```
</docs>
