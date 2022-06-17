import Shepherd from 'shepherd.js'
import { $gettext } from 'files/src/router/utils'

export const loadTours = async (locations = []) => {
  const tours = []
  for (const l of locations) {
    if (l.split('.').pop() === 'json') {
      try {
        const response = await fetch(l)
        if (response.ok) {
          const tour = await response.json()
          tours.push(tour)
        }
      } catch (e) {
        console.error(`Failed to load tours '${l}' is not a valid json file.`)
      }
    }
  }
  return { tours }
}
/* autostarts the first tour of the tours array with autostart property if the current location matches tour settings for autostart */
export function autostartTours(tourInfos, location) {
  const autostartTours = tourInfos.filter((t) => t.autostart?.location === location)
  if (autostartTours[0]) {
    const t = autostartTours[0]
    setTimeout(() => {
      if (!(localStorage.getItem('tours/' + t.tourId) && location === t.autostart.location)) {
        createTranslatedTour(t).start()
        localStorage.setItem('tours/' + t.tourId, Date.now())
      }
    }, t.autostart.timeout)
  }
}

export function createTranslatedTourInfos(tours) {
  const createdTourInfos = {}
  tours.forEach((t) => {
    Object.keys(t.translations).forEach((language) => {
      const translatedTour = {
        tourName: t.translations[language].tourName,
        confirmCancel: t.confirmCancel,
        confirmCancelMessage: t.confirmCancelMessage,
        classPrefix: t.classPrefix,
        exitOnEsc: t.exitOnEsc,
        useModalOverlay: t.useModalOverlay === true,
        tooltip: t.translations[language].tooltip,
        defaultStepOptions: {
          ...(t.defaultStepOptions?.cancelIcon && {
            cancelIcon: {
              enabled: t.defaultStepOptions?.cancelIcon || false
            }
          }),
          ...(t.defaultStepOptions?.classes && { classes: t.defaultStepOptions?.classes }),
          ...(t.defaultStepOptions?.scrollTo && { scrollTo: t.defaultStepOptions.scrollTo })
        }
      }
      translatedTour.steps = []
      t.translations[language].steps.forEach((s, j) => {
        const buttons = addButtons(s.buttons, s.learnMoreLink)
        translatedTour.steps.push({
          title: s.title,
          text: s.text,
          buttons: buttons,
          id: j
        })
      })
      translatedTour.tourId = t.tourId
      translatedTour.autostart = t.autostart
      translatedTour.allowedLocations = t.allowedLocations
      translatedTour.deniedLocations = t.deniedLocations
      translatedTour.defaultLanguage = t.defaultLanguage

      if (!createdTourInfos[language]) createdTourInfos[language] = []
      createdTourInfos[language].push(translatedTour)
    })
  })
  return createdTourInfos
}

export function createTranslatedTour(tourInfo) {
  const tour = new Shepherd.Tour({
    tourName: tourInfo.tourName,
    confirmCancel: tourInfo.confirmCancel,
    confirmCancelMessage: tourInfo.confirmCancelMessage,
    classPrefix: tourInfo.classPrefix,
    exitOnEsc: tourInfo.exitOnEsc,
    useModalOverlay: tourInfo.useModalOverlay === true,
    tooltip: tourInfo.tooltip,
    defaultStepOptions: {
      ...(tourInfo.defaultStepOptions?.cancelIcon && {
        cancelIcon: {
          enabled: tourInfo.defaultStepOptions?.cancelIcon || false
        }
      }),
      ...(tourInfo.defaultStepOptions?.classes && {
        classes: tourInfo.defaultStepOptions?.classes
      }),
      ...(tourInfo.defaultStepOptions?.scrollTo && {
        scrollTo: tourInfo.defaultStepOptions.scrollTo
      })
    }
  })

  tourInfo.steps.forEach((s, j) => {
    const buttons = s.buttons

    tour.addStep({
      title: s.title,
      text: s.text,
      buttons: buttons,
      id: j
    })
  })
  tour.tourId = tourInfo.tourId
  tour.autostart = tourInfo.autostart
  tour.allowedLocations = tourInfo.allowedLocations
  tour.deniedLocations = tourInfo.deniedLocations
  tour.defaultLanguage = tourInfo.defaultLanguage

  return tour
}

function addButtons(buttons, learnMoreLink) {
  const actionButtons = []

  learnMoreLink &&
    actionButtons.push({
      action() {
        return window.open(learnMoreLink, '_blank').focus()
      },
      classes: 'oc-button oc-button-m oc-button-passive',
      text: $gettext('Learn more'),
      secondary: true
    })

  if (buttons.includes('back'))
    actionButtons.push({
      action() {
        return this.back()
      },
      classes: 'oc-button oc-button-m oc-button-passive',
      text: $gettext('Back'),
      secondary: true
    })

  if (buttons.includes('next'))
    actionButtons.push({
      action() {
        /* console.log(
          Shepherd.activeTour.steps[
            Shepherd.activeTour.steps.indexOf(Shepherd.activeTour.getCurrentStep()) + 1
          ],
          Shepherd.activeTour.steps
        ) */
        return this.next()
      },
      classes: 'oc-button oc-button-m oc-button-primary',
      text: $gettext('Next')
    })

  return actionButtons
}
