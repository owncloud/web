<template>
  <div>
    <label :for="id" v-text="label" />
    <vue-select
      ref="select"
      :disabled="disabled"
      :filter="filter"
      class="oc-select"
      style="background: transparent"
      v-bind="additionalAttributes"
      v-on="$listeners"
    >
      <template #search="{ attributes, events }">
        <input class="vs__search" v-bind="attributes" @input="userInput" v-on="events" />
      </template>
      <template v-for="(index, name) in $scopedSlots" #[name]="data">
        <slot v-if="name !== 'search'" :name="name" v-bind="data" />
      </template>
      <div slot="no-options" v-translate>No options available.</div>
      <template #spinner="{ loading }">
        <oc-spinner v-if="loading" />
      </template>
    </vue-select>
  </div>
</template>

<script>
import Fuse from 'fuse.js'
import uniqueId from '../../utils/uniqueId'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

/**
 * Select component with a trigger and dropdown based on [Vue Select](https://vue-select.org/)
 */
export default {
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
          threshold: 0.2,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1
        })

        return search.length ? fuse.search(search).map(({ item }) => item) : fuse.list
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
    }
  },

  computed: {
    additionalAttributes() {
      const additionalAttrs = {}
      additionalAttrs['input-id'] = this.id
      if (this.optionLabel) {
        additionalAttrs['label'] = this.optionLabel
      }
      return { ...this.$attrs, ...additionalAttrs }
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
}
</script>

<style lang="scss">
@import '../../styles/styles';

.vs--disabled {
  .vs__clear,
  .vs__dropdown-toggle,
  .vs__open-indicator,
  .vs__search,
  .vs__selected {
    background-color: var(--oc-color-input-bg) !important;
  }
}

.vs--single.vs--open .vs__selected {
  opacity: 0.8 !important;
}

.oc-select {
  background-image: none !important;
  line-height: 24px !important;
  color: var(--oc-color-input-text-default);

  .vs {
    &__search,
    &__selected {
      color: var(--oc-color-input-text-default);
    }
    &__selected {
      background-color: var(--oc-color-background-default);
    }
    &__search::placeholder,
    &__dropdown-toggle,
    &__dropdown-menu {
      background-color: var(--oc-color-input-bg);
      border: 1px solid var(--oc-color-input-border);
      color: var(--oc-color-input-text-default);
    }

    &__clear,
    &__open-indicator,
    &__deselect {
      fill: var(--oc-color-input-text-default);
    }

    &__dropdown-option {
      color: var(--oc-color-input-text-default);
      white-space: normal;

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

    &__open-indicator {
      margin-top: 2px;
    }

    &__selected-options {
      flex: auto;
    }
  }

  &[multiple='multiple'] {
    .vs {
      &__selected {
        background-color: var(--oc-color-swatch-inverse-default);
        border: 1px solid var(--oc-color-input-border);
        fill: var(--oc-color-text-default);
      }

      &__deselect {
        fill: var(--oc-color-text-default);
      }
    }
  }

  &:focus-within {
    .vs__dropdown-menu,
    .vs__dropdown-toggle {
      border: 1px solid var(--oc-color-input-text-default);
    }
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
