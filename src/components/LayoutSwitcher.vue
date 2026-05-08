<script setup>
import { Grid, List } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'grid'
  },
  currentTheme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['update:modelValue'])

const layouts = [
  { id: 'ios', name: 'iOS', icon: Grid },
  { id: 'list', name: '列表', icon: List },
  { id: 'grid', name: '网格', icon: Grid }
]
</script>

<template>
  <div class="flex space-x-1 glass-card rounded-xl p-1">
    <button
      v-for="layout in layouts"
      :key="layout.id"
      @click="emit('update:modelValue', layout.id)"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300"
      :class="modelValue === layout.id
        ? (currentTheme === 'dark' ? 'bg-white/20 text-white shadow-sm' : 'bg-gray-500/20 text-gray-900 shadow-sm')
        : (currentTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/10')"
    >
      <component :is="layout.icon" class="w-4 h-4" />
      <span class="text-sm font-medium">{{ layout.name }}</span>
    </button>
  </div>
</template>