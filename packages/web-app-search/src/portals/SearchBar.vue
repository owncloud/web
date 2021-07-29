<template>
  <div
    v-if="availableProviders.length"
    id="files-global-search"
    :class="{ 'options-visible': optionsVisible && term }"
  >
    <oc-search-bar
      id="files-global-search-bar"
      ref="search"
      :label="searchLabel"
      :type-ahead="true"
      :placeholder="searchLabel"
      :button-hidden="true"
      @input="updateTerm"
      @clear="resetProvider"
    />
    <div v-if="optionsVisible && term" id="files-global-search-options" ref="options">
      <ul class="uk-list uk-list-divider">
        <li
          v-for="provider in availableProviders"
          :key="provider.id"
          class="provider"
          :class="{ selected: activeProvider ? provider.id === activeProvider.id : false }"
          @click="activateProvider(provider)"
        >
          <oc-icon name="search" accessible-label="Search" />
          <span class="term">{{ term | truncate }}</span>
          <button v-if="provider.label" class="label">{{ provider.label }}</button>
        </li>
        <li v-if="$asyncComputed.searchResults.updating" class="loading spinner">
          <oc-spinner size="small" :aria-hidden="true" aria-label="" />
        </li>
        <template v-if="!$asyncComputed.searchResults.updating">
          <li
            v-for="(searchResult, idx) in searchResults"
            :key="searchResult.id"
            class="preview"
            :class="{ first: idx === 0 }"
            @click="activeProvider.previewSearch.activate(searchResult)"
          >
            <component
              :is="activeProvider.previewSearch.component"
              :provider="activeProvider"
              :search-result="searchResult"
            />
          </li>
        </template>
      </ul>
    </div>
  </div>
  <div v-else><!-- no search provider available --></div>
</template>

<script>
import Vue from 'vue'
import { providerStore } from '../service'
import truncate from 'lodash-es/truncate'
import get from 'lodash-es/get'

export default {
  name: 'SearchBar',

  filters: {
    truncate
  },

  data() {
    return {
      term: '',
      optionsVisible: false,
      activeProvider: undefined,
      providerStore
    }
  },

  computed: {
    availableProviders() {
      return this.providerStore.availableProviders
    },

    searchLabel() {
      return this.$gettext('Enter search term')
    }
  },

  watch: {
    $route() {
      if (this.activeProvider && !this.activeProvider.available) {
        this.activeProvider = undefined
      }
    }
  },

  mounted() {
    const input = this.$el.getElementsByTagName('input')[0]
    const routeTerm = get(this, '$route.query.term')

    if (!input || !routeTerm) {
      return
    }

    this.term = routeTerm
    input.value = routeTerm
  },

  asyncComputed: {
    searchResults: {
      get() {
        if (!this.optionsVisible) {
          return []
        }

        if (!this.activeProvider) {
          return []
        }

        if (!this.activeProvider.previewSearch) {
          return []
        }

        if (!this.activeProvider.previewSearch.available) {
          return []
        }

        return this.activeProvider.previewSearch.search(this.term)
      },
      watch: ['term', 'activeProvider', 'optionsVisible']
    }
  },

  created() {
    window.addEventListener('keyup', this.onEvent)
    window.addEventListener('focusin', this.onEvent)
    window.addEventListener('click', this.onEvent)
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.onEvent)
    window.removeEventListener('focusin', this.onEvent)
    window.removeEventListener('click', this.onEvent)
  },
  methods: {
    updateTerm(term) {
      this.term = term
      this.activeProvider.updateTerm(term)
    },
    resetProvider() {
      this.optionsVisible = false
      this.availableProviders.forEach(provider => provider.reset())
    },
    activateProvider(provider) {
      this.optionsVisible = false
      this.activeProvider = provider
      provider.activate(this.term)
    },
    onEvent(event) {
      if (!this.activeProvider) {
        this.activeProvider = this.availableProviders[0]
      }

      const optionsVisibleInitial = this.optionsVisible
      const eventInComponent = this.$el.contains(event.target)
      const clearEvent = event.target.classList.contains('oc-search-clear')
      const keyEventUp = event.keyCode === 38
      const keyEventDown = event.keyCode === 40
      const keyEventEnter = event.keyCode === 13
      const keyEventEsc = event.keyCode === 27
      const activeProviderIndex = this.availableProviders.indexOf(this.activeProvider)

      event.stopPropagation()

      if (clearEvent || keyEventEsc) {
        this.optionsVisible = false
        return
      }

      Vue.set(this, 'optionsVisible', eventInComponent)

      if (keyEventEnter) {
        this.activateProvider(this.activeProvider)
        return
      }

      let nextProviderIndex

      if (
        (keyEventUp || keyEventDown) &&
        this.availableProviders.length > 0 &&
        optionsVisibleInitial
      ) {
        const should = keyEventDown
          ? activeProviderIndex < this.availableProviders.length - 1
          : activeProviderIndex > 0
        const firstIndex = keyEventDown ? 0 : this.availableProviders.length - 1
        const lastIndex = keyEventDown ? activeProviderIndex + 1 : activeProviderIndex - 1

        nextProviderIndex = should ? lastIndex : firstIndex
      }

      if (isNaN(nextProviderIndex) || nextProviderIndex === activeProviderIndex) {
        return
      }

      this.activeProvider = this.availableProviders[nextProviderIndex]
    }
  }
}
</script>

