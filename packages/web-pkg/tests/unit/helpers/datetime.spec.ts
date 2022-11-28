
import { DateTime } from 'luxon'
import { formatDateFromDateTime, formatDateFromJSDate } from '../../../src/helpers'

describe('datetime', () => {	
	describe('formatDateFromDateTime', () => {
		fit.each([
			[DateTime.fromISO("2010-10-22T21:38:00"), 'de', DateTime.DATETIME_MED, '22. Okt. 2010, 21:38'],
			[DateTime.fromISO("2010-10-22T21:38:00"), 'en', DateTime.DATETIME_MED, 'Oct 22, 2010, 9:38 PM'],
			[DateTime.fromISO("2010-10-22T21:38:00"), 'fr', DateTime.DATETIME_MED, '22 oct. 2010, 21:38'],
			[DateTime.fromISO("2010-10-22T21:38:00"), 'it', DateTime.DATETIME_MED, '22 ott 2010, 21:38'],
		])('invalid input "%s"', (date: DateTime, currentLanguage: string, format: any, expected: string) => {
			expect(formatDateFromDateTime(date, currentLanguage, format)).toBe(expected)
		})
	})
	describe('formatDateFromJSDate', () => {
		fit.each([
			[new Date("2010-10-22T21:38:00"), 'de', DateTime.DATETIME_MED, '22. Okt. 2010, 21:38'],
			[new Date("2010-10-22T21:38:00"), 'en', DateTime.DATETIME_MED, 'Oct 22, 2010, 9:38 PM'],
			[new Date("2010-10-22T21:38:00"), 'fr', DateTime.DATETIME_MED, '22 oct. 2010, 21:38'],
			[new Date("2010-10-22T21:38:00"), 'it', DateTime.DATETIME_MED, '22 ott 2010, 21:38'],
		])('invalid input "%s"', (date: Date, currentLanguage: string, format: any, expected: string) => {
			expect(formatDateFromJSDate(date, currentLanguage, format)).toBe(expected)
		})
	})
})
