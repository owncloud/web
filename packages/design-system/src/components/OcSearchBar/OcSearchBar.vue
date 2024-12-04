<template>
  <oc-grid
    flex
    :role="isFilter ? undefined : 'search'"
    class="oc-search oc-flex-middle"
    :class="{ 'oc-search-small': small }"
  >
    <div class="oc-width-expand oc-position-relative">
      <input
        ref="searchInput"
        :class="inputClass"
        :aria-label="label"
        :value="searchQuery"
        :disabled="loading"
        :placeholder="placeholder"
        @input="onType(($event.target as HTMLInputElement).value)"
        @keydown.enter="onSearch"
        @keyup="$emit('keyup', $event)"
      />
      <slot name="locationFilter" />
      <oc-button
        v-if="icon"
        v-oc-tooltip="$gettext('Search')"
        :aria-label="$gettext('Search')"
        class="oc-position-small oc-position-center-right oc-mt-rm"
        appearance="raw"
        @click.prevent.stop="$emit('advancedSearch', $event)"
      >
        <oc-icon v-show="!loading" :name="icon" size="small" fill-type="line" variation="passive" />
        <oc-spinner
          v-show="loading"
          :size="spinnerSize"
          :aria-label="loadingAccessibleLabelValue"
        />
      </oc-button>
    </div>
    <div class="oc-search-button-wrapper" :class="{ 'oc-invisible-sr': buttonHidden }">
      <oc-button
        class="oc-search-button"
        variation="primary"
        appearance="filled"
        :size="small ? 'small' : 'medium'"
        :disabled="loading || searchQuery.length < 1"
        @click="onSearch"
      >
        {{ buttonLabel }}
      </oc-button>
    </div>
    <oc-button
      v-if="showCancelButton"
      :variation="cancelButtonVariation"
      :appearance="cancelButtonAppearance"
      class="oc-ml-m"
      @click="onCancel"
    >
      <span v-text="$gettext('Cancel')" />
    </oc-button>
  </oc-grid>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useSlots, watch } from 'vue'

import OcButton from '../OcButton/OcButton.vue'
import OcGrid from '../OcGrid/OcGrid.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcSpinner from '../OcSpinner/OcSpinner.vue'

/**
 * The search bar is an input element used for searching server side resources or to filter local results.
 *
 * ## Accessibility
 *
 * ### Landmark role=search
 * Given there is only one instance of `<oc-search-bar>` per page/route, this component should communicate its purpose, being the main site search, to screen readers ([explainer of landmark roles](https://www.washington.edu/accessibility/web/landmarks/)). If the component serves as a filter form, it is advised to disable the landmark role via `isFilter="true"`.
 *
 * ### Making sure a submit button exits
 *
 * Both a search and filter form does need a submit button, regardless if the button is visually perceivable or not. If a "buttonless" look is desired, use `button-hidden="true"`, which renders the button visually hidden.
 *
 * The `aria-label` of the loading spinner can be set via `customLoadingAccessibleLabel`. If not set, it will default to "Loading results".
 */
export default defineComponent({
  name: 'OcSearchBar',
  status: 'ready',
  release: '1.0.0',
  components: {
    OcButton,
    OcGrid,
    OcIcon,
    OcSpinner
  },
  props: {
    /**
     * Set the search query
     */
    value: {
      type: String,
      required: false,
      default: null
    },
    /**
     * The icon to be displayed
     */
    icon: {
      type: String,
      required: false,
      default: 'search'
    },
    /**
     * Informative placeholder about the data to be entered
     */
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Informative label about the data to be entered
     */
    label: {
      type: String,
      required: true,
      default: ''
    },
    /**
     * Indicator if the search bar should be of smaller size
     */
    small: {
      type: Boolean,
      default: false
    },
    /**
     * Determine the button text
     */
    buttonLabel: {
      type: [String],
      required: false,
      default: 'Search'
    },
    /**
     * Determine the button visibility
     */
    buttonHidden: {
      type: [Boolean],
      required: false,
      default: false
    },
    /**
     * If set to true the search event is triggered on each entered character
     */
    typeAhead: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * automatically trim whitespaces around search term
     */
    trimQuery: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * If set to true data is loaded and the user cannot enter further data
     */
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * If set to true the search landmark role is removed since it's not the page's main search function anymore
     */
    isFilter: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * The aria-label for the loading spinner
     */
    loadingAccessibleLabel: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Show a "cancel" button next to the search bar.
     */
    showCancelButton: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Variation of the cancel button
     */
    cancelButtonVariation: {
      type: String,
      required: false,
      default: 'primary',
      validator: (value: string) => {
        return ['passive', 'primary', 'danger', 'success', 'warning', 'brand'].includes(value)
      }
    },
    /**
     * Appearance of the cancel button
     */
    cancelButtonAppearance: {
      type: String,
      required: false,
      default: 'raw',
      validator: (value: string) => {
        return ['outline', 'filled', 'raw', 'raw-inverse'].includes(value)
      }
    },
    /**
     * Handler function for when the cancel button is clicked.
     */
    cancelHandler: {
      type: Function,
      required: false,
      default: () => {}
    }
  },
  emits: ['advancedSearch', 'clear', 'input', 'keyup', 'search'],
  setup(props) {
    const slots = useSlots()
    const query = ref<string>('')
    watch(
      () => props.value,
      () => {
        if (!props.value) {
          query.value = ''
        }
      }
    )
    const inputIconRightPadding = computed(() => {
      if (slots.locationFilter?.().length > 0) {
        return '125px'
      }
      return '48px'
    })

    return { query, inputIconRightPadding }
  },
  computed: {
    searchQuery() {
      // please don't treat empty string the same as null...
      return this.value === null ? this.query : this.value
    },
    spinnerSize() {
      if (this.small) {
        return 'xsmall'
      }
      return 'medium'
    },
    inputClass() {
      const classes = ['oc-search-input', 'oc-input']

      !this.buttonHidden && classes.push('oc-search-input-button')

      return classes
    },
    loadingAccessibleLabelValue() {
      return this.loadingAccessibleLabel || this.$gettext('Loading results')
    }
  },
  methods: {
    focusSearchInput() {
      ;(this.$refs.searchInput as HTMLElement).focus()
    },
    onSearch() {
      /**
       * Search event on filter or search user input
       * @event search
       * @type {event}
       */
      this.$emit('search', this.query)
    },
    onType(query: string) {
      this.query = this.trimQuery ? query.trim() : query
      /**
       * Input event to support model directive
       * @event Input
       * @type {event}
       */
      this.$emit('input', query)
      if (this.typeAhead) this.onSearch(query)
    },

    onCancel() {
      this.query = ''
      this.onType('')
      this.onSearch()
      this.cancelHandler()
    }
  }
})
</script>

