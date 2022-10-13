<template>
  <div class="oc-flex">
    <oc-button
      v-oc-tooltip="description"
      type="router-link"
      to="/activities"
      appearance="raw"
      variation="inverse"
      :aria-label="$gettext('ownCloud activity feed')"
      aria-describedby="oc-activities-link-description"
    >
      <oc-icon name="calendar-event" />
    </oc-button>
    <p id="oc-activities-link-description" class="oc-invisible-sr" v-text="description" />
  </div>
</template>

<script>
export default {
  name: 'ActivitiesLink',
  computed: {
    description() {
      return this.$gettext('Click to see the latest activities.')
    }
  }
}
</script>
