<template>
  <div class="oc-contextual-helper">
    <oc-button :id="buttonId" :aria-label="$gettext('Show more information')" appearance="raw">
      <oc-icon name="question" fill-type="line" size="small" />
    </oc-button>
    <oc-info-drop :drop-id="dropId" :toggle="toggleId" v-bind="$props as any" />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue'
import uniqueId from '../../utils/uniqueId'
import OcButton from '../OcButton/OcButton.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcInfoDrop from '../OcInfoDrop/OcInfoDrop.vue'
import { ContextualHelperData } from '../../helpers'

export default defineComponent({
  name: 'OcContextualHelper',
  status: 'unreleased',
  components: { OcButton, OcIcon, OcInfoDrop },
  props: {
    /**
     * Title
     */
    title: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Text at the beginning
     */
    text: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * List element
     */
    list: {
      type: Array as PropType<ContextualHelperData[]>,
      required: false,
      default: (): ContextualHelperData[] => []
    },
    /**
     * Text at the end
     */
    endText: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Read more link at the end
     */
    readMoreLink: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    dropId() {
      return uniqueId('oc-contextual-helper-')
    },
    buttonId() {
      return `${this.dropId}-button`
    },
    toggleId() {
      return `#${this.buttonId}`
    }
  }
})
</script>

<style lang="scss">
.oc-contextual-helper {
  display: inline-block;
  .oc-button {
    vertical-align: middle;
  }
}
</style>

<docs>
## Examples
A simple example, using only text.
```js
<template>
  <div>
    <oc-contextual-helper v-bind="helperContent"/>
  </div>
</template>
<script>
export default {
  computed: {
    helperContent() {
      return {
        text: "Invite persons or groups to access this file or folder.",
      }
    }
  },
}
</script>
```

An example using Title, Text, List, End-Text and Read-More-Link properties.
```js
<template>
  <div>
    <oc-contextual-helper v-bind="helperContent"/>
  </div>
</template>
<script>
export default {
  computed: {
    helperContent() {
      return {
        title: 'Choose how access is granted ',
        text: "Share a file or folder by link",
        list: [
          {text: "Only invited people can access", headline: true},
          {text: "Only people from the list \"Invited people\" can access. If there is no list, no people are invited yet."},
          {text: "Everyone with the link", headline: true },
          {text: "Everyone with the link can access. Note: If you share this link with people from the list \"Invited people\", they need to login-in so that their individual assigned permissions can take effect. If they are not logged-in, the permissions of the link take effect." }
        ],
        endText: "Invited persons can not see who else has access",
        readMoreLink: "https://owncloud.design"
      }
    }
  },
}
</script>
```
</docs>
