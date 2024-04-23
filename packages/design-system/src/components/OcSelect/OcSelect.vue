<template>
  <div>
    <label
      v-if="label"
      :for="id"
      :class="{ 'oc-invisible-sr': isLabelHidden }"
      class="oc-label"
      v-text="label"
    />
    <oc-contextual-helper
      v-if="contextualHelper?.isEnabled"
      v-bind="contextualHelper?.data"
      class="oc-pl-xs"
    ></oc-contextual-helper>
    <vue-select
      ref="select"
      :disabled="disabled || readOnly"
      :filter="filter"
      :loading="loading"
      :searchable="searchable"
      :clearable="clearable"
      :multiple="multiple"
      class="oc-select"
      style="background: transparent"
      :dropdown-should-open="selectDropdownShouldOpen"
      :map-keydown="selectMapKeydown"
      v-bind="additionalAttributes"
      @update:model-value="$emit('update:modelValue', $event)"
      @click="onSelectClick()"
      @search:blur="onSelectBlur()"
      @keydown="onSelectKeyDown($event)"
    >
      <template #search="{ attributes, events }">
        <input class="vs__search" v-bind="attributes" @input="userInput" v-on="events" />
      </template>
      <template v-for="(index, name) in $slots" #[name]="data">
        <slot v-if="name !== 'search'" :name="name" v-bind="data" />
      </template>
      <template #no-options><div v-text="$gettext('No options available.')" /></template>
      <template #spinner="{ loading: loadingSpinner }">
        <oc-spinner v-if="loadingSpinner" />
      </template>
      <template #selected-option-container="{ option, deselect }">
        <span class="vs__selected" :class="{ 'vs__selected-readonly': option.readonly }">
          <slot name="selected-option" v-bind="option">
            <oc-icon v-if="readOnly" name="lock" class="oc-mr-xs" size="small" />
            {{ getOptionLabel(option) }}
          </slot>
          <span v-if="multiple" class="oc-flex oc-flex-middle oc-ml-s oc-mr-xs">
            <oc-icon v-if="option.readonly" class="vs__deselect-lock" name="lock" size="small" />
            <oc-button
              v-else
              appearance="raw"
              :title="$gettext('Deselect %{label}', { label: getOptionLabel(option) })"
              :aria-label="$gettext('Deselect %{label}', { label: getOptionLabel(option) })"
              class="vs__deselect oc-mx-rm"
              @mousedown.stop.prevent
              @click="deselect(option)"
            >
              <oc-icon name="close" size="small" />
            </oc-button>
          </span>
        </span>
      </template>
    </vue-select>

    <div
      v-if="showMessageLine"
      class="oc-text-input-message"
      :class="{
        'oc-text-input-description': !!descriptionMessage,
        'oc-text-input-warning': !!warningMessage,
        'oc-text-input-danger': !!errorMessage
      }"
    >
      <oc-icon
        v-if="messageText !== null && !!descriptionMessage"
        name="information"
        size="small"
        fill-type="line"
      />

      <span
        :id="messageId"
        :class="{
          'oc-text-input-description': !!descriptionMessage,
          'oc-text-input-warning': !!warningMessage,
          'oc-text-input-danger': !!errorMessage
        }"
        v-text="messageText"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Fuse from 'fuse.js'
import uniqueId from '../../utils/uniqueId'
import {
  defineComponent,
  ComponentPublicInstance,
  onMounted,
  ref,
  unref,
  VNodeRef,
  PropType
} from 'vue'
import { useGettext } from 'vue3-gettext'
import 'vue-select/dist/vue-select.css'
import { ContextualHelper } from '../../helpers'
// @ts-ignore
import VueSelect from 'vue-select'

// the keycode property is deprecated in the JS event API, vue-select still works with it though
enum KeyCode {
  Enter = 13
}

/**
 * Select component with a trigger and dropdown based on [Vue Select](https://vue-select.org/)
 */
