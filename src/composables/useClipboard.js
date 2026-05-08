import { useClipboard } from '@vueuse/core'
import { ref, computed } from 'vue'

export function useLinkClipboard() {
  const { copy, copied } = useClipboard()
  const isCopying = ref(false)

  const copyLink = async (url) => {
    try {
      isCopying.value = true
      await copy(url)

      // 延迟重置复制状态
      setTimeout(() => {
        isCopying.value = false
      }, 2000)
    } catch (error) {
      console.error('复制失败:', error)
      isCopying.value = false
    }
  }

  return {
    copyLink,
    isCopying: computed(() => isCopying.value || copied.value)
  }
}