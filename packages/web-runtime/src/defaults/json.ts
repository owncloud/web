/**
 * typescript breaks in current setup when importing json, investigate and fix
 * as workaround export it from a js file
 */
import CoreTranslations from '../../l10n/translations.json'
import ClientTranslations from 'web-client/l10n/translations.json'
import PkgTranslations from '@ownclouders/web-pkg'
import OdsTranslations from 'design-system/l10n/translations.json'

export const coreTranslations = CoreTranslations
export const clientTranslations = ClientTranslations
export const pkgTranslations = PkgTranslations
export const odsTranslations = OdsTranslations
