<script setup>
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索链接...'
  }
})

const emit = defineEmits(['update:modelValue', 'clear'])

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="relative w-full max-w-md mx-auto">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300"
            :class="$attrs.class?.includes('theme-light') ? 'text-gray-500' : 'text-gray-400'" />
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-10 pr-10 py-3 enhanced-glass rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors duration-300"
        :class="$attrs.class?.includes('theme-light') ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-400'"
      />
      <button
        v-if="modelValue"
        @click="clearSearch"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300"
        :class="$attrs.class?.includes('theme-light') ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>