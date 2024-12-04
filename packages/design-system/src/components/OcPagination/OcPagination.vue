<template>
  <nav class="oc-pagination" :aria-label="$gettext('Pagination')">
    <ol class="oc-pagination-list">
      <li v-if="isPrevPageAvailable" class="oc-pagination-list-item">
        <router-link
          class="oc-pagination-list-item-prev"
          :aria-label="$gettext('Go to the previous page')"
          :to="previousPageLink"
        >
          <oc-icon name="arrow-drop-left" fill-type="line" />
        </router-link>
      </li>
      <li v-for="(page, index) in displayedPages" :key="index" class="oc-pagination-list-item">
        <component :is="pageComponent(page)" :class="pageClass(page)" v-bind="bindPageProps(page)">
          {{ page }}
        </component>
      </li>
      <li v-if="isNextPageAvailable" class="oc-pagination-list-item">
        <router-link
          class="oc-pagination-list-item-next"
          :aria-label="$gettext('Go to the next page')"
          :to="nextPageLink"
        >
          <oc-icon name="arrow-drop-right" fill-type="line" />
        </router-link>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'

type Page = string | number

/**
 * A list of links used for switching to different pages
 */
export default defineComponent({
  name: 'OcPagination',
  status: 'ready',
  release: '7.2.0',

  components: { OcIcon },

  props: {
    /**
     * Number of pages to be displayed
     */
    pages: {
      type: Number,
      required: true
    },
    /**
     * Currently active page
     */
    currentPage: {
      type: Number,
      required: true
    },
    /**
     * Number of pages to be displayed. It is required to use an odd number.
     * Pages will be equally split into two parts around the current page and remaining pages will be displayed as ellipsis
     */
    maxDisplayed: {
      type: Number,
      required: false,
      default: null,
      validator: (value: number) => {
        if (value % 2 === 0) {
          // Since Vue doesn't support custom validator error message, log the error manually
          console.error('maxDisplayed needs to be an odd number')

          return false
        }

        return true
      }
    },
    /**
     * Current route which is used to render pages
     */
    currentRoute: {
      type: Object,
      required: true
    }
  },

  computed: {
    displayedPages() {
      let pages: Array<Page> = []

      for (let i = 0; i < this.pages; i++) {
        pages.push(i + 1)
      }

      if (this.maxDisplayed && this.maxDisplayed + 1 < this.pages) {
        const currentPageIndex = this.$_currentPage - 1
        const indentation = Math.floor(this.maxDisplayed / 2)

        pages = pages.slice(
          Math.max(0, currentPageIndex - indentation),
          currentPageIndex + indentation + 1
        )

        if (this.$_currentPage > 2) {
          Number(pages[0]) > 2 ? pages.unshift(1, '...') : pages.unshift(1)
        }

        if (this.$_currentPage < this.pages - 1) {
          Number(pages[pages.length - 1]) < this.pages - 1
            ? pages.push('...', this.pages)
            : pages.push(this.pages)
        }

        return pages
      }

      return pages
    },

    isPrevPageAvailable() {
      return this.$_currentPage > 1
    },

    isNextPageAvailable() {
      return this.$_currentPage < this.pages
    },

    previousPageLink() {
      return this.bindPageLink(this.$_currentPage - 1)
    },

    nextPageLink() {
      return this.bindPageLink(this.$_currentPage + 1)
    },

    $_currentPage() {
      return Math.max(1, Math.min(this.currentPage, this.pages))
    }
  },

  methods: {
    pageLabel(page: Page) {
      return this.$gettext('Go to page %{ page }', { page: page.toString() })
    },

    isCurrentPage(page: Page) {
      return this.$_currentPage === page
    },

    pageComponent(page: Page) {
      return page === '...' || this.isCurrentPage(page) ? 'span' : 'router-link'
    },

    bindPageProps(page: Page) {
      if (page === '...') {
        return
      }

      if (this.isCurrentPage(page)) {
        return {
          'aria-current': 'page'
        }
      }

      const link = this.bindPageLink(page)

      return {
        'aria-label': this.pageLabel(page),
        to: link
      }
    },

    pageClass(page: Page) {
      const classes = ['oc-pagination-list-item-page']

      if (this.isCurrentPage(page)) {
        classes.push('oc-pagination-list-item-current')
      } else if (page === '...') {
        classes.push('oc-pagination-list-item-ellipsis')
      } else {
        classes.push('oc-pagination-list-item-link')
      }

      return classes
    },

    bindPageLink(page: Page) {
      return {
        name: this.currentRoute.name,
        query: { ...this.currentRoute.query, page },
        params: this.currentRoute.params
      }
    }
  }
})
</script>

<style lang="scss">
.oc-pagination {
  &-list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--oc-space-small);
    list-style: none;
    margin: 0;
    padding: 0;

    &-item {
      &-page {
        border-radius: 4px;
        color: var(--oc-color-onSurface);
        padding: var(--oc-space-xsmall) var(--oc-space-small);
        transition: background-color $transition-duration-short ease-in-out;

        &:not(span):hover {
          background-color: var(--oc-color-swatch-passive-default);
          color: var(--oc-color-inverseOnSurface);
          text-decoration: none;
        }
      }

      &-current {
        background-color: var(--oc-color-swatch-passive-default);
        color: var(--oc-color-inverseOnSurface);
        font-weight: bold;
      }

      &-prev,
      &-next {
        display: flex;

        > .oc-icon > svg {
          fill: var(--oc-color-onSurface);
        }
      }

      &-prev {
        margin-right: var(--oc-space-small);
      }

      &-next {
        margin-left: var(--oc-space-small);
      }
    }
  }
}
</style>

<docs>
## Examples
```js
<div class="oc-flex oc-flex-column" style="gap: 20px;">
    <oc-pagination :pages="3" :currentPage="3" :currentRoute="{ name: 'files' }" />
    <oc-pagination :pages="4" :currentPage="1" :currentRoute="{ name: 'files' }" />
    <oc-pagination :pages="5" :currentPage="3" :currentRoute="{ name: 'files' }" />
</div>
```

### Truncate visible pages with ellipsis
If the current page is close enough to the first or/and last page and ellipsis would hide only 1 page, ellipsis will be omitted and the actual page will be still displayed instead.

```js
<div class="oc-flex oc-flex-column" style="gap: 20px;">
    <oc-pagination :pages="5" :currentPage="3" :maxDisplayed="3" :currentRoute="{ name: 'files' }" />
    <oc-pagination :pages="10" :currentPage="3" :maxDisplayed="3" :currentRoute="{ name: 'files' }" />
    <oc-pagination :pages="54" :currentPage="28" :maxDisplayed="3" :currentRoute="{ name: 'files' }" />
    <oc-pagination :pages="54" :currentPage="51" :maxDisplayed="5" :currentRoute="{ name: 'files' }" />
</div>
```
</docs>
