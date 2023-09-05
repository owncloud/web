<template>
  <div ref="inputPasswordWrapper" class="oc-text-input-password-wrapper">
    <input v-bind="$attrs" :type="showPassword ? 'text' : 'password'" @input="onInput" />
    <oc-button
      class="oc-text-input-show-password-toggle oc-px-s oc-background-default"
      appearance="raw"
      size="small"
      @click="showPassword = !showPassword"
    >
      <oc-icon size="small" :name="showPassword ? 'eye-off' : 'eye'" />
    </oc-button>
  </div>
  <portal v-if="showPasswordPolicyInformation" to="app.design-system.password-policy">
    <div class="oc-text-small oc-flex oc-flex-column">
      <span v-text="$gettext('Please enter a password that meets the following criteria:')" />
      <div
        v-for="(testedRule, index) in testedPasswordPolicy.rules"
        :key="index"
        class="oc-flex oc-flex-middle"
      >
        <oc-icon
          size="small"
          :name="testedRule.verified ? 'check' : 'close'"
          :variation="testedRule.verified ? 'success' : 'danger'"
        />
        <span
          :class="[
            { 'oc-text-input-success': testedRule.verified },
            { 'oc-text-input-danger': !testedRule.verified }
          ]"
          v-text="getPasswordPolicyRuleMessage(testedRule)"
        ></span>
      </div>
    </div>
  </portal>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, unref, watch } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcButton from '../OcButton/OcButton.vue'
import { useGettext } from 'vue3-gettext'

export interface PasswordPolicy {
  rules: unknown[]
  check(password: string): boolean
  missing(password: string): {
    rules: {
      code: string
      message: string
      format: (number | string)[]
      verified: boolean
    }[]
  }
}
export default defineComponent({
  name: 'OCTextInputPassword',
  components: { OcButton, OcIcon },
  status: 'ready',
  release: '1.0.0',
  inheritAttrs: true,
  props: {
    passwordPolicy: {
      type: Object as PropType<PasswordPolicy>,
      default: () => ({})
    }
  },
  emits: ['passwordChallengeCompleted', 'passwordChallengeFailed'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const showPassword = ref(false)
    const passwordEntered = ref(false)
    const password = ref('')
    const showPasswordPolicyInformation = computed(() => {
      return !!(Object.keys(props.passwordPolicy?.rules || {}).length && unref(passwordEntered))
    })
    const testedPasswordPolicy = computed(() => {
      return props.passwordPolicy.missing(unref(password))
    })

    const onInput = (event) => {
      passwordEntered.value = true
      password.value = event.target.value
    }

    const getPasswordPolicyRuleMessage = (rule) => {
      const paramObj = {}

      for (let formatKey = 0; formatKey < rule.format.length; formatKey++) {
        paramObj[`param${formatKey + 1}`] = rule.format[formatKey]
      }

      return $gettext(rule.message, paramObj, true)
    }

    watch(password, (value) => {
      if (!Object.keys(props.passwordPolicy).length) {
        return
      }

      if (!props.passwordPolicy.check(value)) {
        return emit('passwordChallengeFailed')
      }

      emit('passwordChallengeCompleted')
    })

    return {
      $gettext,
      onInput,
      showPassword,
      showPasswordPolicyInformation,
      testedPasswordPolicy,
      getPasswordPolicyRuleMessage
    }
  }
})
</script>
<style lang="scss">
.oc-text-input-password-wrapper {
  display: flex;
  flex-direction: row;
  padding: 0;
  border-radius: 5px;
  border: 1px solid var(--oc-color-input-border);
  background-color: var(--oc-color-background-highlight);

  input {
    flex-grow: 2;
    border: none;
  }

  input:focus {
    outline: none;
  }

  button {
    background-color: var(--oc-color-background-highlight) !important;
  }
}
.oc-text-input-password-wrapper:focus-within {
  border-color: var(--oc-color-swatch-passive-default);
}
</style>
