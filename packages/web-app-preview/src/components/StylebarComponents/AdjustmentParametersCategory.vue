<template>
  <div :aria-label="$gettext('Category container')">
    <oc-button
      :aria-label="$gettext(name)"
      :class="['adjustment-parameter-category-button', isOpen && 'button-box-shadow']"
      appearance="raw"
      @click="handleIsOpen"
    >
      <span class="button-description">
        <oc-icon :name="iconName" :fill-type="isFillTypeLine ? 'line' : 'fill'" />
        {{ $gettext(name) }}
      </span>
      <oc-icon :name="isOpen ? 'arrow-up-s' : 'arrow-down-s'" />
    </oc-button>
    <div v-if="isOpen">
      <div
        v-for="adjustmentParameter in adjustmentParams"
        :key="adjustmentParameter.name"
        :aria-label="$gettext(`parameter ${adjustmentParameter.name}`)"
        class="adjustment-parameters"
      >
        <div
          v-if="adjustmentParameter.type === AdjustmentParametersTypeEnum.Number"
          class="parameter-description"
        >
          <span class="description">
            <p>{{ $gettext(adjustmentParameter.name) }}</p>
            <p>{{ adjustmentParameter.value }}</p>
          </span>
          <input
            v-model="adjustmentParameter.value"
            type="range"
            :min="adjustmentParameter.minValue"
            :max="adjustmentParameter.maxValue"
            steps="1"
            class="slider-bar"
            @input="handleUpdateNumberValue(adjustmentParameter)"
            @keydown="preventArrowKeys"
          />
        </div>
        <div
          v-else-if="adjustmentParameter.type === AdjustmentParametersTypeEnum.Boolean"
          class="parameter-description"
        >
          <span :aria-label="$gettext(`parameter ${adjustmentParameter.name}`)" class="description">
            <p>{{ $gettext(adjustmentParameter.name) }}</p>
            <oc-switch
              :checked="(adjustmentParameter.value as boolean)"
              @update:checked="handleUpdateBooleanValue(adjustmentParameter)"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, PropType, computed } from 'vue'
import {
  AdjustmentParametersCategoryEnum,
  AdjustmentParametersCategoryType,
  AdjustmentParametersTypeEnum
} from '../../helpers'
import { mapMutations } from 'vuex'
import { useStore } from 'web-pkg'

export default defineComponent({
  name: 'AdjustmentParametersCategory',
  props: {
    iconName: {
      type: String,
      default: '',
      required: true
    },
    name: {
      type: String,
      default: '',
      required: true
    },
    parameterCategory: {
      type: Object as PropType<AdjustmentParametersCategoryEnum>,
      required: true
    },
    isFillTypeLine: {
      type: Boolean,
      default: false
    },
    isOpenDefault: {
      type: Boolean,
      default: false
    }
  },
  emits: ['valueChange'],
  setup(props) {
    const isOpen = ref(props.isOpenDefault)
    const store = useStore()

    const adjustmentParams = computed((): AdjustmentParametersCategoryType[] => {
      switch (props.parameterCategory) {
        case AdjustmentParametersCategoryEnum.General:
          return store.getters['Preview/generalParameters']
        case AdjustmentParametersCategoryEnum.FineTune:
          return store.getters['Preview/fineTuneParameters']
        case AdjustmentParametersCategoryEnum.Miscellaneous:
          return store.getters['Preview/miscellaneousParameters']
        default:
          return []
      }
    })

    const handleIsOpen = () => {
      isOpen.value = !isOpen.value
    }

    return {
      isOpen,
      adjustmentParams,
      AdjustmentParametersTypeEnum,
      handleIsOpen
    }
  },
  methods: {
    ...mapMutations('Preview', ['SET_ACTIVE_ADJUSTMENT_PARAMETERS']),
    handleUpdateNumberValue(parameter: AdjustmentParametersCategoryType) {
      this.SET_ACTIVE_ADJUSTMENT_PARAMETERS({ name: parameter.name, value: parameter.value })
    },
    handleUpdateBooleanValue(parameter: AdjustmentParametersCategoryType) {
      this.SET_ACTIVE_ADJUSTMENT_PARAMETERS({ name: parameter.name, value: !parameter.value })
    },
    preventArrowKeys(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.stopPropagation()
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.adjustment-parameter-category-button {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 6px;
  border-radius: 8px;
  margin-top: 16px;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }
}

.button-description {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-box-shadow {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}
.adjustment-parameters {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 12px;
}

.parameter-description {
  width: 100%;
}

.description {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.slider-bar {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: var(--oc-color-background-hover);
  border-radius: 5px;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 5px;
    background-color: var(--oc-color-background-hover);
    cursor: pointer;
  }

  &::-moz-range-track {
    height: 4px;
    cursor: pointer;
  }

  &::-ms-track {
    height: 4px;
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    height: 8px;
    width: 8px;
    margin-top: -6px;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    height: 8px;
    cursor: pointer;
  }

  &::-ms-thumb {
    height: 8px;
    cursor: pointer;
  }
}
</style>
