import yaml from 'js-yaml'

export async function loadMenuData() {
  try {
    const response = await fetch('/menu.yaml')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const yamlText = await response.text()
    return yaml.load(yamlText)
  } catch (error) {
    console.error('加载菜单数据失败:', error)
    return null
  }
}

export async function loadSettings() {
  try {
    const response = await fetch('/settings.yaml')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const yamlText = await response.text()
    return yaml.load(yamlText)
  } catch (error) {
    console.error('加载设置失败:', error)
    return null
  }
}