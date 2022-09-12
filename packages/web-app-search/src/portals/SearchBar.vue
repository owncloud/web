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
      @clear="resetProviders"
    />
    <div
      v-if="optionsVisible && term"
      id="files-global-search-options"
      ref="options"
      class="oc-mt-s oc-rounded"
    >
      <ul class="oc-list oc-list-divider">
        <li
          v-if="$asyncComputed.searchResults.updating"
          class="loading spinner oc-flex oc-flex-center oc-flex-middle oc-text-muted"
        >
          <oc-spinner size="small" :aria-hidden="true" aria-label="" />
          <span class="oc-ml-s">{{ $gettext('Searching ...') }}</span>
        </li>
        <li v-else-if="showNoResults" id="no-results" class="oc-flex oc-flex-center">
          {{ $gettext('No results') }}
        </li>
        <template v-else>
          <ul v-for="provider in availableProviders" :key="provider.id" class="provider">
            <li class="oc-text-truncate oc-flex oc-flex-between">
              <span>{{ provider.displayName }}</span>
              <span v-if="showMoreResultsForProvider(provider)" id="more-results">
                <router-link
                  id="more-results-link"
                  class="oc-flex oc-text-muted oc-width-1-1"
                  :to="getMoreResultsLinkForProvider(provider)"
                >
                  <span id="more-results-text" class="oc-flex oc-flex-center">{{
                    $gettext('Show more')
                  }}</span>
                  <span id="more-results-details" class="oc-flex">{{
                    getMoreResultsDetailsTextForProvider(provider)
                  }}</span>
                </router-link>
              </span>
            </li>
            <li
              v-for="(providerSearchResultValue, idx) in getSearchResultForProvider(provider)
                .values"
              :key="providerSearchResultValue.id"
              class="preview"
              :class="{ first: idx === 0 }"
            >
              <component
                :is="provider.previewSearch.component"
                :provider="provider"
                :search-result="providerSearchResultValue"
              />
            </li>
          </ul>
        </template>
      </ul>
    </div>
  </div>
  <div v-else><!-- no search provider available --></div>
</template>

<script>
import { providerStore } from '../service'
import truncate from 'lodash-es/truncate'
import get from 'lodash-es/get'
import { createLocationCommon } from 'files/src/router'

export default {
  name: 'SearchBar',

  filters: {
    truncate
  },

  data() {
    return {
      term: '',
      activeProvider: undefined,
      optionsVisible: false,
      providerStore
    }
  },

  computed: {
    showNoResults() {
      return this.searchResults.every(({ result }) => !result.values.length)
    },
    availableProviders() {
      return this.providerStore.availableProviders
    },
    searchLabel() {
      return this.$gettext('Enter search term')
    }
  },

  watch: {
    $route: {
      handler(r) {
        this.$nextTick(() => {
          if (!this.availableProviders.length) {
            return
          }
          const routeTerm = get(r, 'query.term')
          const input = this.$el.getElementsByTagName('input')[0]
          if (!input || !routeTerm) {
            return
          }
          this.term = routeTerm
          input.value = routeTerm
        })
      },
      immediate: true
    }
  },

  asyncComputed: {
    searchResults: {
      get() {
        if (!this.term || !this.optionsVisible) {
          return
        }
        return this.availableProviders.reduce(async (acc, provider) => {
          if (provider.previewSearch?.available) {
            acc.push({
              providerId: provider.id,
              result: await provider.previewSearch.search(this.term)
            })
          }
          return acc
        }, [])
      },
      watch: ['term']
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
      this.availableProviders.forEach((provider) => provider.updateTerm(term))
    },
    resetProviders() {
      this.availableProviders.forEach((provider) => provider.reset())
    },
    activateProvider(provider) {
      provider.activate(this.term)
    },
    onEvent(event) {
      const eventInComponent = this.$el.contains(event.target)
      const eventInPreviewItem = event.target.closest('.preview') !== null
      const clearEvent = event.target.classList.contains('oc-search-clear')
      const keyEventEsc = event.keyCode === 27

      event.stopPropagation()

      // optionsVisible is set to
      // - false if the event is a clearEvent or keyEventEsc
      // - or as fallback to eventInComponent which detects if the given event is in or outside the search component
      this.optionsVisible =
        clearEvent || keyEventEsc ? false : eventInComponent && !eventInPreviewItem
    },
    getSearchResultForProvider(provider) {
      return this.searchResults.find(({ providerId }) => providerId === provider.id)?.result
    },
    showMoreResultsForProvider(provider) {
      const searchResult = this.getSearchResultForProvider(provider)
      if (!searchResult || !searchResult.range) {
        return false
      }

      const rangeItems = parseInt(searchResult.range?.split('/')[1] || 0)
      return rangeItems > searchResult.values.length
    },
    getMoreResultsLinkForProvider(provider) {
      return createLocationCommon('files-common-search', {
        query: { term: this.term, provider: provider.id }
      })
    },
    getMoreResultsDetailsTextForProvider(provider) {
      const searchResult = this.getSearchResultForProvider(provider)
      if (!searchResult || !searchResult.range) {
        return
      }
      const rangeItems = parseInt(searchResult.range?.split('/')[1] || 0)
      return this.$gettextInterpolate(this.$gettext('%{totalResults} total results'), {
        totalResults: rangeItems
      })
    }
  }
}
</script>

