<template>
  <oc-drop
    ref="drop"
    class="oc-width-1-1 oc-info-drop"
    :drop-id="dropId"
    :toggle="toggle"
    :mode="mode"
    close-on-click
    @hide-drop="() => (dropOpen = false)"
    @show-drop="() => (dropOpen = true)"
  >
    <focus-trap :active="dropOpen">
      <div class="info-drop-content">
        <div class="oc-flex oc-flex-between info-header oc-border-b oc-pb-s">
          <h4 class="oc-m-rm info-title" v-text="$gettext(title)" />
          <oc-button
            v-oc-tooltip="$gettext('Close')"
            appearance="raw"
            :aria-label="$gettext('Close')"
          >
            <oc-icon name="close" fill-type="line" size="medium" variation="inherit" />
          </oc-button>
        </div>
        <p v-if="text" class="info-text" v-text="$gettext(text)" />
        <dl v-if="listItems.length" class="info-list">
          <component
            :is="item.headline ? 'dt' : 'dd'"
            v-for="(item, index) in listItems"
            :key="index"
          >
            {{ $gettext(item.text) }}
          </component>
        </dl>
        <p v-if="endText" class="info-text-end" v-text="$gettext(endText)" />
        <oc-button
          v-if="readMoreLink"
          type="a"
          appearance="raw"
          size="small"
          class="info-more-link"
          :href="readMoreLink"
          target="_blank"
        >
          {{ $gettext('Read more') }}
        </oc-button>
      </div>
    </focus-trap>
  </oc-drop>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import OcButton from '../OcButton/OcButton.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcDrop from '../OcDrop/OcDrop.vue'
import { uniqueId } from '../../helpers'
import { FocusTrap } from 'focus-trap-vue'
import { ContextualHelperDataListItem } from '../../helpers'

export default defineComponent({
  name: 'OcInfoDrop',
  status: 'unreleased',
  components: { OcButton, OcIcon, OcDrop, FocusTrap },
  props: {
    /**
     * Id of the element
     */
    dropId: {
      type: String,
      required: false,
      default: () => uniqueId('oc-info-drop-')
    },
    /**
     * CSS selector for the element to be used as toggle. By default, the preceding element is used
     **/
    toggle: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Events that cause the drop to show. Multiple event names are separated by spaces
     *
     * @values click, hover, manual
     **/
    mode: {
      type: String,
      required: false,
      default: 'click',
      validator: (value: string) => {
        return ['click', 'hover', 'manual'].includes(value)
      }
    },
    /**
     * Element selector used as a target of the element
     */
    target: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Title
     */
    title: {
      type: String,
      required: true
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
      type: Array as PropType<ContextualHelperDataListItem[]>,
      required: false,
      default: (): ContextualHelperDataListItem[] => []
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
  setup(props) {
    const dropOpen = ref(false)

    const listItems = computed(() => {
      return (props.list || []).filter((item) => !!item.text)
    })

    return {
      dropOpen,
      listItems
    }
  }
})
</script>

<style lang="scss">
.oc-info-drop {
  display: inline-block;
  .oc-button {
    vertical-align: middle;
  }
  .info-drop-content {
    font-size: var(--oc-font-size-medium);
    color: var(--oc-color-text-default);
  }
  .info-more-link {
    font-size: var(--oc-font-size-medium) !important;
  }
  .info-header {
    align-items: center;
  }
  .info-title {
    font-size: 1.125rem;
    font-weight: normal;
  }
  .info-list:first-child,
  .info-text:first-child {
    margin-top: 0;
  }
  .info-list:last-child,
  .info-text:last-child {
    margin-bottom: 0;
  }
  .info-list {
    font-weight: bold;
    margin-bottom: var(--oc-space-xsmall);
    margin-top: var(--oc-space-small);
    dt {
      &:first-child {
        margin-top: 0;
      }
    }
    dd {
      margin-left: 0;
      font-weight: normal;
    }
  }
}
</style>

<docs>
## Examples
A simple example, using only text.
```js
<template>
  <div>
    <oc-info-drop v-bind="helperContent"/>
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
    <oc-info-drop v-bind="helperContent"/>
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
