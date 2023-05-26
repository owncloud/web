import { computed, Ref, unref } from 'vue'
import { queryItemAsString, useRouteQuery, useRouteQueryPersisted } from 'web-pkg/src'

export const usePagination = (): { currentPage: Ref<number>; itemsPerPage: Ref<number> } => {
  const itemsPerPageQuery = useRouteQueryPersisted({
    name: 'admin-settings-items-per-page',
    defaultValue: '200'
  })
  const pageQuery = useRouteQuery('page', '1')

  const itemsPerPage = computed(() => {
    return parseInt(queryItemAsString(unref(itemsPerPageQuery)))
  })

  const currentPage = computed(() => {
    return parseInt(queryItemAsString(unref(pageQuery)))
  })

  return {
    currentPage,
    itemsPerPage
  }
}
