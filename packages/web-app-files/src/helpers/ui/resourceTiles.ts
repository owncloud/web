import { SortDir, SortField } from '../../composables/sort'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

export const sortFields: SortField[] = [
  {
    label: $gettext('A-Z'),
    name: 'name',
    sortable: true,
    sortDir: SortDir.Asc
  },
  {
    label: $gettext('Z-A'),
    name: 'name',
    sortable: true,
    sortDir: SortDir.Desc
  },
  {
    label: $gettext('Newest'),
    name: 'mdate',
    sortable: (date) => new Date(date).valueOf(),
    sortDir: SortDir.Desc
  },
  {
    label: $gettext('Oldest'),
    name: 'mdate',
    sortable: (date) => new Date(date).valueOf(),
    sortDir: SortDir.Asc
  },
  {
    label: $gettext('Largest'),
    name: 'size',
    sortable: true,
    sortDir: SortDir.Desc
  },
  {
    label: $gettext('Smallest'),
    name: 'size',
    sortable: true,
    sortDir: SortDir.Asc
  }
]

export const determineSortFields = (firstResource): SortField[] => {
  if (!firstResource) {
    return []
  }

  return sortFields.filter((field) =>
    Object.prototype.hasOwnProperty.call(firstResource, field.name)
  )
}
