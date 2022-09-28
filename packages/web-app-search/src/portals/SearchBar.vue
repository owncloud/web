<template>
  <div v-if="availableProviders.length" id="files-global-search" data-custom-key-bindings="true">
    <oc-search-bar
      id="files-global-search-bar"
      ref="search"
      :label="searchLabel"
      :type-ahead="true"
      :placeholder="searchLabel"
      :button-hidden="true"
      @input="updateTerm"
      @clear="onClear"
      @click.native="term && $refs.optionsDrop.show()"
      @keyup.native.esc="$refs.optionsDrop.hide()"
      @keyup.native.up="onKeyUpUp"
      @keyup.native.down="onKeyUpDown"
      @keyup.native.enter="onKeyUpEnter"
    />
    <oc-drop
      id="files-global-search-options"
      ref="optionsDrop"
      mode="manual"
      target="#files-global-search-bar"
    >
      <oc-list class="oc-list-divider">
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
            <oc-list>
              <li class="oc-text-truncate oc-flex oc-flex-between oc-text-muted provider-details">
                <span class="display-name">{{ provider.displayName }}</span>
                <span>
                  <router-link
                    class="more-results"
                    :to="getMoreResultsLinkForProvider(provider)"
                    @click.native="$refs.optionsDrop.hide()"
                  >
                    <span>{{ getMoreResultsDetailsTextForProvider(provider) }}</span>
                  </router-link>
                </span>
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
                  @click.native="$refs.optionsDrop.hide()"
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

<script>
import { providerStore } from '../service'
import truncate from 'lodash-es/truncate'
import { createLocationCommon } from 'files/src/router'
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
      activePreviewIndex: null,
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
    searchResults() {
      this.activePreviewIndex = null

      this.$nextTick(() => {
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

  asyncComputed: {
    searchResults: {
      async get() {
        if (!this.term) {
          return []
        }

        const searchResults = []

        for (const availableProvider of this.availableProviders) {
          if (availableProvider.previewSearch?.available) {
            searchResults.push({
              providerId: availableProvider.id,
              result: await availableProvider.previewSearch.search(this.term)
            })
          }
        }

        return searchResults
      },
      watch: ['term']
    }
  },

  methods: {
    onClear() {
      this.term = ''
      this.$refs.optionsDrop.hide()
    },
    onKeyUpEnter() {
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
        'Show %{totalResults} result',
        'Show %{totalResults} results',
        searchResult.totalResults
      )

      return this.$gettextInterpolate(translated, {
        totalResults: searchResult.totalResults
      })
    },
    isPreviewElementActive(searchId) {
      const previewElements = this.$refs.optionsDrop.$el.querySelectorAll('.preview')
      return previewElements[this.activePreviewIndex]?.dataset?.searchId === searchId
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

    @media (max-width: 959px) {
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
