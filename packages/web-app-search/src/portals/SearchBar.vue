<template>
  <div
    v-if="isSearchBarEnabled"
    id="files-global-search"
    ref="searchBar"
    class="oc-flex"
    data-custom-key-bindings-disabled="true"
  >
    <oc-search-bar
      id="files-global-search-bar"
      :label="searchLabel"
      :type-ahead="true"
      :value="term"
      :placeholder="searchLabel"
      :button-hidden="true"
      :show-cancel-button="showCancelButton"
      :show-advanced-search-button="listProviderAvailable"
      cancel-button-variation="brand"
      cancel-button-appearance="raw-inverse"
      :cancel-handler="cancelSearch"
      @advanced-search="onKeyUpEnter"
      @input="updateTerm"
      @clear="onClear"
      @click="showPreview"
      @keyup.esc="hideOptionsDrop"
      @keyup.up="onKeyUpUp"
      @keyup.down="onKeyUpDown"
      @keyup.enter="onKeyUpEnter"
    >
      <template #locationFilter>
        <search-bar-filter
          v-if="locationFilterAvailable"
          id="files-global-search-filter"
          :current-folder-available="currentFolderAvailable"
          @update:model-value="onLocationFilterChange"
        />
      </template>
    </oc-search-bar>
    <oc-button
      v-oc-tooltip="$gettext('Display search bar')"
      :aria-label="$gettext('Click to display and focus the search bar')"
      class="mobile-search-btn oc-mr-l"
      appearance="raw-inverse"
      variation="brand"
      @click="showSearchBar"
    >
      <oc-icon name="search" fill-type="line"></oc-icon>
    </oc-button>
    <oc-drop
      v-if="showDrop"
      id="files-global-search-options"
      ref="optionsDropRef"
      mode="manual"
      target="#files-global-search-bar"
      close-on-click
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
                <span class="display-name" v-text="$gettext(provider.displayName)" />
                <span v-if="!!provider.listSearch">
                  <router-link class="more-results" :to="getSearchResultLocation(provider.id)">
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
                  :term="term"
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

<script lang="ts" setup>
import {
  SearchProvider,
  createLocationCommon,
  isLocationCommonActive,
  isLocationSpacesActive,
  queryItemAsString,
  useAuthStore,
  useCapabilityStore,
  useResourcesStore
} from '@ownclouders/web-pkg'
import Mark from 'mark.js'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash-es'
import { useRoute, useRouteQuery, useRouter } from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import {
  computed,
  inject,
  onBeforeUnmount,
  Ref,
  ref,
  unref,
  watch,
  nextTick,
  useTemplateRef
} from 'vue'
import { useGettext } from 'vue3-gettext'
import { SearchLocationFilterConstants } from '@ownclouders/web-pkg'
import { SearchBarFilter } from '@ownclouders/web-pkg'
import { useAvailableProviders } from '../composables'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { OcDrop } from '@ownclouders/design-system/components'

const router = useRouter()
const { $gettext, $ngettext } = useGettext()
const capabilityStore = useCapabilityStore()
const showCancelButton = ref(false)
const isMobileWidth = inject<Ref<boolean>>('isMobileWidth')
const scopeQueryValue = useRouteQuery('scope')
const availableProviders = useAvailableProviders()

const authStore = useAuthStore()
const route = useRoute()
const { userContextReady, publicLinkContextReady } = storeToRefs(authStore)

const resourcesStore = useResourcesStore()
const { currentFolder } = storeToRefs(resourcesStore)

const locationFilterId = ref(SearchLocationFilterConstants.allFiles)
const optionsDropRef = useTemplateRef('optionsDropRef')
const activePreviewIndex = ref(null)
const term = ref('')
const restoreSearchFromRoute = ref(false)
const searchResults = ref([])
const loading = ref(false)
const currentFolderAvailable = ref(false)
const markInstance = ref<Mark>()
const clearTermEvent = ref(null)

function onClear() {
  term.value = ''
  optionsDrop.value.hide()
}
function findNextPreviewIndex(previous = false) {
  const elements = Array.from(document.querySelectorAll('li.preview'))
  let index =
    unref(activePreviewIndex) !== null ? unref(activePreviewIndex) : previous ? elements.length : -1
  const increment = previous ? -1 : 1

  do {
    index += increment
    if (index < 0 || index > elements.length - 1) {
      return null
    }
  } while (elements[index].classList.contains('disabled'))

  return index
}
function onKeyUpUp() {
  activePreviewIndex.value = findNextPreviewIndex(true)
  scrollToActivePreviewOption()
}
function onKeyUpDown() {
  activePreviewIndex.value = findNextPreviewIndex(false)
  scrollToActivePreviewOption()
}
function scrollToActivePreviewOption() {
  if (typeof optionsDrop.value.$el.scrollTo !== 'function') {
    return
  }

  const previewElements = optionsDrop.value.$el.querySelectorAll('.preview')

  optionsDrop.value.$el.scrollTo(
    0,
    activePreviewIndex.value === null
      ? 0
      : previewElements[unref(activePreviewIndex)].getBoundingClientRect().y -
          previewElements[unref(activePreviewIndex)].getBoundingClientRect().height
  )
}

