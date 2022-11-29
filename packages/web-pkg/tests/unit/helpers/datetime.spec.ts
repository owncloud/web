
import { DateTime } from 'luxon'
import { formatDateFromDateTime, formatDateFromJSDate, formatDateFromHTTP, formatDateFromISO, formatDateFromRFC, formatRelativeDateFromDateTime } from '../../../src/helpers'

fdescribe('datetime', () => {	
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
		])('invalid input "%s"', (date: Date, currentLanguage: string, format: any, expected: string) => {
			expect(formatDateFromJSDate(date, currentLanguage, format)).toBe(expected)
		})
	})
	describe('formatDateFromHTTP', () => {
		fit.each([
			["Tue, 15 Nov 1994 12:45:26 GMT", 'de', DateTime.DATETIME_MED, '15. Nov. 1994, 13:45'],
		])('invalid input "%s"', (date: string, currentLanguage: string, format: any, expected: string) => {
			expect(formatDateFromHTTP(date, currentLanguage, format)).toBe(expected)
		})
	})
	describe('formatDateFromISO', () => {
		fit.each([
			["2010-10-22T21:38:00", 'de', DateTime.DATETIME_MED, '22. Okt. 2010, 21:38'],
		])('invalid input "%s"', (date: string, currentLanguage: string, format: any, expected: string) => {
			expect(formatDateFromISO(date, currentLanguage, format)).toBe(expected)
		})
	})
	describe('formatDateFromRFC', () => {
		fit.each([
			["01 Jun 2016 14:31:46 -0700", 'de', DateTime.DATETIME_MED, '1. Juni 2016, 23:31'],
		])('invalid input "%s"', (date: string, currentLanguage: string, format: any, expected: string) => {
			expect(formatDateFromRFC(date, currentLanguage, format)).toBe(expected)
		})
	})
	describe('formatRelativeDateFromDateTime', () => {
		fit.each([
			[DateTime.now().minus({years: 12}), 'de', 'vor 12 Jahren'],
		])('invalid input "%s"', (date: string, currentLanguage: string, expected) => {
			expect(formatRelativeDateFromDateTime(date, currentLanguage)).toBe(expected)
		})
	})
})
