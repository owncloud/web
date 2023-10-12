<template>
  <div
    id="dicom-metadata-sidebar"
    class="dicom-metadata-sidebar .sidebar-panel oc-position-relative oc-width-1-3 oc-height-1-1 oc-ml-xs oc-py-s"
  >
    <div class="sidebar-panel__header header">
      <oc-button
        v-if="isSmallScreen"
        v-oc-tooltip="backToMainDescription"
        class="header__back"
        appearance="raw"
        :aria-label="backToMainDescription"
        @click="$emit('closeMetadataSidebar')"
      >
        <oc-icon name="arrow-left-s" fill-type="line" />
      </oc-button>

      <h2 class="header__title oc-my-rm">DICOM metadata</h2>

      <oc-button
        v-oc-tooltip="hideMetadataDescription"
        class="header__close"
        appearance="raw"
        :aria-label="hideMetadataDescription"
        @click="$emit('closeMetadataSidebar')"
      >
        <oc-icon name="close" />
      </oc-button>
    </div>
    <div v-if="isMetadataExtracted" id="dicom-metadata-sidebar-content" class="oc-px-s">
      <table class="details-table">
        <!-- example information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Example Information (Section Title)
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in exampleInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- patient information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Patient Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in patientInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- study information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Study Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in studyInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- series information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Series Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in seriesInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- instance information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Instance Information
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in instanceInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- image information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Image Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in imageInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- equipment information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Equipment Information
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in equipmentInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- scanning information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">
              Scanning Information
            </p>
          </th>
        </tr>
        <tr v-for="(value, key) in scanningInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- uids information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">UIDS Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in uidsInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
        <!-- other information section -->
        <tr>
          <th colspan="2">
            <p class="oc-py-s oc-font-semibold dicom-metadata-section-title">Other Information</p>
          </th>
        </tr>
        <tr v-for="(value, key) in otherInformation" :key="key">
          <th scope="col" class="oc-pr-s">{{ formatLabel(key.toString()) }}</th>
          <td>{{ value || '–' }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'
import upperFirst from 'lodash-es/upperFirst'

export default defineComponent({
  name: 'MetadataSidebar',
  props: {
    isMetadataExtracted: {
      type: Boolean,
      required: true,
      default: false
    },
    isSmallScreen: {
      type: Boolean,
      default: false
    },
    exampleInformation: {
      type: Array
    },
    patientInformation: {
      type: Array,
      required: true
    },
    studyInformation: {
      type: Array,
      required: true
    },
    seriesInformation: {
      type: Array,
      required: true
    },
    instanceInformation: {
      type: Array,
      required: true
    },
    imageInformation: {
      type: Array,
      required: true
    },
    equipmentInformation: {
      type: Array,
      required: true
    },
    scanningInformation: {
      type: Array,
      required: true
    },
    uidsInformation: {
      type: Array,
      required: true
    },
    otherInformation: {
      type: Array,
      required: true
    }
  },
  emits: ['closeMetadataSidebar'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    return {
      hideMetadataDescription: $gettext('Hide DICOM metadata'),
      backToMainDescription: $gettext('Back to DICOM viewer')
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
.dicom-metadata-sidebar {
  border-left: 1px solid var(--oc-color-border); // TODO: hide line on small screen
  position: relative;
  overflow: hidden;
  width: 600px;
}

#dicom-metadata-sidebar-content table {
  width: 100%;
}
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
