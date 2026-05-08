<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Settings, X, Monitor, Sun, Moon, Layout, Search, Image, Cloud, Palette, Upload, FileText } from 'lucide-vue-next'
import { saveImage, deleteImage, openDB, STORE_NAME } from '../utils/imageStorage'
import { saveMenuData, hasCustomMenuData, deleteMenuData } from '../utils/menuStorage'
import yaml from 'js-yaml'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    default: () => ({})
  },
  currentTheme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['update:modelValue', 'update:settings'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const localSettings = ref({
  layout: { default: 'ios' },
  theme: { default: 'light' },
  search: { enabled: true },
  background: { enabled: false, url: '', localPath: '' },
  weather: { enabled: false, city: '深圳' },
  other: { showCopyButton: true }
})

// 菜单导入相关状态
const hasCustomMenu = ref(false)
const isImporting = ref(false)
const importStatus = ref('') // 'success', 'error', 'loading'
const importMessage = ref('')

// 获取设置值
const getSetting = (path, defaultValue = null) => {
  const keys = path.split('.')
  const value = keys.reduce((obj, key) => obj?.[key], localSettings.value)
  return value !== undefined ? value : defaultValue
}

// 检查是否有本地背景图片
const hasLocalBackground = computed(() => {
  const localPath = getSetting('background.localPath', '')
  return !!(localPath && localPath.startsWith('background_'))
})

// 检查IndexedDB中图片是否真实存在
const checkImageExistsInDB = async (imageId) => {
  if (!imageId || !imageId.startsWith('background_')) {
    return false
  }
  const exists = await checkImageInIndexedDB(imageId)
  console.log('SettingsSidebar: 检查图片存在性:', imageId, exists)
  return exists
}

// 监控 hasLocalBackground 状态变化
watch(hasLocalBackground, (newValue) => {
  console.log('SettingsSidebar: hasLocalBackground 状态变化:', newValue)
})

// 同步本地设置
watch(() => props.settings, (newSettings) => {
  if (newSettings && Object.keys(newSettings).length > 0) {
    // 深度合并设置
    const mergeSettings = (target, source) => {
      Object.keys(source).forEach(key => {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          target[key] = target[key] || {}
          mergeSettings(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      })
    }
    mergeSettings(localSettings.value, newSettings)

    // 检查本地图片在IndexedDB中的存在性
    const currentId = getSetting('background.localPath', '')
    if (currentId && currentId.startsWith('background_')) {
      checkImageExistsInDB(currentId)
    }
  } else {
  }
}, { immediate: true, deep: true })

// 组件挂载时检查IndexedDB中的图片和菜单
onMounted(async () => {
  console.log('SettingsSidebar: 组件挂载')

  const currentId = getSetting('background.localPath', '')

  if (currentId && currentId.startsWith('background_')) {
    await checkImageExistsInDB(currentId)
  } else {
  }

  // 检查是否有自定义菜单
  hasCustomMenu.value = await hasCustomMenuData()
})

// 更新设置
const updateSetting = (path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((obj, key) => obj[key] || (obj[key] = {}), localSettings.value)
  target[lastKey] = value
  emit('update:settings', localSettings.value)
}

// 重置设置为默认值
const resetToDefaults = () => {
  localSettings.value = {
    layout: { default: 'ios' },
    theme: { default: 'light' },
    search: { enabled: true },
    background: { enabled: false, url: '', localPath: '' },
    weather: { enabled: false, city: '深圳' },
    other: { showCopyButton: true }
  }
  emit('update:settings', localSettings.value)
}

// 主题选项
const themeOptions = [
  { value: 'auto', label: '自动', icon: Monitor, description: '跟随系统主题' },
  { value: 'light', label: '浅色', icon: Sun, description: '浅色主题' },
  { value: 'dark', label: '深色', icon: Moon, description: '深色主题' }
]

// 布局选项
const layoutOptions = [
  { value: 'ios', label: 'iOS模式', description: '大图标网格布局' },
  { value: 'list', label: '列表模式', description: '侧边栏列表布局' },
  { value: 'grid', label: '网格模式', description: '卡片式网格布局' }
]

// 处理本地文件选择
const handleLocalFileSelect = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      console.log('选择文件:', file.name)

      // 删除旧的图片（如果有）
      const oldId = getSetting('background.localPath', '')
      if (oldId && oldId.startsWith('background_')) {
        await deleteImage(oldId)
      }

      // 保存新图片到 IndexedDB
      const imageId = await saveImage(file)
      updateSetting('background.localPath', imageId)

      // 检查新保存的图片是否存在
      checkImageExistsInDB(imageId)
    } catch (error) {
      console.error('保存本地图片失败')
    }
  }
}

