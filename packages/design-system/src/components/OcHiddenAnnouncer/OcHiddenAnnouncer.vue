<template>
  <span
    :id="id"
    class="oc-invisible-sr oc-hidden-announcer"
    :aria-live="level"
    aria-atomic="true"
    v-text="announcement"
  />
</template>

<script>
/**
 * Live regions for screen reader announcements
 *
 * ## Accessibility
 *
 * Screen reader software detect **dynamic** changes in regions registered as live regions (elements with attributes like `aria-live="polite"`, `aria-live="assertive"`). So when using this component or live regions in general make sure that the region already exists in the DOM and assistive technology can subscribe to its changes. [MDN explainer](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions):
 *
 * > Using JavaScript, it is possible to dynamically change parts of a page without requiring the entire page to reload — for instance, to update a list of search results on the fly, or to display a discreet alert or notification which does not require user interaction. While these changes are usually visually apparent to users who can see the page, they may not be obvious to users of assistive technologies. ARIA live regions fill this gap and provide a way to programmatically expose dynamic content changes in a way that can be announced by assistive technologies.
 *
 * ## Debugging
 *
 * Debug live regions without starting a screen reader using [NerdeRegion](https://chrome.google.com/webstore/detail/nerderegion/lkcampbojgmgobcfinlkgkodlnlpjieb).
 */
export default {
  name: 'OcHiddenAnnouncer',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * `polite` adds the announcement to the screen reader speech queue at the end, `assertive` forces it to output directly, `off` disables the live region
     **/
    level: {
      type: String,
      required: false,
      default: 'polite',
      validator: (value) => {
        return value.match(/(polite|assertive|off)/)
      }
    },
    /**
     * The announcement text itself.
     **/
    announcement: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // Generate id for compatibility reasons
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
  }
}
</script>

<docs>
```js
<template>
  <div>
    <h3 class="oc-heading-divider">
      Hidden announcer (please inspect element)
    </h3>
    <button @click="announce">Announce</button>
    <oc-hidden-announcer level="polite" :announcement="announcement" />
  </div>
</template>
<script>
  export default {
    data: () => {
      return {
        announcement: '',
        announcementOnComplete: 'Upload has finished'
      }
    },
    methods: {
      announce() {
        this.announcement = this.announcementOnComplete
      }
    }
  }
</script>
```
</docs>