export default defineComponent({
  name: 'OcSelect',
  status: 'ready',
  release: '4.3.0',
  components: { VueSelect },

  inheritAttrs: true,

  props: {
    /**
     * The ID of the element.
     */
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-select-')
    },
    /**
     * Function to filter items when searching
     */
    filter: {
      type: Function,
      required: false,
      default: (items: unknown[], search: string, props: { label: string }) => {
        if (items.length < 1) {
          return []
        }

        const fuse = new Fuse(items, {
          ...(props.label && { keys: [props.label] }),
          shouldSort: true,
          threshold: 0,
          ignoreLocation: true,
          distance: 100,
          minMatchCharLength: 1
        })

        return search.length ? fuse.search(search).map(({ item }) => item) : items
      }
    },
    /**
     * Disable the select component
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Label of the select component
     * ATTENTION: this shadows the vue-select prop `label`. If you need access to that use `optionLabel`.
     */
    label: {
      type: String,
      default: null
    },
    /**
     * oc-contextual-helper can be injected here
     */
    contextualHelper: {
      type: Object as PropType<ContextualHelper>,
      required: false,
      default: null
    },
    /**
     * Key to use as label when option is an object
     * NOTE: this maps to the vue-select prop `label`
     */
    optionLabel: {
      type: String,
      default: 'label'
    },
    getOptionLabel: {
      type: Function,
      default(this: any, option: string | Record<string, unknown>) {
        if (typeof option === 'object') {
          // we pass this function down to vue-select
          // so it needs to work in this component and in vue-select
          // hence we need to handle optionLabel and label
          const key = this.optionLabel || this.label
          if (!option.hasOwnProperty(key)) {
            return console.warn(
              `[vue-select warn]: Label key "option.${key}" does not` +
                ` exist in options object ${JSON.stringify(option)}.\n` +
                'https://vue-select.org/api/props.html#getoptionlabel'
            )
          }
          return option[key]
        }
        return option
      }
    },
    /**
     * Determines if the select field is searchable
     */
    searchable: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Determines if the select field is clearable
     */
    clearable: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Determines if the select field loading
     */
    loading: {
      type: Boolean,
      required: false,
      default: false
    },

    /**
     * A warning message which is shown below the select.
     */
    warningMessage: {
      type: String,
      default: null
    },
    /**
     * An error message which is shown below the select.
     */
    errorMessage: {
      type: String,
      default: null
    },
    /**
     * Whether or not vertical space below the select should be reserved for a one line message,
     * so that content actually appearing there doesn't shift the layout.
     */
    fixMessageLine: {
      type: Boolean,
      default: false
    },
    /**
     * A description text which is shown below the select field.
     */
    descriptionMessage: {
      type: String,
      default: null
    },
    /**
     * Determines if multiple options can be selected.
     */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
     * Determines if the select field is read only.
     *
     * Read only field will be visualized by a lock item and additionally behaves like a disabled field.
     * Read only takes effect if the server won't allow to change the value at all,
     * disabled should be used instead, if the value can't be changed in a specific context.
     *
     * For example: If the backend doesn't allow to set the login states for users in general, use read only.
     * If it's not allowed to change for the current logged-in User, use disabled.
     *
     */
    readOnly: {
      type: Boolean,
      default: false
    },
    isLabelHidden: {
      type: Boolean,
      default: false
    }
  },
  emits: ['search:input', 'update:modelValue'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const select: VNodeRef = ref()

    const setComboBoxAriaLabel = () => {
      const comboBoxElement = (unref(select) as ComponentPublicInstance).$el.querySelector(
        'div:first-child'
      )
      comboBoxElement?.setAttribute('aria-label', $gettext('Search for option'))
    }

    const userInput = (event: Event) => {
      /**
       * Triggers when a value of search input is changed
       *
       * @property {string} query search query
       */
      emit('search:input', (event.target as HTMLInputElement).value)
    }

    onMounted(() => {
      if (!props.label) {
        setComboBoxAriaLabel()
      }
    })

    const dropdownEnabled = ref(false)
    const setDropdownEnabled = (enabled: boolean) => {
      dropdownEnabled.value = enabled
    }

    const selectDropdownShouldOpen = ({
      noDrop,
      open,
      mutableLoading
    }: {
      noDrop?: boolean
      open?: boolean
      mutableLoading?: boolean
    }) => {
      return !noDrop && open && !mutableLoading && unref(dropdownEnabled)
    }

    const onSelectClick = () => {
      setDropdownEnabled(true)
    }

    const onSelectBlur = () => {
      setDropdownEnabled(false)
    }

    const selectMapKeydown = (map: Record<number, (e: KeyboardEvent) => void>) => {
      return {
        ...map,
        [KeyCode.Enter]: (e: KeyboardEvent) => {
          if (!unref(dropdownEnabled)) {
            setDropdownEnabled(true)
            return
          }
          map[KeyCode.Enter](e)
          unref(select).searchEl.focus()
        }
      }
    }

    const onSelectKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        return
      }

      setDropdownEnabled(true)
    }

    return {
      select,
      userInput,
      selectDropdownShouldOpen,
      selectMapKeydown,
      onSelectKeyDown,
      onSelectBlur,
      onSelectClick
    }
  },
  computed: {
    additionalAttributes() {
      const additionalAttrs: Record<string, unknown> = {}
      additionalAttrs['input-id'] = this.id
      additionalAttrs['getOptionLabel'] = this.getOptionLabel
      additionalAttrs['label'] = this.optionLabel

      return { ...this.$attrs, ...additionalAttrs }
    },
    showMessageLine() {
      return (
        this.fixMessageLine ||
        !!this.warningMessage ||
        !!this.errorMessage ||
        !!this.descriptionMessage
      )
    },
    messageText() {
      if (this.errorMessage) {
        return this.errorMessage
      }

      if (this.warningMessage) {
        return this.warningMessage
      }

      return this.descriptionMessage
    },
    messageId() {
      return `${this.id}-message`
    }
  }
})
</script>

