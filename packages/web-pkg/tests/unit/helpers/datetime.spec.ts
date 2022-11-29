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
} from '../../../src/helpers'

describe('datetime helper', () => {
  beforeEach(() => {
    Settings.defaultZone = 'utc'
  })
  describe('formatDateFromDateTime', () => {
    it.each([
      [
        DateTime.fromISO('2010-10-22T21:38:00'),
        'de',
        DateTime.DATETIME_MED,
        '22. Okt. 2010, 21:38'
      ],
      [
        DateTime.fromISO('2010-10-22T21:38:00'),
        'en',
        DateTime.DATETIME_MED,
        'Oct 22, 2010, 9:38 PM'
      ],
      [DateTime.fromISO('2010-10-22T21:38:00'), 'fr', DateTime.DATETIME_MED, '22 oct. 2010, 21:38'],
      [DateTime.fromISO('2010-10-22T21:38:00'), 'it', DateTime.DATETIME_MED, '22 ott 2010, 21:38']
    ])(
      'invalid input "%s"',
      (date: DateTime, currentLanguage: string, format: any, expected: string) => {
        expect(formatDateFromDateTime(date, currentLanguage, format)).toBe(expected)
      }
    )
  })
  describe('formatDateFromJSDate', () => {
    it.each([
      [new Date('2010-10-22T21:38:00'), 'de', DateTime.DATETIME_MED, '22. Okt. 2010, 21:38']
    ])(
      'invalid input "%s"',
      (date: Date, currentLanguage: string, format: any, expected: string) => {
        expect(formatDateFromJSDate(date, currentLanguage, format)).toBe(expected)
      }
    )
  })
  describe('formatDateFromHTTP', () => {
    it.each([
      ['Tue, 15 Nov 1994 12:45:26 GMT', 'de', DateTime.DATETIME_MED, '15. Nov. 1994, 12:45']
    ])(
      'invalid input "%s"',
      (date: string, currentLanguage: string, format: any, expected: string) => {
        expect(formatDateFromHTTP(date, currentLanguage, format)).toBe(expected)
      }
    )
  })
  describe('formatDateFromISO', () => {
    it.each([['2010-10-22T21:38:00', 'de', DateTime.DATETIME_MED, '22. Okt. 2010, 21:38']])(
      'invalid input "%s"',
      (date: string, currentLanguage: string, format: any, expected: string) => {
        expect(formatDateFromISO(date, currentLanguage, format)).toBe(expected)
      }
    )
  })
  describe('formatDateFromRFC', () => {
    it.each([['01 Jun 2016 14:31:46 -0700', 'de', DateTime.DATETIME_MED, '1. Juni 2016, 21:31']])(
      'invalid input "%s"',
      (date: string, currentLanguage: string, format: any, expected: string) => {
        expect(formatDateFromRFC(date, currentLanguage, format)).toBe(expected)
      }
    )
  })
  describe('formatRelativeDateFromDateTime', () => {
    it.each([
      [DateTime.now().minus({ years: 12 }), 'de', 'vor 12 Jahren'],
      [DateTime.now().minus({ years: 12 }), 'en', '12 years ago'],
      [DateTime.now().minus({ years: 12 }), 'it', '12 anni fa']
    ])('invalid input "%s"', (date: DateTime, currentLanguage: string, expected) => {
      expect(formatRelativeDateFromDateTime(date, currentLanguage)).toBe(expected)
    })
  })
  describe('formatRelativeDateFromJSDate', () => {
    it.each([[DateTime.now().minus({ years: 12 }).toJSDate(), 'de', 'vor 12 Jahren']])(
      'invalid input "%s"',
      (date: Date, currentLanguage: string, expected) => {
        expect(formatRelativeDateFromJSDate(date, currentLanguage)).toBe(expected)
      }
    )
  })
  describe('formatRelativeDateFromISO', () => {
    it.each([[DateTime.now().minus({ years: 12 }).toISO(), 'de', 'vor 12 Jahren']])(
      'invalid input "%s"',
      (date: string, currentLanguage: string, expected) => {
        expect(formatRelativeDateFromISO(date, currentLanguage)).toBe(expected)
      }
    )
  })
  describe('formatRelativeDateFromRFC', () => {
    it.each([[DateTime.now().minus({ years: 12 }).toRFC2822(), 'de', 'vor 12 Jahren']])(
      'invalid input "%s"',
      (date: string, currentLanguage: string, expected) => {
        expect(formatRelativeDateFromRFC(date, currentLanguage)).toBe(expected)
      }
    )
  })
})
