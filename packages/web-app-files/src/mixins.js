import { DateTime } from 'luxon'

export default {
  filters: {
    roundNumber(int) {
      return parseInt(int.toFixed(0))
    }
  },
  methods: {
    formDateFromJSDate(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromJSDate(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formDateFromHTTP(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromHTTP(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formDateFromISO(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromISO(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formDateFromRFC(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromRFC2822(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formRelativeDateFromJSDate(date) {
      return DateTime.fromJSDate(date).setLocale(this.$language.current).toRelative()
    },
    formRelativeDateFromHTTP(date) {
      return DateTime.fromHTTP(date).setLocale(this.$language.current).toRelative()
    },
    formRelativeDateFromISO(date) {
      return DateTime.fromISO(date).setLocale(this.$language.current).toRelative()
    },
    formRelativeDateFromRFC(date) {
      return DateTime.fromRFC2822(date).setLocale(this.$language.current).toRelative()
    },
    delayForScreenreader(func, delay = 500) {
      /*
       * Delay for screen readers Virtual buffers
       */
      setTimeout(() => func(), delay)
    }
  }
}