// 检查IndexedDB中是否存在图片
const checkImageInIndexedDB = async (imageId) => {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(imageId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(!!request.result)
    })
  } catch (error) {
    console.error('检查IndexedDB失败')
    return false
  }
}

// 清除本地背景图片（只删除background_前缀的图片，避免影响其他图片）
const clearLocalImage = async () => {
  try {
    const currentId = getSetting('background.localPath', '')
    console.log('clearLocalImage 被调用，当前 localPath:', currentId)

    if (currentId && currentId.startsWith('background_')) {
      // 检查IndexedDB中是否真的存在这张图片
      const existsInDB = await checkImageInIndexedDB(currentId)

      // 无论IndexedDB中是否存在，都尝试删除并清除设置
      await deleteImage(currentId)
      updateSetting('background.localPath', '')

      // 图片已删除，无需更新状态

    } else {
    }
  } catch (error) {
    console.error('清除本地背景图片失败')
  }
}

// 处理菜单文件导入
const handleMenuImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.name.toLowerCase().endsWith('.yaml') && !file.name.toLowerCase().endsWith('.yml')) {
    importStatus.value = 'error'
    importMessage.value = '请选择 YAML 格式的文件 (.yaml 或 .yml)'
    return
  }

  isImporting.value = true
  importStatus.value = 'loading'
  importMessage.value = '正在解析文件...'

  try {
    const fileContent = await file.text()

    // 验证YAML格式
    let parsedData
    try {
      parsedData = yaml.load(fileContent)
    } catch (yamlError) {
      throw new Error('YAML格式不正确，请检查文件内容')
    }

    // 验证数据结构
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('文件内容必须是一个有效的YAML对象')
    }

    // 检查是否包含categories结构
    if (!parsedData.categories || !Array.isArray(parsedData.categories)) {
      throw new Error('YAML文件必须包含categories数组')
    }

    // 验证每个分类的结构
    for (const category of parsedData.categories) {
      if (!category.name || !category.id) {
        throw new Error('每个分类必须有name和id字段')
      }
      if (!category.groups || !Array.isArray(category.groups)) {
        throw new Error(`分类 "${category.name}" 必须有groups数组`)
      }

      for (const group of category.groups) {
        if (!group.name || !group.links || !Array.isArray(group.links)) {
          throw new Error(`分类 "${category.name}" 中的分组必须有name和links数组`)
        }

        for (const link of group.links) {
          if (!link.title || !link.url) {
            throw new Error(`分组 "${group.name}" 中的链接必须有title和url字段`)
          }
        }
      }
    }

    // 保存到IndexedDB
    await saveMenuData(parsedData)
    hasCustomMenu.value = true
    importStatus.value = 'success'
    importMessage.value = '菜单导入成功！'

    // 通知父组件刷新菜单数据
    emit('menu-imported')

  } catch (error) {
    console.error('菜单导入失败:', error)
    importStatus.value = 'error'
    importMessage.value = error.message || '导入失败，请检查文件格式'
  } finally {
    isImporting.value = false
    // 3秒后清除状态消息
    setTimeout(() => {
      importStatus.value = ''
      importMessage.value = ''
    }, 3000)
  }
}