<style lang="scss">
.oc-search {
  min-width: $form-width-medium;

  &-button {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    // Prevent double borders
    // from input and button
    transform: translateX(-1px);
    z-index: 0;
  }

  &-icon {
    align-items: center;
    bottom: 0;
    color: var(--oc-color-onSurfaceVariant);
    display: inline-flex;
    justify-content: center;
    left: 0;
    position: absolute;
    top: 0;
    width: 40px;
  }

  &-input {
    border-radius: 25px !important;
    border: none;
    padding: var(--oc-space-medium);
    color: var(--oc-color-input-text-muted) !important;

    &:focus {
      background-color: var(--oc-color-input-bg);
      border-color: var(--oc-color-input-text-default);
      color: var(--oc-color-input-text-default);
      background-image: none;
    }

    &::-ms-clear,
    &::-ms-reveal {
      display: none;
    }
  }

  &-input-icon {
    padding-left: var(--oc-space-xlarge) !important;
    padding-right: v-bind(inputIconRightPadding) !important;
  }

  &-input-button {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  &-clear {
    right: var(--oc-space-large) !important;
  }

  &-small {
    .oc-search-input {
      height: 30px;
      line-height: 28px;
      padding-left: var(--oc-space-xlarge);
    }

    .oc-icon {
      &,
      svg {
        height: 18px;
        width: 18px;
      }
    }
  }
}
</style>

<docs>
```js
<template>
  <div>
    <section>
      <h3 class="oc-heading-divider">
        Search examples
      </h3>
      <oc-search-bar label="Search files" placeholder="Search files" @search="onSearch" @clear="onClear" />
      <div v-if="searchQuery" class="oc-m">Search query: {{ searchQuery }}</div>
      <div class="oc-my-m">
        <oc-search-bar label="Loading..." placeholder="Loading ..." loadingAccessibleLabel="Custom loading aria label" :loading="true" />
      </div>
      <div class="oc-my-m">
        <oc-search-bar small label="Small searchbar" placeholder="Small searchbar" :loading="true" />
      </div>
    </section>
    <section>
      <h3 class="oc-heading-divider">
        Search example with visually hidden button
      </h3>
      <div class="oc-mb">
        <oc-search-bar label="Search files" placeholder="Search files" @search="onSearch" @clear="onClear" :button-hidden="true" />
      </div>
    </section>
    <section>
      <h3 class="oc-heading-divider">
        Filter examples
      </h3>
      <oc-search-bar :isFilter="true" label="Search files" placeholder="Filter Files ..." :type-ahead="true" @search="onFilter" button="Filter" icon="" />
      <div v-if="filterQuery" class="oc-m">Filter query: {{ filterQuery }}</div>
    </section>
    <section>
      <h3 class="oc-heading-divider">
        Search with cancel button
      </h3>
      <oc-search-bar label="Search files" placeholder="Enter search term" :type-ahead="true" :show-cancel-button="true" />
    </section>
  </div>
</template>
<script>
  export default {
    data: () => {
      return {
        filterQuery: '',
        searchQuery: ''
      }
    },
    methods: {
      onFilter(val) {
        this.filterQuery = val
      },
      onSearch(val) {
        this.searchQuery = val
      },
      onClear () {
        alert('Query has been cleared')
      }
    }
  }
</script>
```
</docs>
