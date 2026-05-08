<script setup>
import { Copy, Check } from 'lucide-vue-next'
import { useLinkClipboard } from '../composables/useClipboard'
import { computed } from 'vue'

const props = defineProps({
  link: {
    type: Object,
    required: true
  },
  layout: {
    type: String,
    default: 'grid'
  },
  currentTheme: {
    type: String,
    default: 'dark'
  },
  showCopyButton: {
    type: Boolean,
    default: true
  }
})

const { copyLink, isCopying } = useLinkClipboard()

// 多源 favicon 获取
const getFaviconUrls = (url) => {
  try {
    const u = new URL(url)
    const domain = u.hostname
    return [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `${u.origin}/favicon.ico`,
      `https://logo.clearbit.com/${domain}`,
    ]
  } catch {
    return []
  }
}

// 缓存结果避免重复计算
const faviconUrls = computed(() => getFaviconUrls(props.link.url))

// 失败自动切换到下一个favicon源
const handleImgError = (e) => {
  const img = e.target
  const index = Number(img.dataset.index || 0) + 1

  if (index < faviconUrls.value.length) {
    img.dataset.index = index
    img.src = faviconUrls.value[index]
  } else {
    img.style.display = 'none'
    img.nextElementSibling.style.display = 'flex'
  }
}

const handleCopy = async (e) => {
  e.preventDefault()
  e.stopPropagation()
  await copyLink(props.link.url)
}
</script>

<template>
  <a
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group block"
    :class="{
      'link-card': layout !== 'ios',
      'link-card-grid': layout === 'grid',
      'link-card-ios': layout === 'ios',
      'link-card-list': layout === 'list'
    }"
  >

    <!-- List -->
    <div class="flex items-center justify-between" v-if="layout === 'list'">
      <div class="flex items-center space-x-3">
        <div class="relative flex-shrink-0">
          <img
            v-if="faviconUrls.length"
            :src="faviconUrls[0]"
            :alt="link.title"
            class="w-4 h-4 rounded-lg object-cover"
            @error="handleImgError"
          />
          <div
            class="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs"
            style="display: none;"
          >
            {{ link.title.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="font-medium truncate group-hover:text-blue-300 transition-colors"
              :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">
            {{ link.title }}
          </h3>
          <p v-if="link.description" class="text-sm truncate mt-1"
             :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">
            {{ link.description }}
          </p>
        </div>
      </div>

      <button
        v-if="showCopyButton"
        @click="handleCopy"
        class="flex-shrink-0 p-2 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
        :class="[
          currentTheme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-500/10 hover:bg-gray-500/20',
          isCopying ? 'opacity-100 translate-x-0 bg-green-500/20' : ''
        ]"
      >
        <component
          :is="isCopying ? Check : Copy"
          class="w-4 h-4"
          :class="isCopying ? 'text-green-400' : (currentTheme === 'dark' ? 'text-white' : 'text-gray-700')"
        />
      </button>
    </div>

    <!-- iOS -->
    <div v-else-if="layout === 'ios'" class="flex flex-col items-center justify-center">
      <div class="relative">
        <img
          v-if="faviconUrls.length"
          :src="faviconUrls[0]"
          :alt="link.title"
          class="w-10 h-10 object-cover transition-all duration-300 group-hover:scale-106 group-hover:-translate-y-1"
          @error="handleImgError"
        />
        <div
          class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base"
          style="display: none;"
        >
          {{ link.title.charAt(0).toUpperCase() }}
        </div>

        <button
          v-if="showCopyButton"
          @click="handleCopy"
          class="absolute -top-1 -right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"
          :class="isCopying ? 'opacity-100 bg-green-500/30 text-green-400' : (currentTheme === 'dark' ? 'bg-white/20 text-white' : 'bg-gray-500/20 text-gray-700')"
        >
          <component :is="isCopying ? Check : Copy" class="w-3 h-3" />
        </button>
      </div>

      <h3 class="mt-2 text-xs truncate max-w-16"
          :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">
        {{ link.title }}
      </h3>
    </div>

    <!-- Grid -->
    <div v-else class="text-center space-y-2">
      <div class="relative">
        <img
          v-if="faviconUrls.length"
          :src="faviconUrls[0]"
          :alt="link.title"
          class="w-4 h-4 rounded-lg object-cover mx-auto"
          @error="handleImgError"
        />
        <div
          class="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs mx-auto"
          style="display: none;"
        >
          {{ link.title.charAt(0).toUpperCase() }}
        </div>
      </div>

      <div>
        <h3 class="font-medium truncate"
            :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">
          {{ link.title }}
        </h3>
        <p v-if="link.description" class="text-sm truncate mt-1"
           :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">
          {{ link.description }}
        </p>
      </div>
    </div>

  </a>
</template>