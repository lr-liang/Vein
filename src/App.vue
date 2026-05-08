<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useDataLoader } from './composables/useDataLoader'
import { useSearch } from './composables/useSearch'
import { getImageUrl } from './utils/imageStorage'
import { Cloud } from 'lucide-vue-next'
import SearchBar from './components/SearchBar.vue'
import LayoutSwitcher from './components/LayoutSwitcher.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import ListLayout from './components/ListLayout.vue'
import IosLayout from './components/IosLayout.vue'
import GridLayout from './components/GridLayout.vue'
import SettingsSidebar from './components/SettingsSidebar.vue'

// 数据加载
const { menuData, settings, loading, error, reloadMenuData } = useDataLoader()

// 搜索功能
const { searchQuery, filteredData, clearSearch, hasResults } = useSearch(menuData)

// 布局状态
const currentLayout = ref('grid')
const activeCategory = ref('')

// 主题状态
const currentTheme = ref('light')

// 设置侧边栏状态
const isSettingsOpen = ref(false)

// 背景图片 URL（用于显示）
const backgroundImageUrl = ref('')

// 本地图片路径 ID（从 localStorage 恢复，不修改 settings）
const localPathId = ref('')

// 从 IndexedDB 加载本地图片
const loadLocalImage = async (imageId) => {

  // 清理之前的URL对象，避免内存泄漏
  if (backgroundImageUrl.value && backgroundImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(backgroundImageUrl.value)
  }

  if (imageId && imageId.startsWith('background_')) {
    const url = await getImageUrl(imageId)
    backgroundImageUrl.value = url || ''
  } else {
    backgroundImageUrl.value = ''
  }
}

// 获取最终要显示的背景图片URL（优先级：本地图片 > 网络URL）
const getBackgroundImageUrl = () => {
  return backgroundImageUrl.value || settings.value?.background?.url || ''
}

// 从设置中获取默认配置
onMounted(() => {
  // 加载保存的设置或使用默认值
  const savedSettings = localStorage.getItem('vein-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)

      // 恢复本地图片路径 ID
      if (parsed?.background?.localPath) {
        localPathId.value = parsed.background.localPath
      }
      if (parsed.layout?.default) {
        currentLayout.value = parsed.layout.default
      }
      if (parsed.theme?.default) {
        currentTheme.value = parsed.theme.default
      }

      // 将恢复的设置同步到 settings.value，确保 SettingsSidebar 能看到用户设置
      if (settings.value) {
        const deepMerge = (target, source) => {
          const result = { ...target }
          Object.keys(source).forEach(key => {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
              result[key] = { ...target[key], ...source[key] }
            } else {
              result[key] = source[key]
            }
          })
          return result
        }
        settings.value = deepMerge(settings.value, parsed)
      }
    } catch (e) {
      console.warn('Failed to parse saved settings')
    }
  }

  // 从YAML配置中获取默认值（如果没有保存的设置）
  if (settings.value?.layout?.default && !savedSettings) {
    currentLayout.value = settings.value.layout.default
  }
  if (settings.value?.theme?.default && !savedSettings) {
    currentTheme.value = settings.value.theme.default
  }

  // 应用主题
  applyTheme(currentTheme.value)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)

  // 清理监听器
  onUnmounted(() => {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange)
    // 清理背景图片URL对象
    if (backgroundImageUrl.value && backgroundImageUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(backgroundImageUrl.value)
    }
  })
})

// 监听分类变化
const handleCategoryChange = (categoryId) => {
  activeCategory.value = categoryId
}

// 应用主题到文档
const applyTheme = (theme) => {
  const root = document.documentElement

  // 移除现有主题类
  root.classList.remove('theme-light', 'theme-dark')

  if (theme === 'light') {
    root.classList.add('theme-light')
  } else if (theme === 'dark') {
    root.classList.add('theme-dark')
  } else {
    // auto - 根据系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('theme-dark')
    } else {
      root.classList.add('theme-light')
    }
  }
}

// 监听系统主题变化
const handleSystemThemeChange = () => {
  if (currentTheme.value === 'auto') {
    applyTheme('auto')
  }
}

// 更新设置
const handleSettingsUpdate = (newSettings) => {
  console.log('App.vue: handleSettingsUpdate 被调用:', newSettings)
  let hasChanges = false

  // 更新当前布局如果设置中的默认布局发生变化
  if (newSettings.layout?.default && newSettings.layout.default !== currentLayout.value) {
    currentLayout.value = newSettings.layout.default
    hasChanges = true
  }

  // 更新主题如果发生变化
  if (newSettings.theme?.default && newSettings.theme.default !== currentTheme.value) {
    currentTheme.value = newSettings.theme.default
    applyTheme(newSettings.theme.default)
    hasChanges = true
  }

  // 同步本地图片路径 ID
  if (newSettings?.background?.localPath !== undefined) {
    localPathId.value = newSettings.background.localPath
  }

  // 更新响应式 settings 以确保搜索框和复制按钮的设置生效
  // 使用深度合并来保持嵌套对象的完整性
  const deepMerge = (target, source) => {
    const result = { ...target }
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = { ...target[key], ...source[key] }
      } else {
        result[key] = source[key]
      }
    })
    return result
  }
  settings.value = deepMerge(settings.value, newSettings)

  // 保存设置到localStorage
  localStorage.setItem('vein-settings', JSON.stringify(newSettings))

  if (hasChanges) {
    // 设置已更新并应用
  }
}

// 当搜索时，自动选择第一个有结果的分类
const displayData = computed(() => {
  const data = searchQuery.value.trim() ? filteredData.value : menuData.value

  if (data?.categories?.length > 0 && !activeCategory.value) {
    activeCategory.value = data.categories[0].id
  }

  return data
})

