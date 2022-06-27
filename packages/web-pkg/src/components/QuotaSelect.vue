<template>
  <div>
    <oc-select
      v-model="selectedOption"
      :selectable="optionSelectable"
      taggable
      push-tags
      :clearable="false"
      :options="options"
      :create-option="createOption"
      option-label="displayValue"
      :label="title"
      @option:selected="$emit('selectedOptionChange', selectedOption)"
    >
      <template #selected-option="{ displayValue, displayUnit }">
        <span>{{ displayValue }}</span>
        <span v-if="displayUnit" class="oc-text-muted oc-ml-s">{{ displayUnit }}</span>
      </template>
      <template #search="{ attributes, events }">
        <input class="vs__search" v-bind="attributes" v-on="events" />
      </template>
      <template #option="{ displayValue, displayUnit, error }">
        <div class="oc-flex oc-flex-between">
          <span>{{ displayValue }}</span>
          <span v-if="displayUnit" class="oc-text-muted">{{ displayUnit }}</span>
        </div>
        <div v-if="error" class="oc-text-input-danger">{{ error }}</div>
      </template>
    </oc-select>
    <p
      class="oc-mt-xs oc-text-meta"
      v-text="$gettext('Select a quota option or enter your own value')"
    />
  </div>
</template>

<script>
export default {
  name: 'QuotaSelect',
  props: {
    title: {
      type: String,
      required: true
    },
    totalQuota: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      selectedOption: {},
      options: []
    }
  },
  computed: {
    DEFAULT_OPTIONS() {
      return [
        {
          displayValue: '1',
          displayUnit: 'GB',
          value: Math.pow(10, 9)
        },
        {
          displayValue: '5',
          displayUnit: 'GB',
          value: 5 * Math.pow(10, 9)
        },
        {
          displayValue: '10',
          displayUnit: 'GB',
          value: 10 * Math.pow(10, 9)
        },
        {
          displayValue: '50',
          displayUnit: 'GB',
          value: 50 * Math.pow(10, 9)
        },
        {
          displayValue: '100',
          displayUnit: 'GB',
          value: 100 * Math.pow(10, 9)
        },
        {
          displayValue: '500',
          displayUnit: 'GB',
          value: 500 * Math.pow(10, 9)
        },
        {
          displayValue: '1000',
          displayUnit: 'GB',
          value: 1000 * Math.pow(10, 9)
        },
        {
          displayValue: this.$gettext('No restriction'),
          displayUnit: '',
          value: 0,
          unlimited: true
        }
      ]
    }
  },
  watch: {
    totalQuota: {
      handler: function () {
        this.setOptions()
        this.selectedOption = this.options.find((o) => o.value === this.totalQuota)
      },
      immediate: true
    }
  },
  methods: {
    optionSelectable(option) {
      if (option.unlimited) {
        return true
      }

      if (!option.value) {
        return false
      }

      return !isNaN(option.value)
    },
    createOption(option) {
      if (option.endsWith('.') || option.endsWith(',')) {
        option = option.slice(0, -1)
      }

      const optionIsNumberRegex = /^[1-9]\d*(([.,])\d+)?$/g

      if (!optionIsNumberRegex.test(option)) {
        return {
          displayValue: option,
          error: this.$gettext('Please enter only numbers')
        }
      }

      option = option.replace(',', '.')
      return {
        displayValue: parseFloat(option).toFixed(2).toString().replace('.00', ''),
        displayUnit: 'GB',
        value: parseFloat(option).toFixed(2) * Math.pow(10, 9)
      }
    },
    setOptions() {
      this.options = [...this.DEFAULT_OPTIONS]

      let selectedQuotaInOptions = null

      if (this.totalQuota) {
        selectedQuotaInOptions = this.options.find((option) => option.value === this.totalQuota)
      } else {
        selectedQuotaInOptions = this.options.find((option) => option.unlimited === true)
      }

      if (selectedQuotaInOptions) {
        return
      }

      const newOption = {
        displayValue: (this.totalQuota * Math.pow(10, -9)).toFixed(2).toString().replace('.00', ''),
        displayUnit: 'GB',
        value: this.totalQuota
      }
      this.options.push(newOption)
      this.options = [
        ...this.options.filter((o) => o.value).sort((a, b) => a.value - b.value),
        ...this.options.filter((o) => !o.value)
      ]
    }
  }
}
</script>
