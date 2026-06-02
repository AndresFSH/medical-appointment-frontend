import { useState } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import { getAvailabilitySlots } from '../services/AvailabilityService.js'
import { getAllDoctors } from '../services/DoctorService.js'
import { getAppointmentTypes } from '../services/AppointmentTypeService.js'
import { useApp } from '../context/AppContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import FormGroup from '../components/ui/FormGroup.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Icon from '../components/ui/Icon.jsx'
import { todayISO } from '../utils/DateUtils.js'

// ─── Helpers ────────────────────────────────────────────────
/**
 * Extrae la hora "HH:MM" desde un LocalDateTime ISO
 * Ej: "2025-01-15T08:30:00" → "08:30"
 */
function slotTime(isoString) {
    if (!isoString) return '—'
    return isoString.split('T')[1]?.slice(0, 5) ?? '—'
}

/**
 * Calcula la duración en minutos entre dos ISO strings
 */
function slotDuration(startAt, endAt) {
    if (!startAt || !endAt) return null
    const diff = new Date(endAt) - new Date(startAt)
    return Math.round(diff / 60000)
}

// ─── Componente principal ────────────────────────────────────
export default function AvailabilityPage() {
    const { toast } = useApp()

    // ── Datos de selects ──────────────────────────────────────
    const { data: doctorsData } = useFetch(getAllDoctors)
    const { data: apptTypesData } = useFetch(getAppointmentTypes)

    const doctors = doctorsData?.content ?? doctorsData?.data ?? doctorsData ?? []
    const apptTypes = apptTypesData?.content ?? apptTypesData?.data ?? apptTypesData ?? []

    // ── Filtros del formulario de consulta ────────────────────
    const [doctorId, setDoctorId] = useState('')
    const [date, setDate] = useState(todayISO())
    const [typeId, setTypeId] = useState('')

    // ── Estado de la consulta ─────────────────────────────────
    const [slots, setSlots] = useState([])
    const [querying, setQuerying] = useState(false)
    const [queried, setQueried] = useState(false)
    const [queryError, setQueryError] = useState(null)

    // ── Consultar slots ───────────────────────────────────────
    const handleQuery = async () => {
        if (!doctorId) { toast.error('Selecciona un doctor'); return }
        if (!date) { toast.error('Selecciona una fecha'); return }
        if (!typeId) { toast.error('Selecciona un tipo de cita'); return }

        setQuerying(true)
        setQueryError(null)
        setSlots([])
        setQueried(false)

        try {
            const result = await getAvailabilitySlots(doctorId, date, typeId)
            const list = result?.content ?? result?.data ?? result ?? []
            setSlots(list)
            setQueried(true)
            if (list.length === 0) toast.info('No hay slots disponibles para los filtros seleccionados')
        } catch (e) {
            setQueryError(e.message ?? 'Error al consultar disponibilidad')
            toast.error(e.message ?? 'Error al consultar disponibilidad')
        } finally {
            setQuerying(false)
        }
    }


    // ── Datos del doctor y tipo seleccionado ──────────────────
    const selectedDoctor = doctors.find(d =>
        String(d.doctorId ?? d.id) === doctorId
    )
    const selectedType = apptTypes.find(t =>
        String(t.typeId ?? t.id) === typeId
    )

    // ─────────────────────────────────────────────────────────
    return (
        <div>
            <PageHeader
                title="Disponibilidad"
                subtitle="Consulta los horarios disponibles de un doctor"
            />

            {/* ── Panel de filtros ─────────────────────────────── */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <Icon name="filter" size={15} color="var(--accent)" />
                    <span className="card-title">Parámetros de consulta</span>
                </div>
                <div className="card-body">
                    <div className="form-grid">

                        <FormGroup label="Doctor" required>
                            <select
                                className="form-control"
                                value={doctorId}
                                onChange={e => { setDoctorId(e.target.value); setQueried(false); setSlots([]) }}
                            >
                                <option value="">— Seleccionar doctor —</option>
                                {doctors
                                    .filter(d => d.active !== false)
                                    .map(d => (
                                        <option key={d.doctorId ?? d.id} value={String(d.doctorId ?? d.id)}>
                                            {d.fullName ?? `${d.firstName} ${d.lastName}`}
                                        </option>
                                    ))}
                            </select>
                        </FormGroup>

                        <FormGroup label="Fecha" required>
                            <input
                                type="date"
                                className="form-control"
                                value={date}
                                min={todayISO()}
                                onChange={e => { setDate(e.target.value); setQueried(false); setSlots([]) }}
                            />
                        </FormGroup>

                        <FormGroup label="Tipo de cita" required>
                            <select
                                className="form-control"
                                value={typeId}
                                onChange={e => { setTypeId(e.target.value); setQueried(false); setSlots([]) }}
                            >
                                <option value="">— Seleccionar tipo —</option>
                                {apptTypes.map(t => (
                                    <option key={t.typeId ?? t.id} value={String(t.typeId ?? t.id)}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </FormGroup>

                        {/* Botón alineado al fondo del FormGroup */}
                        <FormGroup label=" ">
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleQuery}
                                disabled={querying || !doctorId || !date || !typeId}
                            >
                                {querying
                                    ? <><Icon name="refresh" size={14} /> Consultando…</>
                                    : <><Icon name="search" size={14} /> Consultar slots</>
                                }
                            </button>
                        </FormGroup>

                    </div>
                </div>
            </div>

            {/* ── Resultados ──────────────────────────────────── */}
            {queried && (
                <div>
                    {/* Cabecera de resultados */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                                {slots.length > 0
                                    ? `${slots.length} slot${slots.length !== 1 ? 's' : ''} disponible${slots.length !== 1 ? 's' : ''}`
                                    : 'Sin disponibilidad'
                                }
                            </div>
                            {selectedDoctor && selectedType && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {selectedDoctor.fullName ?? `${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                                    {' · '}
                                    {selectedType.name}
                                    {' · '}
                                    {new Date(date + 'T00:00:00').toLocaleDateString('es-CO', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </div>
                            )}
                        </div>

                        {slots.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--success-bg)', border: '1px solid var(--success)', display: 'inline-block' }} />
                                Disponible
                            </div>
                        )}
                    </div>

                    {/* Grid de slots */}
                    {slots.length === 0 && !queryError && (
                        <EmptyState
                            icon="calendar"
                            title="Sin slots disponibles"
                            sub="El doctor no tiene horarios disponibles para la fecha y tipo de cita seleccionados."
                        />
                    )}

                    {queryError && (
                        <EmptyState
                            icon="alert"
                            title="Error al consultar"
                            sub={queryError}
                            action={
                                <button className="btn btn-secondary btn-sm" onClick={handleQuery}>
                                    <Icon name="refresh" size={13} /> Reintentar
                                </button>
                            }
                        />
                    )}

                    {slots.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: 10,
                        }}>
                            {slots.map((slot, i) => {
                                const start = slotTime(slot.startAt)
                                const end = slotTime(slot.endAt)
                                const duration = slotDuration(slot.startAt, slot.endAt)
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 4,
                                            padding: '14px 10px',
                                            background: 'var(--success-bg)',
                                            border: '1.5px solid var(--success)',
                                            borderRadius: 'var(--radius)',
                                            transition: 'all var(--transition)',
                                            fontFamily: 'var(--font)',
                                        }}
                                    >
                                        <span style={{ fontSize: 16, fontWeight: 800, color: 'inherit' }}>
                                            {start}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'inherit', opacity: 0.8 }}>
                                            hasta {end}
                                        </span>
                                        {duration && (
                                            <span style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                marginTop: 2,
                                                padding: '2px 7px',
                                                borderRadius: 10,
                                                background: 'rgba(0,0,0,0.08)',
                                                color: 'inherit',
                                            }}>
                                                {duration} min
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Estado inicial — antes de consultar */}
            {!queried && !querying && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '52px 24px',
                    gap: 12,
                    background: 'var(--surface)',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: 'var(--accent-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                    }}>
                        <Icon name="calendar" size={26} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                        Selecciona los filtros y pulsa "Consultar slots"
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340 }}>
                        Elige un doctor, una fecha y un tipo de cita para ver los horarios disponibles.
                    </div>
                </div>
            )}
        </div>
    )
}