<style lang="scss">
.vs--disabled {
  cursor: not-allowed;

  .vs__clear,
  .vs__dropdown-toggle,
  .vs__open-indicator,
  .vs__search,
  .vs__selected {
    background-color: var(--oc-color-background-muted) !important;
    color: var(--oc-color-input-text-muted) !important;
    pointer-events: none;
  }

  .vs__actions {
    opacity: 0.3;
  }
}

.oc-select {
  line-height: normal;
  padding: 1px 0;
  color: var(--oc-color-input-text-default);

  .vs {
    &__search {
      color: var(--oc-color-input-text-default);
    }

    &__search::placeholder,
    &__dropdown-toggle,
    &__dropdown-menu {
      -webkit-appearance: none;
      background-color: var(--oc-color-background-highlight);
      border-radius: 0;
      border-radius: 5px;
      border: 1px solid var(--oc-color-input-border);
      box-sizing: border-box;
      color: var(--oc-color-input-text-default);
      line-height: inherit;
      margin: 0;
      max-width: 100%;
      outline: none;
      padding: 2px;
      transition-duration: 0.2s;
      transition-timing-function: ease-in-out;
      transition-property: color, background-color;
      width: 100%;
    }

    &__selected-readonly {
      background-color: var(--oc-color-background-muted) !important;
    }

    &__search,
    &__search:focus {
      padding: 0 5px;
    }

    &__dropdown-menu {
      padding: 0;
      background-color: var(--oc-color-background-default);
      margin-top: -1px;
    }

    &__clear,
    &__open-indicator,
    &__deselect {
      fill: var(--oc-color-input-text-default);
    }
    &__deselect {
      margin: 0 var(--oc-space-small);
    }

    &__dropdown-option,
    &__no-options {
      color: var(--oc-color-input-text-default);
      white-space: normal;
      padding: 6px 0.6rem;
      border-radius: 5px;
      line-height: var(--vs-line-height);

      &--highlight,
      &--selected {
        background-color: var(--oc-color-background-hover);
        color: var(--oc-color-swatch-brand-hover);
      }
    }

    &__actions {
      flex-flow: row wrap;
      gap: var(--oc-space-xsmall);

      svg {
        overflow: visible;
      }

      cursor: pointer;
    }

    &__clear svg {
      max-width: var(--oc-space-small);
    }

    &__selected-options {
      flex: auto;
      padding: 0;

      > * {
        padding: 0px 2px;
        margin: 2px 2px 2px 1px;
        color: var(--oc-color-input-text-default);
      }

      > *:not(input) {
        padding-left: 3px;
        background-color: var(--oc-color-background-default);
        fill: var(--oc-color-text-default);
      }
    }
  }

  &.vs--multiple {
    .vs {
      &__selected-options > *:not(input) {
        color: var(--oc-color-input-text-default);
        background-color: var(--oc-color-background-default);
      }
    }
  }

  &:focus-within {
    .vs__dropdown-menu,
    .vs__dropdown-toggle {
      border-color: var(--oc-color-swatch-passive-default);
    }
  }
}

.oc-background-highlight {
  .oc-select {
    .vs {
      &__search {
        color: var(--oc-color-input-text-default);
      }

      &__search::placeholder,
      &__dropdown-toggle,
      &__dropdown-menu {
        background-color: var(--oc-color-input-bg);
      }
    }

    &.vs--multiple {
      .vs__selected-options > *:not(input) {
        color: var(--oc-color-input-text-default);
        background-color: var(--oc-color-background-highlight);
      }
    }

    &:focus-within {
      .vs__dropdown-menu,
      .vs__dropdown-toggle {
        background-color: var(--oc-color-background-default);
      }
    }
  }
}

.vs--single {
  &.vs--open .vs__selected {
    opacity: 0.8 !important;
  }
  .vs__selected-options > *:not(input) {
    background-color: transparent !important;
  }
}
</style>

