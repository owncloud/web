import { DateTime, Settings } from 'luxon'
import {
  formatDateFromDateTime,
  formatDateFromJSDate,
  formatDateFromHTTP,
  formatDateFromISO,
  formatDateFromRFC,
  formatRelativeDateFromDateTime,
  formatRelativeDateFromJSDate,
  formatRelativeDateFromISO,
  formatRelativeDateFromRFC
} from 'web-pkg'

describe('datetime helper', () => {
  const language = 'en'
  const dateFormat = DateTime.DATETIME_MED
  beforeEach(() => {
    Settings.defaultZone = 'utc'
  })
  describe('formatDateFromDateTime', () => {
    it.each([[DateTime.fromISO('2010-10-22T21:38:00'), 'Oct 22, 2010, 9:38 PM']])(
      'correct output for %s',
      (date: DateTime, expected: string) => {
        expect(formatDateFromDateTime(date, language, dateFormat)).toBe(expected)
      }
    )
  })
  describe('formatDateFromJSDate', () => {
    it.each([[new Date('2010-10-22T21:38:00'), 'Oct 22, 2010, 9:38 PM']])(
      'correct output for %s',
      (date: Date, expected: string) => {
        expect(formatDateFromJSDate(date, language, dateFormat)).toBe(expected)
      }
    )
  })
  describe('formatDateFromHTTP', () => {
    it.each([['Tue, 15 Nov 1994 12:45:26 GMT', 'Nov 15, 1994, 12:45 PM']])(
      'correct output for %s',
      (date: string, expected: string) => {
        expect(formatDateFromHTTP(date, language, dateFormat)).toBe(expected)
      }
    )
  })
  describe('formatDateFromISO', () => {
    it.each([['2010-10-22T21:38:00', 'Oct 22, 2010, 9:38 PM']])(
      'correct output for %s',
      (date: string, expected: string) => {
        expect(formatDateFromISO(date, language, dateFormat)).toBe(expected)
      }
    )
  })
  describe('formatDateFromRFC', () => {
    it.each([['01 Jun 2016 14:31:46 -0700', 'Jun 1, 2016, 9:31 PM']])(
      'correct output for %s',
      (date: string, expected: string) => {
        expect(formatDateFromRFC(date, language, dateFormat)).toBe(expected)
      }
    )
  })
  describe('formatRelativeDateFromDateTime', () => {
    it.each([[DateTime.now().minus({ years: 12 }), '12 years ago']])(
      'correct relative time for %s',
      (date: DateTime, expected) => {
        expect(formatRelativeDateFromDateTime(date, language)).toBe(expected)
      }
    )
  })
  describe('formatRelativeDateFromJSDate', () => {
    it.each([[DateTime.now().minus({ years: 12 }).toJSDate(), '12 years ago']])(
      'correct relative time for %s',
      (date: Date, expected) => {
        expect(formatRelativeDateFromJSDate(date, language)).toBe(expected)
      }
    )
  })
  describe('formatRelativeDateFromISO', () => {
    it.each([[DateTime.now().minus({ years: 12 }).toISO(), '12 years ago']])(
      'correct relative time for %s',
      (date: string, expected) => {
        expect(formatRelativeDateFromISO(date, language)).toBe(expected)
      }
    )
  })
  describe('formatRelativeDateFromRFC', () => {
    it.each([[DateTime.now().minus({ years: 12 }).toRFC2822(), '12 years ago']])(
      'correct relative time for %s',
      (date: string, expected) => {
        expect(formatRelativeDateFromRFC(date, language)).toBe(expected)
      }
    )
  })
})
