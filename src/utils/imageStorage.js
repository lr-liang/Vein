// IndexedDB 存储本地背景图片
export const DB_NAME = 'VeinImageStorage'
export const STORE_NAME = 'backgrounds'
export const DB_VERSION = 1

// 打开数据库
export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// 保存图片数据
export const saveImage = async (file) => {
  try {
    const db = await openDB()
    const id = 'background_' + Date.now()
    const blob = file

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(blob, id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  } catch (error) {
    console.error('保存图片失败:', error)
    throw error
  }
}

// 获取图片 URL
export const getImageUrl = async (id) => {
  if (!id) return null

  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onerror = () => {
        console.error('获取图片失败:', request.error)
        resolve(null)
      }

      request.onsuccess = () => {
        if (request.result) {
          const url = URL.createObjectURL(request.result)
          resolve(url)
        } else {
          resolve(null)
        }
      }
    })
  } catch (error) {
    console.error('获取图片失败:', error)
    return null
  }
}

// 删除图片
export const deleteImage = async (id) => {
  if (!id) return

  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error('删除图片失败:', error)
  }
}
