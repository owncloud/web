<template>
  <div
    class="oc-text-input-password-wrapper"
    :class="{
      'oc-text-input-password-wrapper-warning': !!hasWarning,
      'oc-text-input-password-wrapper-danger': !!hasError
    }"
  >
    <input
      v-bind="$attrs"
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      @input="onPasswordEntered"
    />
    <oc-button
      v-if="password"
      v-oc-tooltip="$gettext('Show password')"
      class="oc-text-input-show-password-toggle oc-px-s oc-background-default"
      appearance="raw"
      size="small"
      @click="showPassword = !showPassword"
    >
      <oc-icon size="small" :name="showPassword ? 'eye-off' : 'eye'" />
    </oc-button>
    <oc-button
      v-if="password"
      v-oc-tooltip="$gettext('Copy password')"
      class="oc-text-input-copy-password-button oc-px-s oc-background-default"
      appearance="raw"
      size="small"
      @click="copyPasswordToClipboard"
    >
      <oc-icon size="small" :name="copyPasswordIcon" />
    </oc-button>
    <oc-button
      v-if="generatePasswordMethod"
      v-oc-tooltip="$gettext('Generate password')"
      class="oc-text-input-generate-password-button oc-px-s oc-background-default"
      appearance="raw"
      size="small"
      @click="generatePassword"
    >
      <oc-icon size="small" name="refresh" fill-type="line" />
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
import { PasswordPolicy } from '../../helpers'
export default defineComponent({
  name: 'OCTextInputPassword',
  components: { OcButton, OcIcon },
  status: 'ready',
  release: '1.0.0',
  inheritAttrs: true,
  props: {
    value: {
      type: String,
      required: false,
      default: ''
    },
    hasWarning: {
      type: Boolean,
      required: false,
      default: false
    },
    hasError: {
      type: Boolean,
      required: false,
      default: false
    },
    passwordPolicy: {
      type: Object as PropType<PasswordPolicy>,
      default: () => ({})
    },
    generatePasswordMethod: {
      type: Function as PropType<(...args: unknown[]) => string>,
      required: false,
      default: null
    }
  },
  emits: ['passwordChallengeCompleted', 'passwordChallengeFailed'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const password = ref(props.value)
    const showPassword = ref(false)
    const passwordEntered = ref(false)
    const copyPasswordIconInitial = 'file-copy'
    const copyPasswordIcon = ref(copyPasswordIconInitial)

    const showPasswordPolicyInformation = computed(() => {
      return !!(Object.keys(props.passwordPolicy?.rules || {}).length && unref(passwordEntered))
    })

    const testedPasswordPolicy = computed(() => {
      return props.passwordPolicy.missing(unref(password))
    })

    const getPasswordPolicyRuleMessage = (rule) => {
      const paramObj = {}

      for (let formatKey = 0; formatKey < rule.format.length; formatKey++) {
        paramObj[`param${formatKey + 1}`] = rule.format[formatKey]
      }

      return $gettext(rule.message, paramObj, true)
    }

    const copyPasswordToClipboard = () => {
      navigator.clipboard.writeText(unref(password))
      copyPasswordIcon.value = 'check'
      setTimeout(() => (copyPasswordIcon.value = copyPasswordIconInitial), 500)
    }

    const generatePassword = () => {
      const generatedPassword = props.generatePasswordMethod()
      password.value = generatedPassword
      showPassword.value = true
      //this.$emit('input')
    }

    const onPasswordEntered = () => {
      passwordEntered.value = true
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
      password,
      showPassword,
      showPasswordPolicyInformation,
      testedPasswordPolicy,
      getPasswordPolicyRuleMessage,
      copyPasswordToClipboard,
      generatePassword,
      copyPasswordIcon,
      onPasswordEntered
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

  &-warning,
  &-warning:focus {
    border-color: var(--oc-color-swatch-warning-default) !important;
    color: var(--oc-color-swatch-warning-default) !important;
  }

  &-danger,
  &-danger:focus {
    border-color: var(--oc-color-swatch-danger-default) !important;
    color: var(--oc-color-swatch-danger-default) !important;
  }
}
.oc-text-input-password-wrapper:focus-within {
  border-color: var(--oc-color-swatch-passive-default);
}
</style>