<docs>
For detailed documentation (props, slots, events, etc.), please visit https://vue-select.org/

```js
<template>
  <div class="oc-docs-width-medium">
    <oc-select label="Custom label" v-model="selected" :options="['Bannana', 'Orange', 'Pear']" />
  </div>
</template>
<script>
  export default {
    data: () => ({
      selected: "Apple"
    })
  };
</script>
```

### Prevent user from clearing the selection
If we want to disable the clear button from the `oc-select`, we can set prop `clearable` to false. This will also
prevent clearing the selected value by hitting `delete`.

```js
<template>
  <div class="oc-docs-width-medium">
    <oc-select v-model="selected" :options="['Apple', 'Bannana', 'Orange', 'Pear']" :clearable="false" />
  </div>
</template>
<script>
  export default {
    data: () => ({
      selected: "Apple"
    })
  };
</script>
```

### Multiple selection
```js
<template>
  <div class="oc-docs-width-medium">
    <oc-select v-model="selected" :multiple="true" :options="options" />
  </div>
</template>
<script>
  export default {
    data: () => ({
      selected: ["Apple"]
    }),

    computed: {
      options() {
        return ["Apple", "Bannana", "Orange", "Pear"].filter(option => this.selected.indexOf(option) < 0);
      }
    }
  };
</script>
```

### Disable search
To prevent user from filtering options by typing a serach query into the `oc-select` component, set prop called
`searchable` to false.

```js
<template>
  <div class="oc-docs-width-medium">
    <oc-select v-model="selected" :options="['Apple', 'Bannana', 'Orange', 'Pear']" :searchable="false" />
  </div>
</template>
<script>
  export default {
    data: () => ({
      selected: "Apple"
    })
  };
</script>
```

### Use objects as options
If we want to select from a list of option objects, we can use `option-label` to select the key of the object to use as label.

```js
<template>
  <div class="oc-docs-width-medium">
    <oc-select
      label="Custom Label"
      option-label="title"
      :options="options"
      v-model="selected"
      class="oc-mb-m"
    />
  </div>
</template>
<script>
const options = [
  {
    title: 'Apple',
    desc: 'An apple is an edible fruit produced by an apple tree (Malus domestica)'
  },
  {
    title: 'Bannana',
    desc: 'Bannana is a genus of goblin spiders (family Oonopidae) native to Xishuangbanna prefecture, Yunnan Province, China, where it lives in the leaf-litter of tropical rainforest'
  },
  {
    title: 'Orange',
    desc: 'The orange is the fruit of various citrus species in the family Rutaceae'
  },
]

export default {
  data: () => ({
    selected: options[1],
    options
  })
}
</script>
```




### Using slots to display complex options
Sometimes we need to display more complex options. This can include e.g. an option with a title and a description. To
still display all those values exactly as we want to, we need to use scoped slots called `option` and `selected-option`.
We can then retrieve all the values that we want to display from the slot parameters.
It is important to specify the `option-label` prop on the `oc-select` to make filtering work.

```js
<template>
  <div class="oc-docs-width-medium">
    <oc-select
      label="Custom Label"
      :options="options"
      v-model="selected"
      class="oc-mb-m"
    >
      <template v-slot:option="{ title, desc }">
        <span class="option">
          <strong v-text="title" />
        </span>
        <span class="option" v-text="desc" />
      </template>
      <template #no-options>
        Your search query hasn't returned any results.
      </template>
      <template #selected-option="{ title, desc }">
        <strong class="oc-mr-s" v-text="title" /> <small v-text="desc.slice(0, 20) + '...'" />
      </template>
    </oc-select>
    <p>
      Selected: {{ selected }}
    </p>
  </div>
</template>
<script>
  const options = [
    {
      title: "Apple",
      desc: "An apple is an edible fruit produced by an apple tree (Malus domestica)"
    },
    {
      title: "Bannana",
      desc: "Bannana is a genus of goblin spiders (family Oonopidae) native to Xishuangbanna prefecture, Yunnan Province, China, where it lives in the leaf-litter of tropical rainforest"
    },
    {
      title: "Orange",
      desc: "The orange is the fruit of various citrus species in the family Rutaceae"
    }
  ];

  export default {
    data: () => ({
      selected: options[0],
      options
    })
  };
</script>
<style>
  .option {
    display: block;
  }
</style>
```

## Loading spinner
```js
<oc-select :options="['Apple', 'Bannana', 'Orange', 'Pear']" :multiple="true" :loading="true" />
```
</docs>
