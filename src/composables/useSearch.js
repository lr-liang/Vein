import { ref, computed } from 'vue'

export function useSearch(menuData) {
  const searchQuery = ref('')

  const filteredData = computed(() => {
    if (!menuData.value || !searchQuery.value.trim()) {
      return menuData.value
    }

    const query = searchQuery.value.toLowerCase().trim()

    const filtered = {
      categories: menuData.value.categories.map(category => ({
        ...category,
        groups: category.groups.map(group => ({
          ...group,
          links: group.links.filter(link =>
            link.title.toLowerCase().includes(query) ||
            link.description?.toLowerCase().includes(query) ||
            link.url.toLowerCase().includes(query)
          )
        })).filter(group => group.links.length > 0)
      })).filter(category => category.groups.length > 0)
    }

    return filtered
  })

  const clearSearch = () => {
    searchQuery.value = ''
  }

  const hasResults = computed(() => {
    if (!filteredData.value) return false
    return filteredData.value.categories.some(category =>
      category.groups.some(group => group.links.length > 0)
    )
  })

  return {
    searchQuery,
    filteredData,
    clearSearch,
    hasResults
  }
}