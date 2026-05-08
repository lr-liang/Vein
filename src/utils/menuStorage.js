// IndexedDB 存储菜单数据
export const MENU_DB_NAME = 'VeinMenuStorage'
export const MENU_STORE_NAME = 'menus'
export const MENU_DB_VERSION = 1

// 打开菜单数据库
export const openMenuDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MENU_DB_NAME, MENU_DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(MENU_STORE_NAME)) {
        db.createObjectStore(MENU_STORE_NAME)
      }
    }
  })
}

// 保存菜单数据
export const saveMenuData = async (menuData) => {
  try {
    const db = await openMenuDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MENU_STORE_NAME, 'readwrite')
      const store = transaction.objectStore(MENU_STORE_NAME)
      const request = store.put(menuData, 'current_menu')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(true)
    })
  } catch (error) {
    console.error('保存菜单数据失败:', error)
    throw error
  }
}

// 获取菜单数据
export const getMenuData = async () => {
  try {
    const db = await openMenuDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MENU_STORE_NAME, 'readonly')
      const store = transaction.objectStore(MENU_STORE_NAME)
      const request = store.get('current_menu')

      request.onerror = () => {
        console.error('获取菜单数据失败:', request.error)
        resolve(null)
      }

      request.onsuccess = () => {
        resolve(request.result || null)
      }
    })
  } catch (error) {
    console.error('获取菜单数据失败:', error)
    return null
  }
}

// 删除菜单数据
export const deleteMenuData = async () => {
  try {
    const db = await openMenuDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MENU_STORE_NAME, 'readwrite')
      const store = transaction.objectStore(MENU_STORE_NAME)
      const request = store.delete('current_menu')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(true)
    })
  } catch (error) {
    console.error('删除菜单数据失败:', error)
    return false
  }
}

// 检查是否存在自定义菜单数据
export const hasCustomMenuData = async () => {
  const menuData = await getMenuData()
  return menuData !== null
}