function getSearchResultForProvider(provider: SearchProvider) {
  return unref(searchResults).find(({ providerId }) => providerId === provider.id)?.result
}
function parseRouteQuery(route: RouteLocationNormalizedLoaded, initialLoad = false) {
  const avilableCurrentFolder =
    (isLocationSpacesActive(router, 'files-spaces-generic') || !!unref(scopeQueryValue)) &&
    !isLocationSpacesActive(router, 'files-spaces-projects')
  if (unref(currentFolderAvailable) !== avilableCurrentFolder) {
    currentFolderAvailable.value = avilableCurrentFolder
  }

  nextTick(() => {
    if (!unref(availableProviders).length) {
      return
    }
    const routeTerm = route?.query?.term
    const input = document.getElementsByTagName('input')[0]
    if (!input || !routeTerm) {
      return
    }
    restoreSearchFromRoute.value = initialLoad
    term.value = queryItemAsString(routeTerm)
    input.value = queryItemAsString(routeTerm)
  })
}
function getMoreResultsDetailsTextForProvider(provider: SearchProvider) {
  const searchResult = getSearchResultForProvider(provider)
  if (!searchResult || !searchResult.totalResults) {
    return $gettext('Show all results')
  }

  return $ngettext(
    'Show %{totalResults} result',
    'Show %{totalResults} results',
    searchResult.totalResults,
    {
      totalResults: searchResult.totalResults
    }
  )
}
function isPreviewElementActive(searchId: string) {
  const previewElements = optionsDrop.value.$el.querySelectorAll('.preview')
  return previewElements[unref(activePreviewIndex)]?.dataset?.searchId === searchId
}
function showSearchBar() {
  document.getElementById('files-global-search-bar').style.visibility = 'visible'
  const inputElement = document.getElementsByClassName('oc-search-input')[0] as HTMLElement
  inputElement.focus()

  showCancelButton.value = true
}
function cancelSearch() {
  document.getElementById('files-global-search-bar').style.visibility = 'hidden'
  showCancelButton.value = false
}
function hideOptionsDrop() {
  unref(optionsDrop)?.hide()
}

const fullTextSearchEnabled = computed(() => capabilityStore.searchContent?.enabled)

const listProviderAvailable = computed(() => unref(availableProviders).some((p) => !!p.listSearch))

const locationFilterAvailable = computed(() =>
  // FIXME: use capability as soon as we have one
  unref(availableProviders).some((p) => !!p.listSearch)
)

watch(isMobileWidth, () => {
  const searchBarEl = document.getElementById('files-global-search-bar')
  if (!searchBarEl) {
    return
  }

  const optionDropVisible = !!document.querySelector('.tippy-box[data-state="visible"]')

  if (!unref(isMobileWidth)) {
    searchBarEl.style.visibility = 'visible'
    showCancelButton.value = false
  } else {
    if (optionDropVisible) {
      searchBarEl.style.visibility = 'visible'
      showCancelButton.value = true
    } else {
      searchBarEl.style.visibility = 'hidden'
      showCancelButton.value = false
    }
  }
})

const optionsDrop = computed(() => {
  return unref(optionsDropRef)
})

const scope = computed(() => {
  if (unref(currentFolderAvailable) && unref(currentFolder)?.fileId) {
    return unref(currentFolder).fileId
  }

  return queryItemAsString(unref(scopeQueryValue))
})

const useScope = computed(() => {
  return (
    unref(currentFolderAvailable) &&
    unref(locationFilterId) === SearchLocationFilterConstants.currentFolder
  )
})

const search = async () => {
  searchResults.value = []
  if (!unref(term)) {
    return
  }

  const terms: string[] = []

  let nameQuery = `name:"*${unref(term)}*"`
  if (unref(fullTextSearchEnabled)) {
    nameQuery = `(name:"*${unref(term)}*" OR content:"${unref(term)}")`
  }

  terms.push(nameQuery)

  if (unref(useScope)) {
    terms.push(`scope:${unref(scope)}`)
  }

  loading.value = true

  for (const availableProvider of unref(availableProviders)) {
    if (availableProvider.previewSearch?.available) {
      searchResults.value.push({
        providerId: availableProvider.id,
        result: await availableProvider.previewSearch.search(terms.join(' '))
      })
    }
  }
  loading.value = false
}