<style lang="scss">
#files-global-search {
  #files-global-search-bar {
    width: 452px;
    @media (max-width: 959px) {
      min-width: 2.5rem;
      width: 2.5rem;
      background-color: var(--oc-color-swatch-brand-default);

      input,
      .oc-width-expand {
        width: 2.5rem;
      }

      .oc-search-input-icon {
        padding: 0 var(--oc-space-large);
      }

      .oc-search-clear {
        right: var(--oc-space-medium);
      }

      &:focus-within {
        position: absolute;
        height: 60px;
        left: var(--oc-space-medium);
        margin: 0 auto;
        top: 0;
        width: 100vw !important;

        .oc-search-input-icon {
          padding: 0 var(--oc-space-xlarge);
        }
      }

      &:focus-within input,
      input:not(:placeholder-shown) {
        background-color: var(--oc-color-input-bg);
        border: 1px solid var(--oc-color-input-border);
        z-index: var(--oc-z-index-modal);
        width: 95%;
        margin: 0 auto;
      }
    }
  }

  .oc-search-input {
    background-color: var(--oc-color-input-bg);
    transition: 0s;

    @media (max-width: 959px) {
      border: none;
      display: inline;
    }
  }

  &.options-visible {
    .oc-search-input {
      border: 1px solid var(--oc-color-input-border);
    }
  }
}

#files-global-search-options {
  position: fixed;
  overflow-y: auto;
  max-height: calc(100% - 52px);
  border: 1px solid var(--oc-color-input-border);
  background-color: var(--oc-color-input-bg);
  width: 450px;

  #more-results-link {
    text-decoration: none;
    flex-direction: column;
  }

  #more-results-details {
    justify-content: end;
    font-size: var(--oc-font-size-xsmall);
  }

  @media (max-width: 959px) {
    left: var(--oc-space-medium);
    min-width: 95% !important;
    max-width: 95% !important;
    top: 60px;
  }

  ul {
    &,
    li {
      padding: 0;
      margin: 0;
    }

    li {
      padding: 15px 10px;
      position: relative;
      font-size: var(--oc-font-size-small);

      border-top-color: var(--oc-color-input-border);

      &.selected,
      &:hover {
        background-color: var(--oc-color-input-border);
      }

      .label {
        background-color: white;
        border: 1px solid var(--oc-color-swatch-passive-hover);
        float: right;
        font-size: var(--oc-font-size-xsmall);
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
          border-top-color: var(--oc-color-input-border);
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
        padding-top: var(--oc-space-small);
        padding-bottom: var(--oc-space-small);
        background-color: var(--oc-color-background-highlight);

        &.first {
          border-top-color: var(--oc-color-input-border);
        }

        &:hover {
          background-color: var(--oc-color-input-border);

          > .label {
            opacity: 1;
          }
        }

        button {
          font-size: var(--oc-font-size-small);
        }

        .label {
          font-size: var(--oc-font-size-xsmall);
          padding: 0.1rem 0.2rem;
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
