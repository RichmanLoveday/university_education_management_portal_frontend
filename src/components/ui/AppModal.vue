<script setup>
import { onBeforeUnmount, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' },
  persistent: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }

function close() {
  if (!props.persistent) emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-from-class="opacity-0" enter-active-class="transition duration-150" leave-to-class="opacity-0" leave-active-class="transition duration-100">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" @mousedown.self="close">
        <div
          class="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-xl"
          :class="widths[size]"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 class="text-base font-semibold text-slate-900">{{ title }}</h2>
            <button class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close" @click="emit('close')">
              <AppIcon name="close" :size="18" />
            </button>
          </div>
          <div class="overflow-y-auto px-5 py-4">
            <slot />
          </div>
          <div v-if="$slots.footer" class="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-3 sm:flex-row sm:justify-end">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
