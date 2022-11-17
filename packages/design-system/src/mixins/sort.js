import { EVENT_THEAD_CLICKED } from '../helpers/constants'

const SORT_DIRECTION_ASC = 'asc'
const SORT_DIRECTION_DESC = 'desc'

export default {
  props: {
    /**
     * Show that the table is sorted by this column (no actual sorting takes place)
     */
    sortBy: {
      type: String,
      required: false
    },

    /**
     * Show that the table is sorted ascendingly/descendingly (no actual sorting takes place)
     */
    sortDir: {
      type: String,
      required: false,
      default: undefined,
      validator: (value) => {
        return value === undefined || [SORT_DIRECTION_ASC, SORT_DIRECTION_DESC].includes(value)
      }
    }
  },
  created() {
    if (this.isSortable) {
      this.$on(EVENT_THEAD_CLICKED, this.handleSort)
    }
  },
  computed: {
    isSortable() {
      return this.fields.some((f) => f.sortable)
    }
  },
  methods: {
    extractSortThProps(props, field) {
      if (!this.fieldIsSortable(field)) {
        return
      }

      let sort = 'none'
      if (this.sortBy === field.name) {
        sort = this.sortDir === SORT_DIRECTION_ASC ? 'ascending' : 'descending'
      }
      props['aria-sort'] = sort
    },
    fieldIsSortable({ sortable }) {
      return !!sortable
    },
    handleSort(field) {
      if (!this.fieldIsSortable(field)) {
        return
      }

      let sortDir = this.sortDir
      // toggle sortDir if already sorted by this column
      if (this.sortBy === field.name && this.sortDir !== undefined) {
        sortDir = this.sortDir === SORT_DIRECTION_DESC ? SORT_DIRECTION_ASC : SORT_DIRECTION_DESC
      }
      // set default sortDir of the field when sortDir not set or sortBy changed
      if (this.sortBy !== field.name || this.sortDir === undefined) {
        sortDir = field.sortDir || SORT_DIRECTION_DESC
      }

      /**
       * Triggers when table heads are clicked
       *
       * @property {string} sortBy requested column to sort by
       * @property {string} sortDir requested order to sort in (either asc or desc)
       */
      this.$emit('sort', {
        sortBy: field.name,
        sortDir
      })
    }
  }
}
