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
          // if there is a user name (at least 2 words) in displayName, bring it to the begin of the array
          const i = sharedWith.findIndex((e) => e.displayName.split(' ').length > 1)
          if (i > 0) {
            let sharedWithSorted = [...sharedWith]
            sharedWithSorted = [...sharedWithSorted.splice(i, 1), sharedWithSorted]
            return sharedWithSorted.map((e) => e.displayName).join()
          }   
          // return sharedWith[0].displayName
          // consider concatenated displaynames for sorting instead of the first one    
          return sharedWith.map((e) => e.displayName).join()
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
