import { ref, onMounted } from 'vue'
import { loadMenuData, loadSettings } from '../utils/yamlLoader'
import { getMenuData, hasCustomMenuData } from '../utils/menuStorage'

export function useDataLoader() {
  const menuData = ref(null)
  const settings = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const loadData = async () => {
    try {
      loading.value = true
      error.value = null

      const [menuResult, settingsResult] = await Promise.all([
        loadMenuData(),
        loadSettings()
      ])

      if (!menuResult) {
        throw new Error('无法加载菜单数据')
      }

      menuData.value = menuResult
      settings.value = settingsResult
    } catch (err) {
      error.value = err.message
      console.error('数据加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 加载菜单数据，优先从IndexedDB读取
  const loadMenuDataWithPriority = async () => {
    try {
      loading.value = true
      error.value = null

      // 首先尝试从IndexedDB获取自定义菜单
      const customMenu = await getMenuData()

      // 加载设置数据
      const settingsResult = await loadSettings()
      settings.value = settingsResult

      if (customMenu) {
        // 使用自定义菜单
        menuData.value = customMenu
        console.log('已从IndexedDB加载自定义菜单数据')
      } else {
        // 使用默认菜单
        const defaultMenu = await loadMenuData()
        if (!defaultMenu) {
          throw new Error('无法加载默认菜单数据')
        }
        menuData.value = defaultMenu
        console.log('已加载默认菜单数据')
      }
    } catch (err) {
      error.value = err.message
      console.error('数据加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadMenuDataWithPriority()
  })

  return {
    menuData,
    settings,
    loading,
    error,
    reload: loadData,
    reloadMenuData: loadMenuDataWithPriority
  }
}