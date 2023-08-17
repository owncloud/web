<template>
  <div class="oc-flex oc-flex-middle oc-flex-nowrap">
    <oc-datepicker
      v-model="dateCurrent"
      :min-date="dateMin"
      :max-date="dateMax"
      :locale="language.current"
      :is-required="enforced"
      class="files-recipient-expiration-datepicker oc-width-1-1"
      data-testid="recipient-datepicker"
    >
      <template #default="{ togglePopover }">
        <oc-button
          class="files-collaborators-expiration-button oc-p-s action-menu-item"
          data-testid="recipient-datepicker-btn"
          appearance="raw"
          gap-size="none"
          :aria-label="
            dateCurrent ? $gettext('Edit expiration date') : $gettext('Set expiration date')
          "
          @click="togglePopover"
        >
          <oc-icon name="calendar-event" fill-type="line" size="medium" variation="passive" />
          <span
            v-if="!dateCurrent"
            key="no-expiration-date-label"
            v-text="$gettext('Set expiration date')"
          />
          <span
            v-else
            key="set-expiration-date-label"
            v-text="$gettextInterpolate($gettext('Expires %{expires}'), { expires: dateExpire })"
          />
        </oc-button>
      </template>
    </oc-datepicker>
    <oc-button
      v-if="!enforced && dateCurrent"
      class="recipient-edit-expiration-btn-remove"
      appearance="raw"
      :aria-label="$gettext('Remove expiration date')"
      @click="dateCurrent = null"
    >
      <oc-icon name="close" />
    </oc-button>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon'
import { computed, watch, defineComponent, customRef } from 'vue'
import { useStore } from 'web-pkg/src/composables'
import { ShareTypes } from 'web-client/src/helpers/share'
import { formatRelativeDateFromDateTime, getLocaleFromLanguage } from 'web-pkg/src/helpers'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'DateCurrentpicker',
  props: {
    shareTypes: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  emits: ['optionChange'],
  setup(props, { emit }) {
    const language = useGettext()
    const store = useStore()
    const capabilities = computed(() => store.getters.capabilities)
    const optionsUser = computed(() => capabilities.value.files_sharing.user?.expire_date)
    const optionsGroup = computed(() => capabilities.value.files_sharing.group?.expire_date)
    const enforced = computed(() => optionsUser.value?.enforced || optionsGroup.value?.enforced)
    const dateMin = DateTime.now().setLocale(language.current).toJSDate()
    const dateDefault = computed(() => {
      const hasUserCollaborators = props.shareTypes.includes(ShareTypes.user.value)
      const hasGroupCollaborators = props.shareTypes.includes(ShareTypes.group.value)
      const userMaxExpirationDays = parseInt(optionsUser.value?.days)
      const groupMaxExpirationDays = parseInt(optionsGroup.value?.days)

      if (!(optionsUser.value?.enabled || optionsGroup.value?.enabled)) {
        return null
      }

      let days = 0
      if (
        userMaxExpirationDays &&
        hasUserCollaborators &&
        groupMaxExpirationDays &&
        hasGroupCollaborators
      ) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else if (userMaxExpirationDays && hasUserCollaborators) {
        days = userMaxExpirationDays
      } else if (groupMaxExpirationDays && hasGroupCollaborators) {
        days = groupMaxExpirationDays
      }

      if (!days) {
        return null
      }

      return DateTime.now()
        .setLocale(getLocaleFromLanguage(language.current))
        .plus({ days })
        .toJSDate()
    })
    const dateMax = computed(() => (enforced.value ? dateDefault.value : null))
    const dateCurrent = customRef<Date>((track, trigger) => {
      let date = null
      return {
        get() {
          track()
          return date || dateDefault.value
        },
        set(val) {
          date = val
          trigger()
        }
      }
    })
    const dateExpire = computed(() =>
      formatRelativeDateFromDateTime(
        DateTime.fromJSDate(dateCurrent.value).endOf('day'),
        language.current
      )
    )

    watch(dateCurrent, (val) => {
      const dateCurrent = DateTime.fromJSDate(val)
        .setLocale(getLocaleFromLanguage(language.current))
        .endOf('day')
      emit('optionChange', {
        expirationDate: dateCurrent.isValid
          ? dateCurrent.toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ")
          : null
      })
    })

    watch(dateMax, (val) => {
      if (!val || dateCurrent.value < val) {
        return
      }

      dateCurrent.value = val
    })

    return {
      language,
      enforced,
      dateCurrent,
      dateMin,
      dateMax,
      dateExpire
    }
  }
})
</script>

<style lang="scss" scoped>
.recipient-edit-expiration-btn-remove {
  vertical-align: middle;
}
</style>
