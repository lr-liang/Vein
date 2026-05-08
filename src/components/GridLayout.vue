<script setup>
import { computed } from 'vue'
import LinkCard from './LinkCard.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ categories: [] })
  },
  currentTheme: {
    type: String,
    default: 'dark'
  }
})

// 展平所有链接用于网格显示
const allLinks = computed(() => {
  const links = []
  props.data.categories?.forEach(category => {
    category.groups?.forEach(group => {
      group.links?.forEach(link => {
        links.push({
          ...link,
          categoryName: category.name,
          groupName: group.name
        })
      })
    })
  })
  return links
})
</script>

<template>
  <div class="space-y-8">
    <!-- 分类分组显示 -->
    <div
      v-for="category in data.categories || []"
      :key="category.id"
      class="space-y-6"
    >
      <div class="glass-card p-6">
        <h2 class="text-2xl font-bold pb-3 transition-colors duration-300"
            :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">
          {{ category.name }}
        </h2>

        <div
          v-for="group in category.groups || []"
          :key="group.name"
          class="space-y-4 mt-6"
        >
          <h3 class="text-lg font-semibold ml-2 transition-colors duration-300"
              :class="currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'">
            {{ group.name }}
          </h3>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <LinkCard
            v-for="link in group.links"
            :key="link.url"
            :link="link"
            layout="grid"
            :current-theme="currentTheme"
            :show-copy-button="data.settings?.other?.showCopyButton"
          />
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div
      v-if="!data.categories || data.categories.length === 0"
      class="flex items-center justify-center h-64"
    >
      <p class="text-lg transition-colors duration-300"
         :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">暂无数据</p>
    </div>
  </div>
</template>