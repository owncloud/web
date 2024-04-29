/**
 * Web Font Loader takes care of ownCloud Design System’s font loading.
 * For full documentation, see: https://github.com/typekit/webfontloader
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebFont from 'webfontloader'

WebFont.load({
  custom: {
    families: ['Inter'],
    urls: ['/fonts/inter.css']
  }
})