// 监听 settings 初始加载（从 YAML 加载完成后触发）
watch(settings, async (newSettings) => {
  // 加载本地图片
  const pathToUse = localPathId.value || newSettings?.background?.localPath
  if (newSettings?.background?.enabled && pathToUse) {
    await loadLocalImage(pathToUse)
  }
}, { immediate: true })

// 监听背景设置变化
watch(() => settings.value?.background?.localPath, async (newPath) => {
  if (settings.value?.background?.enabled && newPath) {
    await loadLocalImage(newPath)
  } else {
    // 如果本地路径为空或背景被禁用，清理本地图片URL
    backgroundImageUrl.value = ''
  }
})

watch(() => settings.value?.background?.enabled, async (enabled) => {
  if (enabled && settings.value?.background?.localPath) {
    await loadLocalImage(settings.value.background.localPath)
  } else {
    // 如果背景被禁用，清理本地图片URL
    backgroundImageUrl.value = ''
  }
})
</script>

<template>
  <div
    class="min-h-screen overflow-hidden transition-all duration-300"
    :class="[
      currentTheme === 'dark'
        ? 'bg-[#3C3F41] text-white'
        : 'bg-white text-gray-900'
    ]"
  >
    <!-- 背景图片容器 -->
    <div v-if="settings?.background?.enabled && getBackgroundImageUrl()" class="absolute inset-0 overflow-hidden">
      <!-- 背景图片（应用模糊和亮度调节） -->
      <div
        class="absolute inset-0 background-filter scale-110"
        :style="{
          background: `url(${getBackgroundImageUrl()}) center/cover no-repeat fixed`
        }"
      ></div>
      <!-- 半透明遮罩层 -->
      <div class="absolute inset-0 background-mask"></div>
    </div>

    <!-- 背景装饰（当没有背景图片时显示） -->
    <div class="absolute inset-0 overflow-hidden" v-if="currentTheme === 'dark' && (!settings?.background?.enabled || !getBackgroundImageUrl())">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>

    <div
      class="relative z-10 min-h-screen flex flex-col transition-all duration-300"
    >
      <!-- 顶部控制栏 -->
      <header class="sticky top-0 z-50 backdrop-blur-2xl border-b transition-colors duration-300 enhanced-glass"
            :class="currentTheme === 'dark' ? 'border-white/15' : 'border-gray-300/25'">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between space-x-6">
            <!-- Logo和标题 -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">V</span>
              </div>
              <h1 class="text-xl font-bold transition-colors duration-300"
                  :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">Vein</h1>
            </div>

            <!-- 天气信息 -->
            <div v-if="settings?.weather?.enabled" class="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300"
                 :class="currentTheme === 'dark' ? 'bg-white/10' : 'bg-gray-500/10'">
              <Cloud class="w-4 h-4 text-cyan-400" />
              <span class="text-sm font-medium transition-colors duration-300"
                    :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">
                {{ settings?.weather?.city || '深圳' }}
              </span>
              <span class="text-sm transition-colors duration-300"
                    :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">
                22°C
              </span>
            </div>

            <!-- 搜索栏 -->
            <div class="flex-1 max-w-md" v-if="settings?.search?.enabled !== false">
              <SearchBar
                v-model="searchQuery"
                placeholder="搜索链接..."
                @clear="clearSearch"
              />
            </div>

            <!-- 布局切换器和设置 -->
            <div class="flex items-center space-x-3">
              <LayoutSwitcher v-model="currentLayout" :current-theme="currentTheme" />

              <!-- 设置按钮 -->
              <button
                @click="isSettingsOpen = true"
                class="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
                title="设置"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <main class="flex-1 overflow-y-auto scrollbar-hide container mx-auto px-6 py-8">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">加载中...</p>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="flex items-center justify-center h-64">
          <div class="text-center">
            <p class="text-red-400 mb-4">{{ error }}</p>
            <button
              @click="$refs.dataLoader?.reload()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        </div>

        <!-- 搜索无结果 -->
        <div v-else-if="searchQuery.trim() && !hasResults" class="flex items-center justify-center h-64">
          <div class="text-center">
            <p class="text-gray-400 text-lg mb-2">未找到相关结果</p>
            <p class="text-gray-500 text-sm">请尝试其他关键词</p>
          </div>
        </div>

        <!-- 主要内容 -->
        <div v-else-if="displayData" class="min-h-full flex flex-col">
          <!-- 分类标签（仅在Grid和iOS模式下显示） -->
          <div v-if="(currentLayout === 'grid' || currentLayout === 'ios') && displayData.categories?.length > 1" class="mb-8">
            <CategoryTabs
              :categories="displayData.categories"
              :active-category="activeCategory"
              :current-theme="currentTheme"
              @update:activeCategory="handleCategoryChange"
            />
          </div>

          <!-- 布局内容 -->
          <div class="h-full">
            <component
              :is="
                currentLayout === 'grid' ? GridLayout :
                currentLayout === 'ios' ? IosLayout :
                ListLayout
              "
              :data="activeCategory && (currentLayout === 'grid' || currentLayout === 'ios') ? {
                categories: displayData.categories?.filter(cat => cat.id === activeCategory) || [],
                settings: settings
              } : { ...displayData, settings: settings }"
              :active-category="activeCategory"
              :current-theme="currentTheme"
              @update:activeCategory="handleCategoryChange"
            />
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex items-center justify-center h-64">
          <p class="text-gray-400">暂无数据</p>
        </div>
      </main>
    </div>
  </div>

  <!-- 设置侧边栏 -->
  <SettingsSidebar
    v-model="isSettingsOpen"
    :settings="settings"
    :current-theme="currentTheme"
    @update:settings="handleSettingsUpdate"
    @menu-imported="reloadMenuData"
  />
</template>