<script setup>
import { computed } from 'vue'
import LinkCard from './LinkCard.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ categories: [] })
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

const currentCategory = computed(() => {
  return props.data.categories?.find(cat => cat.id === props.activeCategory) || props.data.categories?.[0]
})
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div v-if="currentCategory" class="space-y-12 pb-24">
      <!-- iOS风格的大图标网格 - 展平所有链接 -->
      <div class="glass-card p-8">
        <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-12 justify-items-center">
        <LinkCard
          v-for="link in currentCategory.groups?.flatMap(group => group.links || []) || []"
          :key="link.url"
          :link="link"
          layout="ios"
          :current-theme="currentTheme"
          :show-copy-button="data.settings?.other?.showCopyButton"
        />
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <p class="transition-colors duration-300"
         :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">请选择一个分类</p>
    </div>
  </div>
</template>