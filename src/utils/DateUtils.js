const locale = 'es-CO'

/**
 * "15 ene 2025"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return dateStr }
}

/**
 * "15 ene 2025, 10:30"
 */
export const formatTime = (value) => {

  if (!value) return '—'

  try {
    const date = new Date(value)


    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const [h, m] = value.split(':').map(Number)

    const d = new Date()
    d.setHours(h, m, 0)

    return d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    console.error(err)
    return value
  }
}

/**
 * Age from ISO date string
 */
export const calcAge = (dateStr) => {
  if (!dateStr) return null
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

/**
 * Today as "YYYY-MM-DD"
 */
export const todayISO = () => new Date().toISOString().slice(0, 10)

/**
 * Relative time: "hace 3 días"
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'ahora mismo'
  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours} h`
  if (days < 30)  return `hace ${days} día${days !== 1 ? 's' : ''}`
  return formatDate(dateStr)
}