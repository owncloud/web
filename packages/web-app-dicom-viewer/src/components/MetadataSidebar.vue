<template>
  <div id="dicom-metadata" class="dicom-metadata sidebar-panel__header">
    <!-- insert cross icon to close sidebar -->
    <div class="sidebar-panel__header header">
      <!--
    <div
      v-if="[activePanelName, oldPanelName].includes(panel.app)"
      class="sidebar-panel__header header"
    >
    -->
      <!-- accessible label back
            <oc-button
              v-if="!panel.default"
              v-oc-tooltip="accessibleLabelBack"
              class="header__back"
              appearance="raw"
              :aria-label="accessibleLabelBack"
              @click="closePanel"
            >
              <oc-icon name="arrow-left-s" fill-type="line" />
            </oc-button>
            -->

      <h2 class="header__title oc-my-rm">DICOM metadata</h2>

      <oc-button
        appearance="raw"
        class="header__close"
        :aria-label="$gettext('Close metadata sidebar')"
        @click="$emit('closeMetadataSidebar')"
      >
        <oc-icon name="close" />
      </oc-button>
    </div>
    <!--
    <h2 class="oc-py-s oc-my-rm header__title">DICOM metadata</h2>
    -->

    <div v-if="isMetadataExtracted">
      <table class="details-table oc-py-s">
        <!-- example information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Example Information (Section Title)
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in dicomMetadata[0]" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- patient information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Patient Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in dicomMetadata[1]" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- study information section -->

        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Study Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in dicomMetadata[2]" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- series information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Series Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in dicomMetadata[3]" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- image information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Image Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in dicomMetadata[4]" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Resource } from 'web-client/src'
import upperFirst from 'lodash-es/upperFirst'

export default defineComponent({
  name: 'MetadataSidebar',
  props: {
    dicomMetadata: {
      type: [Array, Object],
      required: true
    },
    isMetadataExtracted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['closeMetadataSidebar'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    return {
      imageShowMetadataDescription: $gettext('Show DICOM metadata'),
      imageHideMetadataDescription: $gettext('Hide DICOM metadata')
    }
  },
  methods: {
    formatLabel(label: string) {
      // formatting camelcase labels into easily readible labels by adding a gap befor each upper case letter
      // there is no space added if there are multiple upper case letters in a row (e.g. ID)
      // in cases where such an abbreviation is followed by another word and underline should be added in the variable name, e.g. "SOP_InstanceUID" becomes "SOP Instance UID"

      const result = label.replace(/([A-Z]+)/g, ' $1').replace('_', '')

      // optionally make first letter of each word lower?
      // return upperFirst(result.toLowerCase())

      return upperFirst(result)
    }
  }
})
</script>

<style lang="scss" scoped>
.dicom-metadata-section-title {
  //margin: 4px 0px 8px 0px;
  margin-bottom: 0px;
  padding-top: 16px !important;
  border-top: 1px solid var(--oc-color-border);
}

.details-table {
  tr {
    height: 1rem; // reducing hight, originally 1.5rem
  }

  border-bottom: 1px solid var(--oc-color-border);
}
</style>
