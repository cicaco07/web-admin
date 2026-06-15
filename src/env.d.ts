// src/env.d.ts
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue3-select2-component' {
  import { DefineComponent } from 'vue'
  const Select2: DefineComponent<{
    modelValue?: string | string[] | null
    id?: string
    name?: string
    placeholder?: string
    options?: Array<{ id: string | number; text: string }>
    disabled?: boolean
    required?: boolean
    settings?: Record<string, unknown>
  }, {}, any>
  export default Select2
}