// 清除自定义菜单
const clearCustomMenu = async () => {
  try {
    await deleteMenuData()
    hasCustomMenu.value = false
    importStatus.value = 'success'
    importMessage.value = '自定义菜单已清除，将使用默认菜单'

    // 通知父组件刷新菜单数据
    emit('menu-imported')

    // 3秒后清除状态消息
    setTimeout(() => {
      importStatus.value = ''
      importMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('清除菜单失败:', error)
    importStatus.value = 'error'
    importMessage.value = '清除菜单失败'
  }
}

</script>

<template>
  <div
    class="fixed inset-0 z-50"
    v-show="isOpen"
  >
    <!-- 透明拦截层 - 覆盖整个左侧区域 -->
    <div
      class="absolute inset-0 transition-all duration-300 cursor-pointer"
      :class="[
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        currentTheme === 'dark' ? 'bg-black/20' : 'bg-black/10'
      ]"
      @click="isOpen = false"
    ></div>

    <!-- 侧边栏 -->
    <div
      class="absolute right-0 top-0 h-full w-96 max-w-[90vw] backdrop-blur-2xl border-l transform transition-transform duration-300 flex flex-col pointer-events-auto"
      :class="[
        isOpen ? 'translate-x-0' : 'translate-x-full',
        currentTheme === 'dark'
          ? 'bg-[#3C3F41]/95 border-white/5 shadow-[-15px_0_40px_rgba(0,0,0,0.3)]'
          : 'bg-white/90 border-gray-200/30 shadow-[-15px_0_40px_rgba(0,0,0,0.1)]'
      ]"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b transition-colors duration-300 flex-shrink-0"
           :class="currentTheme === 'dark' ? 'border-white/10' : 'border-gray-300/20'">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Settings class="w-4 h-4 text-white" />
          </div>
          <h2 class="text-xl font-bold transition-colors duration-300"
              :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">系统设置</h2>
        </div>
        <button
          @click="isOpen = false"
          class="p-2 rounded-lg transition-colors duration-300"
          :class="currentTheme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-500/10'"
        >
          <X class="w-5 h-5 transition-colors duration-300"
             :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'" />
        </button>
      </div>

      <!-- 设置内容 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8 allow-scroll min-h-0">
        <!-- 主题设置 -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <Palette class="w-5 h-5 text-blue-400" />
            <h3 class="text-lg font-semibold transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">主题设置</h3>
          </div>
          <div class="flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors duration-300"
               :class="currentTheme === 'dark' ? 'bg-white/10 shadow-inner' : 'bg-gray-500/10 shadow-inner'">
            <button
              v-for="theme in themeOptions"
              :key="theme.value"
              @click="updateSetting('theme.default', theme.value)"
              class="flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-300 transform"
              :class="localSettings.theme?.default === theme.value
                ? (currentTheme === 'dark' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-blue-500 text-white shadow-lg scale-105')
                : (currentTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/20 hover:scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/20 hover:scale-105')"
              :title="theme.description"
            >
              <component :is="theme.icon" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 布局设置 -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <Layout class="w-5 h-5 text-green-400" />
            <h3 class="text-lg font-semibold transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">布局设置</h3>
          </div>
          <div class="flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors duration-300"
               :class="currentTheme === 'dark' ? 'bg-white/10 shadow-inner' : 'bg-gray-500/10 shadow-inner'">
            <button
              v-for="layout in layoutOptions"
              :key="layout.value"
              @click="updateSetting('layout.default', layout.value)"
              class="flex items-center justify-center w-16 h-12 rounded-lg transition-all duration-300 transform"
              :class="localSettings.layout?.default === layout.value
                ? (currentTheme === 'dark' ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-green-500 text-white shadow-lg scale-105')
                : (currentTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/20 hover:scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/20 hover:scale-105')"
              :title="layout.description"
            >
              <span class="text-xs font-medium leading-tight">{{ layout.label }}</span>
            </button>
          </div>
        </div>

        <!-- 搜索设置 -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <Search class="w-5 h-5 text-yellow-400" />
            <h3 class="text-lg font-semibold transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">搜索设置</h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">启用搜索</div>
                <div class="text-sm transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">是否显示搜索功能</div>
              </div>
              <button
                @click="updateSetting('search.enabled', !getSetting('search.enabled', true))"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :class="getSetting('search.enabled', true) ? 'bg-blue-600' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300"
                  :class="getSetting('search.enabled', true) ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- 背景设置 -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <Image class="w-5 h-5 text-purple-400" />
            <h3 class="text-lg font-semibold transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">背景设置</h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">自定义背景</div>
                <div class="text-sm transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">使用自定义背景图片</div>
              </div>
              <button
                @click="updateSetting('background.enabled', !getSetting('background.enabled', false))"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :class="getSetting('background.enabled', false) ? 'bg-blue-600' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300"
                  :class="getSetting('background.enabled', false) ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div v-if="getSetting('background.enabled', false)" class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium transition-colors duration-300"
                       :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">背景图片URL</label>
                <input
                  type="url"
                  :value="getSetting('background.url', '')"
                  @input="updateSetting('background.url', $event.target.value)"
                  class="w-full px-3 py-2 rounded-lg border transition-colors duration-300"
                  :class="currentTheme === 'dark'
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50'
                    : 'bg-gray-500/10 border-gray-300/30 text-gray-900 placeholder-gray-600 focus:border-blue-500/50'"
                  placeholder="https://example.com/background.jpg"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium transition-colors duration-300"
                       :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">本地图片</label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleLocalFileSelect"
                  class="hidden"
                />
                <div class="flex space-x-2">
                  <button
                    @click="$refs.fileInput?.click()"
                    class="flex-1 px-4 py-3 rounded-lg border transition-colors duration-300 flex items-center justify-center space-x-2"
                    :class="currentTheme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      : 'bg-gray-500/10 border-gray-300/30 text-gray-900 hover:bg-gray-500/20'"
                  >
                    <Image class="w-4 h-4" />
                    <span>{{ hasLocalBackground ? '已选择图片' : '选择本地图片' }}</span>
                  <!-- Debug info -->
                  <span class="text-xs opacity-50 ml-2">{{ getSetting('background.localPath', '').substring(0, 10) }}</span>
                  </button>

                  <button
                    @click="clearLocalImage"
                    class="px-3 py-3 rounded-lg border transition-colors duration-300 flex items-center justify-center"
                    :class="currentTheme === 'dark'
                      ? (hasLocalBackground ? 'bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30' : 'bg-gray-600/20 border-gray-500/30 text-gray-500 hover:bg-gray-600/30')
                      : (hasLocalBackground ? 'bg-red-500/10 border-red-300/30 text-red-600 hover:bg-red-500/20' : 'bg-gray-500/10 border-gray-300/30 text-gray-400 hover:bg-gray-500/20')"
                    :title="hasLocalBackground ? '清除本地图片 (' + getSetting('background.localPath', '').substring(0, 20) + ')' : '没有本地图片可清除'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 天气设置 -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <Cloud class="w-5 h-5 text-cyan-400" />
            <h3 class="text-lg font-semibold transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">天气设置</h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">显示天气</div>
                <div class="text-sm transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">在界面中显示天气信息</div>
              </div>
              <button
                @click="updateSetting('weather.enabled', !getSetting('weather.enabled', false))"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :class="getSetting('weather.enabled', false) ? 'bg-blue-600' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300"
                  :class="getSetting('weather.enabled', false) ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div v-if="getSetting('weather.enabled', false)" class="space-y-2">
              <label class="block text-sm font-medium transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">城市名称</label>
              <input
                type="text"
                :value="getSetting('weather.city', '深圳')"
                @input="updateSetting('weather.city', $event.target.value)"
                class="w-full px-3 py-2 rounded-lg border transition-colors duration-300"
                :class="currentTheme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50'
                  : 'bg-gray-500/10 border-gray-300/30 text-gray-900 placeholder-gray-600 focus:border-blue-500/50'"
                placeholder="输入城市名称"
              />
            </div>
          </div>
        </div>

        <!-- 菜单导入设置 -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <Upload class="w-5 h-5 text-indigo-400" />
            <h3 class="text-lg font-semibold transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">菜单管理</h3>
          </div>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">导入菜单文件</label>
              <input
                ref="menuFileInput"
                type="file"
                accept=".yaml,.yml"
                @change="handleMenuImport"
                class="hidden"
              />
              <div class="space-y-2">
                <div class="flex space-x-2">
                  <button
                    @click="$refs.menuFileInput?.click()"
                    :disabled="isImporting"
                    class="flex-1 px-4 py-3 rounded-lg border transition-colors duration-300 flex items-center justify-center space-x-2"
                    :class="currentTheme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-gray-500/10 border-gray-300/30 text-gray-900 hover:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed'"
                  >
                    <FileText class="w-4 h-4" />
                    <span>{{ hasCustomMenu ? '重新导入菜单' : '导入菜单文件' }}</span>
                  </button>

                  <button
                    v-if="hasCustomMenu"
                    @click="clearCustomMenu"
                    :disabled="isImporting"
                    class="px-3 py-3 rounded-lg border transition-colors duration-300 flex items-center justify-center"
                    :class="currentTheme === 'dark'
                      ? 'bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 disabled:opacity-50'
                      : 'bg-red-500/10 border-red-300/30 text-red-600 hover:bg-red-500/20 disabled:opacity-50'"
                    title="清除自定义菜单"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <!-- 状态提示 -->
                <div v-if="importMessage" class="text-sm p-2 rounded-lg transition-colors duration-300"
                     :class="importStatus === 'success'
                       ? (currentTheme === 'dark' ? 'bg-green-600/20 text-green-400' : 'bg-green-500/10 text-green-600')
                       : importStatus === 'error'
                       ? (currentTheme === 'dark' ? 'bg-red-600/20 text-red-400' : 'bg-red-500/10 text-red-600')
                       : (currentTheme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-500/10 text-blue-600')">
                  <div class="flex items-center space-x-2">
                    <div v-if="importStatus === 'loading'" class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    <span>{{ importMessage }}</span>
                  </div>
                </div>

                <!-- 帮助信息 -->
                <div class="text-xs transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'">
                  <div>支持 .yaml 或 .yml 格式文件</div>
                  <div v-if="hasCustomMenu" class="mt-1 text-green-500">✓ 已导入自定义菜单</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他设置 -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <Settings class="w-5 h-5 text-gray-400" />
            <h3 class="text-lg font-semibold transition-colors duration-300"
                :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">其他设置</h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-white' : 'text-gray-900'">显示复制按钮</div>
                <div class="text-sm transition-colors duration-300"
                     :class="currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'">悬停时显示链接复制按钮</div>
              </div>
              <button
                @click="updateSetting('other.showCopyButton', !getSetting('other.showCopyButton', true))"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :class="getSetting('other.showCopyButton', true) ? 'bg-blue-600' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300"
                  :class="getSetting('other.showCopyButton', true) ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- 重置按钮 -->
        <div class="mt-8 pt-6 border-t transition-colors duration-300"
             :class="currentTheme === 'dark' ? 'border-white/10' : 'border-gray-300/20'">
          <button
            @click="resetToDefaults"
            class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-300"
          >
            <Settings class="w-4 h-4 text-red-400" />
            <span class="text-red-400 font-medium">重置为默认设置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>