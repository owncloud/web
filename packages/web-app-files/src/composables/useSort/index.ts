import { ref, computed, ComputedRef, unref } from '@vue/composition-api'
import { MaybeRef, MaybeReadonlyRef } from '../utils'

export enum SortDir {
  Desc = 'desc',
  Asc = 'asc'
}

interface SortField {
  name: MaybeRef<string>
  // eslint-disable-next-line @typescript-eslint/ban-types
  sortable?: MaybeRef<boolean | Function>
  sortDir?: MaybeRef<string>
}

interface SortOptions<T> {
  items: MaybeReadonlyRef<Array<T>>
  fields: MaybeRef<Array<SortField>>
  sortBy?: MaybeRef<string>
  sortDir?: MaybeRef<SortDir>
}

interface SortResult<T> {
  items: ComputedRef<Array<T>>
  sortBy: ComputedRef<string>
  sortDir: ComputedRef<SortDir>
  // eslint-disable-next-line @typescript-eslint/ban-types
  handleSort: Function
}

export function useSort<T>(options: SortOptions<T>): SortResult<T> {
  const sortByRef = ref(options.sortBy)
  const sortDirRef = ref(options.sortDir)

  const sortBy = computed(() => unref(sortByRef) || firstSortableField(unref(fields)))
  const sortDir = computed(
    () => unref(sortDirRef) || defaultSortDirection(unref(sortBy), unref(fields))
  )
  const fields = options.fields

  const items = computed<Array<T>>(() => {
    if (!unref(sortBy)) {
      return options.items
    }
    return sortHelper(unref(options.items), unref(fields), unref(sortBy), unref(sortDir))
  })

  const handleSort = ({ sortBy, sortDir }) => {
    sortByRef.value = sortBy
    sortDirRef.value = sortDir
  }

  return {
    items,
    sortBy,
    sortDir,
    handleSort
  }
}

const firstSortableField = (fields) => {
  const sortableFields = fields.filter((f) => f.sortable).map((f) => f.name)
  if (sortableFields) {
    return sortableFields[0]
  }
  return null
}

const defaultSortDirection = (name, fields) => {
  const sortField = fields.find((f) => f.name === name)
  if (sortField && sortField.sortDir) {
    return sortField.sortDir
  }
  return SortDir.Desc
}

const sortHelper = (items, fields, sortBy, sortDir) => {
  const field = fields.find((f) => f.name === sortBy)
  if (!field) {
    return items
  }
  const { sortable } = field

  if (sortBy === 'name') {
    const folders = [...items.filter((i) => i.type === 'folder')].sort((a, b) =>
      compare(a, b, sortBy, sortDir, sortable)
    )
    const files = [...items.filter((i) => i.type !== 'folder')].sort((a, b) =>
      compare(a, b, sortBy, sortDir, sortable)
    )
    if (sortDir === SortDir.Asc) {
      return folders.concat(files)
    }
    return files.concat(folders)
  }
  return [...items].sort((a, b) => compare(a, b, sortBy, sortDir, sortable))
}

const compare = (a, b, sortBy, sortDir, sortable) => {
  let aValue = a[sortBy]
  let bValue = b[sortBy]
  const modifier = sortDir === SortDir.Asc ? 1 : -1

  if (sortable) {
    if (typeof sortable === 'string') {
      const genArrComp = (vals) => {
        return vals.map((val) => val[sortable]).join('')
      }

      aValue = genArrComp(aValue)
      bValue = genArrComp(bValue)
    } else if (typeof sortable === 'function') {
      aValue = sortable(aValue)
      bValue = sortable(bValue)
    }
  }

  if (!isNaN(aValue) && !isNaN(bValue)) {
    return (aValue - bValue) * modifier
  }
  const userLang = navigator.language // FIXME: ts error: || navigator.userLanguage
  const compare = aValue
    .toString()
    .localeCompare(bValue.toString(), userLang, { sensitivity: 'base' })
  return compare * modifier
}
