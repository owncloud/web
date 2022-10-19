<template>
  <div
    v-if="isSearchBarEnabled"
    id="files-global-search"
    ref="searchBar"
    class="oc-flex"
    data-custom-key-bindings="true"
  >
    <oc-search-bar
      id="files-global-search-bar"
      ref="search"
      :label="searchLabel"
      :type-ahead="true"
      :placeholder="searchLabel"
      :button-hidden="true"
      :show-cancel-button="showCancelButton"
      cancel-button-variation="inverse"
      :cancel-handler="cancelSearch"
      @input="updateTerm"
      @clear="onClear"
      @click="showPreview"
      @keyup.esc="hideOptionsDrop"
      @keyup.up="onKeyUpUp"
      @keyup.down="onKeyUpDown"
      @keyup.enter="onKeyUpEnter"
    />
    <oc-button
      v-oc-tooltip="$gettext('Display search bar')"
      :aria-label="$gettext('Click to display and focus the search bar')"
      class="mobile-search-btn oc-mr-s"
      appearance="raw"
      variation="inverse"
      @click="showSearchBar"
    >
      <oc-icon name="search" fill-type="line"></oc-icon>
    </oc-button>
    <oc-drop
      id="files-global-search-options"
      ref="optionsDrop"
      mode="manual"
      target="#files-global-search-bar"
    >
      <oc-list class="oc-list-divider">
        <li
          v-if="loading"
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
            <oc-list>
              <li class="oc-text-truncate oc-flex oc-flex-between oc-text-muted provider-details">
                <span class="display-name">{{ provider.displayName }}</span>
                <span>{{ getMoreResultsDetailsTextForProvider(provider) }}</span>
              </li>
              <li
                v-for="providerSearchResultValue in getSearchResultForProvider(provider).values"
                :key="providerSearchResultValue.id"
                :data-search-id="providerSearchResultValue.id"
                :class="{
                  active: isPreviewElementActive(providerSearchResultValue.id)
                }"
                class="preview oc-flex oc-flex-middle"
              >
                <component
                  :is="provider.previewSearch.component"
                  class="preview-component"
                  :provider="provider"
                  :search-result="providerSearchResultValue"
                  @click="hideOptionsDrop"
                />
              </li>
            </oc-list>
          </li>
        </template>
      </oc-list>
    </oc-drop>
  </div>
  <div v-else><!-- no search provider available --></div>
</template>

<script lang="ts">
import { providerStore } from '../service'