<style lang="scss">
#files-global-search {
  #files-global-search-bar {
    width: 452px;
    @media (max-width: 959px) {
      width: 50px;

      &:focus {
        min-width: 252px !important;
      }

      &:focus-within input,
      input:not(:placeholder-shown) {
        background-color: var(--oc-color-background-muted);
        border: 1px solid rgba(75, 94, 120, 0.6);
        top: -20px;
        z-index: 9999;
        min-width: 252px !important;
      }

      .oc-search-clear {
        right: -200px;
      }
    }
  }

  .oc-search {
    min-width: 40px;
  }

  .oc-search-input {
    transition: 0s;

    @media (max-width: 959px) {
      background: white;
      border: none;
      display: inline;
      width: 2rem;
    }
  }

  &.options-visible {
    .oc-search-input {
      border: 1px solid rgba(75, 94, 120, 0.6);
    }
  }
}

#files-global-search-options {
  border: 1px solid rgba(75, 94, 120, 0.6);
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background-color: var(--oc-color-input-bg);
  overflow: hidden;
  position: absolute;
  margin-top: -3px;
  width: 450px;

  @media (max-width: 959px) {
    min-width: 250px !important;
    max-width: 250px !important;
  }

  ul {
    &,
    li {
      padding: 0;
      margin: 0;
    }

    li {
      padding: 15px 10px;
      cursor: pointer;
      position: relative;
      font-size: 0.9rem;

      border-top-color: var(--oc-color-input-border);

      &.selected {
        background-color: var(--oc-color-input-border);
      }

      &:hover:not(.selected) {
        background-color: var(--oc-color-background-muted);
      }

      .label {
        background-color: white;
        border: 1px solid var(--oc-color-swatch-passive-hover);
        border-radius: 3px;
        float: right;
        font-size: 0.6rem;
        padding: 0.5rem 1rem;
        position: relative;
        opacity: 0.6;
        top: -4px;

        @media (max-width: 959px) {
          float: none;
          opacity: 1;
          top: 0.65rem;
          right: 10px;
          position: absolute;
        }
      }

      &.loading {
        padding-top: 20px;
        padding-bottom: 15px;
        background-color: var(--oc-color-background-muted);
        text-align: center;

        &.spinner {
          border-top-color: rgba(75, 94, 120, 0.2);
        }
      }

      &.provider {
        opacity: 0.6;

        &:first-of-type {
          border-top: none;
        }

        .oc-icon,
        .oc-icon > svg {
          height: 18px;
          max-height: 18px;
          max-width: 18px;
          width: 18px;
          margin-right: 8px;
          opacity: 0.6;
          vertical-align: middle;
        }

        &:hover,
        &.selected {
          .oc-icon,
          .oc-icon > svg {
            opacity: 0.8;
          }

          opacity: 1;
        }
      }

      &.preview {
        padding-top: 12px;
        padding-bottom: 12px;
        background-color: var(--oc-color-background-muted);

        &.first {
          border-top-color: rgba(75, 94, 120, 0.6);
        }

        &:hover {
          background-color: var(--oc-color-input-bg);

          > .label {
            opacity: 1;
          }
        }

        button {
          font-size: 0.9rem;
        }

        .label {
          font-size: 0.5rem;
          padding: 0.1rem 0.2rem;
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
