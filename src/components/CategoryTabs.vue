<script setup>
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  activeCategory: {
    type: String,
    default: ''
  },
  currentTheme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['update:activeCategory'])

const selectCategory = (categoryId) => {
  emit('update:activeCategory', categoryId)
}
</script>

<template>
  <div class="flex space-x-2 overflow-x-auto pb-2">
    <button
      v-for="category in categories"
      :key="category.id"
      @click="selectCategory(category.id)"
      class="flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-300"
      :class="activeCategory === category.id
        ? (currentTheme === 'dark' ? 'bg-white/20 text-white shadow-sm' : 'bg-gray-500/20 text-gray-900 shadow-sm')
        : (currentTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/10')"
    >
      {{ category.name }}
    </button>
  </div>
</template>