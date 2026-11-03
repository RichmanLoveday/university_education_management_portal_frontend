<script setup>
import { computed, useId } from 'vue'

const model = defineModel({ type: [String, Number, Boolean, null] })

const props = defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  min: { type: [Number, String], default: undefined },
  max: { type: [Number, String], default: undefined },
  step: { type: [Number, String], default: undefined },
  autocomplete: { type: String, default: undefined },
})

const id = useId()
const isNumeric = computed(() => props.type === 'number')

// Select values come back as strings; keep numeric option values numeric
function onSelect(event) {
  const raw = event.target.value
  const match = props.options.find((option) => String(option.value) === raw)
  model.value = raw === '' ? '' : (match?.value ?? raw)
}
</script>

<template>
  <div>
    <label v-if="type === 'checkbox'" :for="id" class="flex items-center gap-2 text-sm text-slate-700">
      <input :id="id" v-model="model" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600" :disabled="disabled" />
      {{ label }}
    </label>

    <template v-else>
      <label v-if="label" :for="id" class="label">
        {{ label }}<span v-if="required" class="text-rose-500"> *</span>
      </label>

      <select
        v-if="type === 'select'"
        :id="id"
        :value="model ?? ''"
        class="input"
        :class="{ 'input-error': error }"
        :disabled="disabled"
        :required="required"
        @change="onSelect"
      >
        <option value="">{{ placeholder || 'Select…' }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>

      <textarea
        v-else-if="type === 'textarea'"
        :id="id"
        v-model="model"
        rows="3"
        class="input"
        :class="{ 'input-error': error }"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
      />

      <input
        v-else-if="isNumeric"
        :id="id"
        v-model.number="model"
        type="number"
        class="input"
        :class="{ 'input-error': error }"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
      />

      <input
        v-else
        :id="id"
        v-model="model"
        :type="type"
        class="input"
        :class="{ 'input-error': error }"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
      />
    </template>

    <p v-if="error" class="field-error">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
