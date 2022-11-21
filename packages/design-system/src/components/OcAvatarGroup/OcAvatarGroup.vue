<template>
  <oc-avatar-item
    :width="width"
    :icon-size="iconSize"
    icon="group"
    :name="name"
    :accessible-label="accessibleLabel"
  />
</template>

<script>
import OcAvatarItem from '../OcAvatarItem/OcAvatarItem.vue'

export default {
  name: 'OcAvatarGroup',
  status: 'ready',
  release: '10.0.0',
  components: { OcAvatarItem },

  props: {
    /**
     * Name of the group used as an accessible label
     */
    name: {
      type: String,
      required: true
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
    },

    /**
     * Describes the size of the avatar icon e.g.(small)
     */
    iconSize: {
      type: String,
      required: false,
      default: 'small'
    }
  }
}
</script>

<docs>
```js
<oc-avatar-group name="Group" accessible-label="Group" />
```
</docs>
