/**
 * typescript breaks in current setup when importing json, investigate and fix
 * as workaround export it from a js file
 */
import CoreTranslations from '../../l10n/translations.json'
import OdsTranslations from 'owncloud-design-system/dist/system/translations.json'

export const coreTranslations = CoreTranslations
export const odsTranslations = OdsTranslations
