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
  <div class="flex h-full">
    <!-- 左侧边栏 -->
    <div class="w-64 glass-sidebar p-6">
      <div class="space-y-2">
        <button
          v-for="category in data.categories || []"
          :key="category.id"
          class="w-full text-left px-4 py-3 rounded-lg transition-all duration-300"
          :class="activeCategory === category.id
            ? (currentTheme === 'dark' ? 'bg-white/20 text-white' : 'bg-gray-500/20 text-gray-900')
            : (currentTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/10')"
          @click="$emit('update:activeCategory', category.id)"
        >
          <div class="font-medium">{{ category.name }}</div>
        </button>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 p-6 overflow-y-auto">
      <div v-if="currentCategory" class="space-y-8">
        <div
          v-for="group in currentCategory.groups || []"
          :key="group.name"
          class="space-y-4"
        >
          <div class="glass-card p-6">
            <!-- 分组标题 -->
            <h2 class="text-xl font-semibold pb-4 transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">
              {{ group.name }}
            </h2>

            <!-- 链接列表 -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <LinkCard
              v-for="link in group.links"
              :key="link.url"
              :link="link"
              layout="list"
              :current-theme="currentTheme"
              :show-copy-button="data.settings?.other?.showCopyButton"
            />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center h-64">
        <p class="transition-colors duration-300"
           :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">请选择一个分类</p>
      </div>
    </div>
  </div>
</template>