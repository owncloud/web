declare module 'vue/types/web' {
  import { ILanguageComponent } from 'vue/types/vue'
  interface Vue extends ILanguageComponent {
    [key: string]: any
  }
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
