/**
 * This is ownCloud Design System’s JS helper file for docs.
 * You can add more things if/when needed.
 */
import activeNav from './utils/activeNav'
import filterSearch from './utils/filterSearch'

document.addEventListener('DOMContentLoaded', () => {
  filterSearch.methods.init()
  activeNav.methods.init()
})

window.addEventListener('hashchange', () => {
  filterSearch.methods.init()
  activeNav.methods.init()
})
