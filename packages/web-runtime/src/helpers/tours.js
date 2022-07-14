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
export async function autostartTours(tourInfos, location, token, userId) {
  const autostartTours = tourInfos.filter((t) => t.autostart?.location === location)
  if (autostartTours[0]) {
    const t = autostartTours[0]

    let autostartDone = false

    if (localStorage.getItem('tours/' + t.tourId)) autostartDone = true
    else if (await isTourAutostartDone(t.tourId, token, userId)) {
      localStorage.setItem('tours/' + t.tourId, 'true')
      autostartDone = true
    }

    // check if autostart not runs already, preference for autostart of the tour exists and location is correct
    if (!Shepherd.activeTour && !autostartDone && location === t.autostart.location) {
      // save preference and start the tour
      saveTourAutostart(t.tourId, token, userId)
        .then(() => {
          setTimeout(() => {
            // save autostart event to local storage to prevent multiple autostarts at opening the app
            if (!(localStorage.getItem('tours/' + t.tourId) && location === t.autostart.location)) {
              createTranslatedTour(t).start()
              localStorage.setItem('tours/' + t.tourId, 'true')
            }
          }, t.autostart.timeout)
        })
        .catch((err) => console.log(err))
    }
  }
}

async function saveTourAutostart(tourId, token, userId) {
  const headers = new Headers()
  headers.append('Authorization', 'Bearer ' + token)
  headers.append('X-Requested-With', 'XMLHttpRequest')

  const formData = new FormData()
  formData.append('key', tourId)
  formData.append('ns', userId)
  formData.append('value', true)
  const response = await fetch('/preferences', {
    method: 'POST',
    headers,
    body: formData
  })

  if (!response.ok) {
    const message = `An error has occured by saving tourAutostart: ${response.status}`
    throw new Error(message)
  }
}

async function isTourAutostartDone(tourId, token, userId) {
  const headers = new Headers()
  headers.append('Authorization', 'Bearer ' + token)
  headers.append('X-Requested-With', 'XMLHttpRequest')

  const response = await fetch(
    '/preferences?' +
      new URLSearchParams({
        key: tourId,
        ns: userId
      }),
    {
      method: 'GET',
      headers
    }
  )

  if (!response.ok) {
    return false
  }

  const data = await response.json()
  return data.value
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
