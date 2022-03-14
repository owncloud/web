import { DateTime } from 'luxon'
import { SortDir, SortField } from '../../composables/sort'

const dateSortValue = (date) => {
  return DateTime.fromRFC2822(date).toUTC().valueOf()
}

export const determineSortFields = (firstResource): SortField[] => {
  if (!firstResource) {
    return []
  }

  return [
    {
      name: 'name',
      sortable: true,
      sortDir: SortDir.Asc
    },
    {
      name: 'size',
      sortable: true,
      sortDir: SortDir.Desc
    },
    {
      name: 'sharedWith',
      sortable: (sharedWith) => {
        if (sharedWith.length > 0) {
          return sharedWith[0].displayName
        }
        return false
      },
      sortDir: SortDir.Asc
    },
    {
      name: 'owner',
      sortable: 'displayName',
      sortDir: SortDir.Asc
    },
    {
      name: 'mdate',
      sortable: (date) => dateSortValue(date),
      sortDir: SortDir.Desc
    },
    {
      name: 'sdate',
      sortable: (date) => dateSortValue(date),
      sortDir: SortDir.Desc
    },
    {
      name: 'ddate',
      sortable: (date) => dateSortValue(date),
      sortDir: SortDir.Desc
    }
  ].filter((field) => Object.prototype.hasOwnProperty.call(firstResource, field.name))
}
