<template>
  <div>
    <label :for="id" class="oc-label" v-text="label" />
    <vue-select
      ref="select"
      :disabled="disabled"
      :filter="filter"
      :loading="loading"
      :searchable="searchable"
      :clearable="clearable"
      class="oc-select"
      style="background: transparent"
      v-bind="additionalAttributes"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #search="{ attributes, events }">
        <input class="vs__search" v-bind="attributes" @input="userInput" v-on="events" />
      </template>
      <template v-for="(index, name) in $slots" #[name]="data">
        <slot v-if="name !== 'search'" :name="name" v-bind="data" />
      </template>
      <template #no-options><div v-translate>No options available.</div></template>
      <template #spinner="{ loading }">
        <oc-spinner v-if="loading" />
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
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { defineComponent } from 'vue'

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
      default: (items, search, props) => {
        if (items.length < 1) {
          return []
        }

        const fuse = new Fuse(items, {
          ...(props.label && { keys: [props.label] }),
          shouldSort: true,
          threshold: 0.1,
          location: 0,
          distance: 100,
          minMatchCharLength: 1
        })

        return search.length ? fuse.search(search).map(({ item }) => item) : (fuse as any).list
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
     * Key to use as label when option is an object
     * NOTE: this maps to the vue-select prop `label`
     */
    optionLabel: {
      type: String,
      default: null
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
    }
  },
  emits: ['search:input', 'update:modelValue'],

  computed: {
    additionalAttributes() {
      const additionalAttrs = {}
      additionalAttrs['input-id'] = this.id
      if (this.optionLabel) {
        additionalAttrs['label'] = this.optionLabel
      }
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
  },

  mounted() {
    this.setComboBoxAriaLabel()
  },

  methods: {
    setComboBoxAriaLabel() {
      const comboBoxElement = this.$refs.select.$el.querySelector('div:first-child')
      comboBoxElement.setAttribute('aria-label', this.$gettext('Search for option'))
    },
    userInput(event) {
      /**
       * Triggers when a value of search input is changed
       *
       * @property {string} query search query
       */
      this.$emit('search:input', event.target.value)
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
      overflow: visible;
      padding: 2px;
      transition-duration: 0.2s;
      transition-timing-function: ease-in-out;
      transition-property: color, background-color;
      width: 100%;
    }

    &__search,
    &__search:focus {
      padding: 0 5px;
    }

    &__dropdown-menu {
      padding: 0;
      background-color: var(--oc-color-background-default);
    }

    &__clear,
    &__open-indicator,
    &__deselect {
      fill: var(--oc-color-input-text-default);
    }
    &__deselect {
      margin: 0 var(--oc-space-small);
    }

    &__dropdown-option {
      color: var(--oc-color-input-text-default);
      white-space: normal;
      padding: 0.5em calc(0.6em + 4px);
      border-radius: 5px;

      &--highlight {
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
    }

    &__selected-options {
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
        padding: 2px;
      }
    }
  }

  &:focus-within {
    .vs__dropdown-menu,
    .vs__dropdown-toggle {
      border-color: var(--oc-color-swatch-primary-gradient);
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