const onKeyUpEnter = () => {
  if (!unref(listProviderAvailable)) {
    return
  }

  if (unref(optionsDrop)) {
    unref(optionsDrop)?.hide()
  }

  if (unref(activePreviewIndex) === null) {
    router.push(getSearchResultLocation('files.sdk'))
  }
  if (unref(activePreviewIndex) !== null) {
    unref(optionsDrop)
      ?.$el.querySelectorAll('.preview')
      [unref(activePreviewIndex)].firstChild.click()
  }
}

const getSearchResultLocation = (providerId: string) => {
  const currentQuery = unref(router.currentRoute).query

  return createLocationCommon('files-common-search', {
    query: {
      ...(currentQuery && { ...currentQuery }),
      term: unref(term),
      ...(unref(scope) && { scope: unref(scope) }),
      useScope: unref(useScope).toString(),
      provider: providerId
    }
  })
}

const onLocationFilterChange = (event: { value: { id: string } }) => {
  locationFilterId.value = event.value.id
  if (isLocationCommonActive(router, 'files-common-search')) {
    onKeyUpEnter()
    return
  }

  if (!unref(term)) {
    return
  }
  search()
}

const showPreview = async () => {
  if (!unref(term)) {
    return
  }
  unref(optionsDrop)?.show()
  await search()
}

const updateTerm = (input: string) => {
  restoreSearchFromRoute.value = false
  term.value = input
  if (!unref(term)) {
    return unref(optionsDrop)?.hide()
  }
  return unref(optionsDrop)?.show()
}

const debouncedSearch = debounce(search, 500)

watch(term, () => {
  if (unref(restoreSearchFromRoute)) {
    restoreSearchFromRoute.value = false
    return
  }
  debouncedSearch()
})
watch(
  searchResults,
  () => {
    activePreviewIndex.value = null

    nextTick(() => {
      if (unref(showNoResults)) {
        return
      }
      if (unref(optionsDrop)) {
        markInstance.value = new Mark(unref(optionsDrop).$el as HTMLElement)
        markInstance.value.unmark()
        markInstance.value.mark(unref(term), {
          element: 'span',
          className: 'mark-highlight',
          exclude: ['.provider-details *']
        })
      }
    })
  },
  { deep: true }
)

watch(
  () => route.value,
  (r) => {
    parseRouteQuery(r)
  },
  { immediate: false }
)

const showDrop = computed(() => {
  return unref(availableProviders).some((provider) => provider?.previewSearch?.available === true)
})
const showNoResults = computed(() => {
  return unref(searchResults).every(({ result }) => !result.values.length)
})

const isSearchBarEnabled = computed(() => {
  /**
   * We don't show the search provider in public link context,
   * since we are not able to provide search in the public link yet.
   * Enable as soon this feature is available.
   */
  return (
    unref(availableProviders).length && unref(userContextReady) && !unref(publicLinkContextReady)
  )
})
const displayProviders = computed(() => {
  /**
   * Computed to filter and sort providers that will be displayed
   * Only show providers which actually hold results
   */
  return unref(availableProviders).filter(
    (provider) => getSearchResultForProvider(provider).values.length
  )
})
const searchLabel = computed(() => {
  return $gettext('Enter search term')
})

function created() {
  clearTermEvent.value = eventBus.subscribe('app.search.term.clear', () => {
    term.value = ''
  })
  parseRouteQuery(route.value, true)
}

created()

onBeforeUnmount(() => {
  eventBus.unsubscribe('app.search.term.clear', clearTermEvent.value)
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
      z-index: 9;

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

    @media (max-width: 969px) {
      width: 300px;
    }

    @media (max-width: 639px) {
      width: 93vw !important;
    }

    ul {
      li.provider-details,
      li.loading,
      li#no-results {
        padding: var(--oc-space-xsmall) var(--oc-space-small);
      }

      li {
        position: relative;
        font-size: var(--oc-font-size-small);

        &.provider-details {
          font-size: var(--oc-font-size-xsmall);
        }

        &.preview {
          min-height: 44px;
          font-size: inherit;
          padding: var(--oc-space-xsmall) var(--oc-space-small);

          &:hover,
          &.active {
            background-color: var(--oc-color-background-highlight);
          }

          &.disabled {
            background-color: var(--oc-color-background-muted);
            pointer-events: none;
            opacity: 0.7;
            filter: grayscale(0.6);
          }
        }
      }
    }
  }
}
</style>