import { createLocationCommon } from 'web-app-files/src/router'
import Mark from 'mark.js'
import { debounce } from 'lodash-es'
import { useStore, useUserContext } from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SearchBar',
  setup() {
    const store = useStore()
    return {
      isUserContext: useUserContext({ store })
    }
  },

  data() {
    return {
      resizeObserver: new ResizeObserver(this.onResize as ResizeObserverCallback),
      showCancelButton: false,
      term: '',
      activeProvider: undefined,
      optionsVisible: false,
      markInstance: null,
      activePreviewIndex: null,
      debouncedSearch: undefined,
      providerStore,
      loading: false,
      searchResults: [],
      hideOptionsDropEvent: null
    }
  },
  computed: {
    showNoResults() {
      return this.searchResults.every(({ result }) => !result.values.length)
    },
    availableProviders() {
      return this.providerStore.availableProviders
    },
    isSearchBarEnabled() {
      return this.availableProviders.length && this.isUserContext
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
    term() {
      this.debouncedSearch(this)
    },
    searchResults: {
      handler() {
        this.activePreviewIndex = null

        this.$nextTick(() => {
          if (this.showNoResults) {
            return
          }
          if (this.$refs.optionsDrop) {
            this.markInstance = new Mark(this.$refs.optionsDrop.$refs.drop)
            this.markInstance.unmark()
            this.markInstance.mark(this.term, {
              element: 'span',
              className: 'highlight-mark',
              exclude: ['.provider-details *']
            })
          }
        })
      },
      deep: true
    },
    $route: {
      handler(r) {
        this.$nextTick(() => {
          if (!this.availableProviders.length) {
            return
          }
          const routeTerm = r?.query?.term
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
  created() {
    this.debouncedSearch = debounce(this.search, 500)

    this.hideOptionsDropEvent = eventBus.subscribe('app.search.options-drop.hide', () => {
      this.$refs.optionsDrop.hide()
    })
  },

  mounted() {
    if (this.isSearchBarEnabled) {
      this.resizeObserver.observe(this.$refs.searchBar)
    }
  },

  beforeUnmount() {
    if (this.isSearchBarEnabled) {
      this.resizeObserver.unobserve(this.$refs.searchBar)
    }
    eventBus.unsubscribe('app.search.options-drop.hide', this.hideOptionsDropEvent)
  },

  methods: {
    async showPreview() {
      if (!this.term) {
        return
      }

      this.$refs.optionsDrop.show()
      await this.search()
    },
    async search() {
      this.searchResults = []
      if (!this.term) {
        return
      }

      this.loading = true

      for (const availableProvider of this.availableProviders) {
        if (availableProvider.previewSearch?.available) {
          this.searchResults.push({
            providerId: availableProvider.id,
            result: await availableProvider.previewSearch.search(this.term)
          })
        }
      }

      this.loading = false
    },
    onClear() {
      this.term = ''
      this.$refs.optionsDrop.hide()
    },
    onKeyUpEnter() {
      // Do not show the results page for local filter provider
      return
      this.$refs.optionsDrop.hide()

      if (this.term && this.activePreviewIndex === null) {
        this.$router.push(
          createLocationCommon('files-common-search', {
            query: { term: this.term, provider: 'files.sdk' }
          })
        )
      }

      if (this.activePreviewIndex !== null) {
        this.$refs.optionsDrop.$el
          .querySelectorAll('.preview')
          [this.activePreviewIndex].firstChild.click()
      }
    },
    onKeyUpUp() {
      const previewElementsCount = this.$refs.optionsDrop.$el.querySelectorAll('.preview').length

      if (!previewElementsCount) {
        return
      }

      if (this.activePreviewIndex === null) {
        this.activePreviewIndex = previewElementsCount - 1
      } else {
        this.activePreviewIndex = this.activePreviewIndex === 0 ? null : this.activePreviewIndex - 1
      }

      this.scrollToActivePreviewOption()
    },
    onKeyUpDown() {
      const previewElementsCount = this.$refs.optionsDrop.$el.querySelectorAll('.preview').length

      if (!previewElementsCount) {
        return
      }

      if (this.activePreviewIndex === null) {
        this.activePreviewIndex = 0
      } else {
        this.activePreviewIndex =
          this.activePreviewIndex === previewElementsCount - 1 ? null : this.activePreviewIndex + 1
      }

      this.scrollToActivePreviewOption()
    },
    scrollToActivePreviewOption() {
      if (typeof this.$refs.optionsDrop.$el.scrollTo !== 'function') {
        return
      }

      const previewElements = this.$refs.optionsDrop.$el.querySelectorAll('.preview')

      this.$refs.optionsDrop.$el.scrollTo(
        0,
        this.activePreviewIndex === null
          ? 0
          : previewElements[this.activePreviewIndex].getBoundingClientRect().y -
              previewElements[this.activePreviewIndex].getBoundingClientRect().height
      )
    },
    updateTerm(term) {
      this.term = term

      if (!this.term) {
        return this.$refs.optionsDrop.hide()
      }

      return this.$refs.optionsDrop.show()
    },
    getSearchResultForProvider(provider) {
      return this.searchResults.find(({ providerId }) => providerId === provider.id)?.result
    },
    getMoreResultsLinkForProvider(provider) {
      return createLocationCommon('files-common-search', {
        query: { term: this.term, provider: provider.id }
      })
    },
    getMoreResultsDetailsTextForProvider(provider) {
      const searchResult = this.getSearchResultForProvider(provider)
      if (!searchResult || !searchResult.totalResults) {
        return this.$gettext('Show all results')
      }

      const translated = this.$ngettext(
        '%{totalResults} result',
        '%{totalResults} results',
        searchResult.totalResults
      )

      return this.$gettextInterpolate(translated, {
        totalResults: searchResult.totalResults
      })
    },
    isPreviewElementActive(searchId) {
      const previewElements = this.$refs.optionsDrop.$el.querySelectorAll('.preview')
      return previewElements[this.activePreviewIndex]?.dataset?.searchId === searchId
    },
    showSearchBar() {
      document.getElementById('files-global-search-bar').style.visibility = 'visible'
      const inputElement = document.getElementsByClassName('oc-search-input')[0] as HTMLElement
      inputElement.focus()

      this.showCancelButton = true
    },
    cancelSearch() {
      document.getElementById('files-global-search-bar').style.visibility = 'hidden'
      this.showCancelButton = false
    },
    onResize() {
      const searchBarEl = document.getElementById('files-global-search-bar')
      const optionDropVisible = !!document.querySelector('.tippy-box[data-state="visible"]')

      if (window.innerWidth > 639) {
        searchBarEl.style.visibility = 'visible'
        this.showCancelButton = false
      } else {
        if (optionDropVisible) {
          searchBarEl.style.visibility = 'visible'
          this.showCancelButton = true
        } else {
          searchBarEl.style.visibility = 'hidden'
          this.showCancelButton = false
        }
      }
    },
    hideOptionsDrop() {
      this.$refs.optionsDrop.hide()
    }
  }
})
</script>

<style lang="scss">
#files-global-search {
  .mobile-search-btn {
    display: none;
    @media (max-width: 639px) {
      display: inline-flex;
    }
  }

  .oc-search-input {
    background-color: var(--oc-color-input-bg);
    transition: 0s;
    height: 2.3rem;

    @media (max-width: 639px) {
      border: none;
      display: inline;
    }
  }

  #files-global-search-bar {
    width: 452px;
    @media (max-width: 959px) {
      width: 300px;
    }

    @media (max-width: 639px) {
      visibility: hidden;
      background-color: var(--oc-color-swatch-brand-default);
      position: absolute;
      height: 48px;
      left: 0;
      right: 0;
      margin: 0 auto;
      top: 0;
      width: 95vw !important;

      .oc-search-input-icon {
        padding: 0 var(--oc-space-xlarge);
      }

      input,
      input:not(:placeholder-shown) {
        background-color: var(--oc-color-input-bg);
        border: 1px solid var(--oc-color-input-border);
        z-index: var(--oc-z-index-modal);
        margin: 0 auto;
      }
    }
  }

  #files-global-search-options {
    width: 450px;
    overflow-y: auto;
    max-height: calc(100vh - 60px);
    text-decoration: none;

    .oc-card {
      padding: 0 !important;
    }

    .highlight-mark {
      font-weight: 600;
    }

    @media (max-width: 969px) {
      width: 300px;
    }

    @media (max-width: 639px) {
      width: 93vw !important;
    }

    ul {
      li.provider {
        padding: 0;
      }

      li {
        padding: var(--oc-space-xsmall) var(--oc-space-small);
        position: relative;
        font-size: var(--oc-font-size-small);

        &.provider-details {
          font-size: var(--oc-font-size-xsmall);
        }

        &.preview {
          min-height: 44px;

          &:hover,
          &.active {
            background-color: var(--oc-color-background-highlight);
          }
        }
      }
    }
  }
}
</style>
