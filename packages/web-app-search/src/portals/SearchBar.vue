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
      @clear="clearTerm"
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
          <li v-for="provider in displayProviders" :key="provider.id" class="provider">
            <ul class="oc-list">
              <li class="oc-text-truncate oc-flex oc-flex-between oc-text-muted provider-details">
                <span>{{ provider.displayName }}</span>
                <span v-if="showMoreResultsForProvider(provider)">
                  <router-link :to="getMoreResultsLinkForProvider(provider)">
                    <span>{{ getMoreResultsDetailsTextForProvider(provider) }}</span>
                  </router-link>
                </span>
              </li>
              <li
                v-for="providerSearchResultValue in getSearchResultForProvider(provider).values"
                :key="providerSearchResultValue.id"
                class="preview oc-flex oc-flex-middle"
              >
                <component
                  :is="provider.previewSearch.component"
                  :provider="provider"
                  :search-result="providerSearchResultValue"
                />
              </li>
            </ul>
          </li>
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
import { createLocationCommon, createLocationSpaces } from 'files/src/router'
import Mark from 'mark.js'

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
      markInstance: null,
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
    displayProviders() {
      /**
       * Computed to filter and sort providers that will be displayed
       * Only show providers which actually hold results
       */
      return this.availableProviders.filter(
        (provider) => this.getSearchResultForProvider(provider).values.length
      )
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
    },

    searchResults() {
      this.$nextTick(() => {
        this.markInstance = new Mark(this.$refs.options)
        this.markInstance.unmark()
        this.markInstance.mark(this.term, {
          element: 'span',
          className: 'highlight-mark',
          exclude: ['.provider-details *']
        })
      })
    }
  },

  asyncComputed: {
    searchResults: {
      async get() {
        if (!this.term || !this.optionsVisible) {
          return []
        }

        const searchResult = []

        for (const availableProvider of this.availableProviders) {
          if (availableProvider.previewSearch?.available) {
            searchResult.push({
              providerId: availableProvider.id,
              result: await availableProvider.previewSearch.search(this.term)
            })
          }
        }

        return searchResult
      },
      watch: ['term', 'optionsVisible']
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
    },
    clearTerm() {
      this.$router.push(createLocationSpaces('files-spaces-personal'))
    },
    onEvent(event) {
      const eventInComponent = this.$el.contains(event.target)
      const elementIsInteractive = event.target.tagName === 'a' || event.target.tagName === 'button'
      const clearEvent = event.target.classList.contains('oc-search-clear')
      const keyEventEsc = event.keyCode === 27

      event.stopPropagation()

      // optionsVisible is set to
      // - false if the event is a clearEvent or keyEventEsc
      // - or as fallback to eventInComponent which detects if the given event is in or outside the search component
      this.optionsVisible =
        clearEvent || keyEventEsc ? false : eventInComponent && !elementIsInteractive
    },
    getSearchResultForProvider(provider) {
      return this.searchResults.find(({ providerId }) => providerId === provider.id)?.result
    },
    showMoreResultsForProvider(provider) {
      const searchResult = this.getSearchResultForProvider(provider)
      if (!searchResult || !searchResult.totalResults) {
        return false
      }

      return searchResult.totalResults > searchResult.values.length
    },
    getMoreResultsLinkForProvider(provider) {
      return createLocationCommon('files-common-search', {
        query: { term: this.term, provider: provider.id }
      })
    },
    getMoreResultsDetailsTextForProvider(provider) {
      const searchResult = this.getSearchResultForProvider(provider)
      if (!searchResult || !searchResult.totalResults) {
        return
      }
      return this.$gettextInterpolate(this.$gettext('Show all %{totalResults} total results'), {
        totalResults: searchResult.totalResults
      })
    }
  }
}
</script>

<style lang="scss">
#files-global-search {
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

  #files-global-search-options {
    position: fixed;
    overflow-y: auto;
    max-height: calc(100% - 52px);
    border: 1px solid var(--oc-color-input-border);
    background-color: var(--oc-color-input-bg);
    width: 450px;
    text-decoration: none;

    .highlight-mark {
      background: yellow;
      color: var(--oc-color-text-muted);
    }

    @media (max-width: 959px) {
      left: var(--oc-space-medium);
      min-width: 95% !important;
      max-width: 95% !important;
      top: 60px;
    }

    ul {
      li.provider {
        padding: 0;
      }

      li {
        padding: var(--oc-space-small) var(--oc-space-small);
        position: relative;
        font-size: var(--oc-font-size-small);

        &.provider-details {
          font-size: var(--oc-font-size-xsmall);
        }

        &.preview {
          background-color: var(--oc-color-background-highlight);
          min-height: 44px;

          &:hover {
            background-color: var(--oc-color-input-border);
          }
        }
      }
    }
  }
}
</style>
