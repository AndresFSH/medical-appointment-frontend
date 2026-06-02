export const NAV_ITEMS = [
  { path: '/patients', label: 'Pacientes', icon: 'users' },
  { path: '/doctors', label: 'Doctores', icon: 'stethoscope' },
  { path: '/specialties', label: 'Catálogo', icon: 'book' },
  { path: '/offices', label: 'Consultorios', icon: 'building' },
  { path: '/availability', label: 'Disponibilidad', icon: 'calendar' },
  { path: '/appointments', label: 'Citas', icon: 'clock' },
  { path: '/appointment-types', label: 'Tipos de cita', icon: 'book' },
  { path: '/reports', label: 'Reportes', icon: 'chart' },
]

export const APPOINTMENT_STATUS = {
  SCHEDULED: { label: 'Programada', variant: 'info' },
  CONFIRMED: { label: 'Confirmada', variant: 'success' },
  COMPLETED: { label: 'Completada', variant: 'accent' },
  CANCELLED: { label: 'Cancelada', variant: 'danger' },
  NO_SHOW: { label: 'No asistió', variant: 'warning' },
}

export const PATIENT_STATUS = {
  ACTIVE: { label: 'Activo', variant: 'success' },
  INACTIVE: { label: 'Inactivo', variant: 'neutral' },
}

export const OFFICE_STATUS = {
  AVAILABLE: { label: 'Disponible', variant: 'success' },
  UNAVAILABLE: { label: 'Ocupado', variant: 'danger' },
  INACTIVE: { label: 'Inactivo', variant: 'neutral' },
}

export const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']