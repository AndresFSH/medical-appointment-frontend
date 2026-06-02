import { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import {
    createAppointment, getAppointmentById, getAppointments, confirmAppointment,
    cancelAppointment, completeAppointment, setAsNoShowAppointment
} from '../services/AppointmentService';
import { getAllPatients, getPatientById } from '../services/PatientService';
import { getDoctorById, getAllDoctors } from '../services/DoctorService';
import { getOffices } from '../services/OfficeService';
import { getAppointmentTypes } from '../services/AppointmentTypeService.js';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormGroup from '../components/ui/FormGroup.jsx';
import SkeletonTable from '../components/ui/SkeletonTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Icon from '../components/ui/Icon.jsx';
import { APPOINTMENT_STATUS } from '../utils/constants.js';
import { formatDate, formatTime, todayISO } from '../utils/DateUtils.js'

const EMPTY_FORM = {
    patientId: '', doctorId: '', officeId: '', typeId: '',
    date: todayISO(), startTime: '', status: 'SCHEDULED',
};

export default function AppointmentPage() {
    const { toast } = useApp()
    const { data, loading, error, refetch } = useFetch(getAppointments)
    const { data: patientsData } = useFetch(getAllPatients)
    const { data: doctorsData } = useFetch(getAllDoctors)
    const { data: officesData } = useFetch(getOffices)
    const { data: typesData } = useFetch(getAppointmentTypes)

    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterDate, setFilterDate] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [modalOpen, setModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [viewItem, setViewItem] = useState(null)
    const [statusModal, setStatusModal] = useState(null)

    const patients = patientsData?.content ?? patientsData?.data ?? patientsData ?? []
    const doctors = doctorsData?.content ?? doctorsData?.data ?? doctorsData ?? []
    const offices = officesData?.content ?? officesData?.data ?? officesData ?? []
    const types = typesData?.content ?? typesData?.data ?? typesData ?? []

    const appointments = useMemo(() => {
        const list = data?.content ?? data?.data ?? data ?? []
        return list.filter(a => {
            const pName = a.patientName ?? `${a.patient?.fullname ?? ''}`
            const dName = a.doctorName ?? `${a.doctor?.fullname ?? ''}`
            const text = `${pName} ${dName}`.toLowerCase()
            const matchSearch = !search || text.includes(search.toLowerCase())
            const matchStatus = !filterStatus || a.status === filterStatus
            const matchDate = !filterDate || (a.date ?? a.appointmentDate ?? '').startsWith(filterDate)
            return matchSearch && matchStatus && matchDate
        })
    }, [data, search, filterStatus, filterDate])

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true) }

    const handleSave = async () => {
        if (!form.patientId || !form.doctorId || !form.officeId || !form.typeId || !form.date || !form.startTime) {
            toast.error('Todos los campos son obligatorios')
            return
        }
        setSaving(true)
        try {
            const payload = {
                ...form,
                patientId: String(form.patientId),
                doctorId: String(form.doctorId),
                officeId: form.officeId ? String(form.officeId) : undefined,
                typeId: form.typeId ? String(form.typeId) : undefined,
                startAt: `${form.date}T${form.startTime}:00`
            }
            await createAppointment(payload)
            toast.success('Cita creada')

            setModal(false)
            refetch()
        } catch (err) {
            toast.error(err.message ?? 'Error al guardar la cita')
        } finally {
            setSaving(false)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            if (newStatus === 'CONFIRMED') await confirmAppointment(id)
            if (newStatus === 'CANCELLED') await cancelAppointment(id, { cancellationReason: 'Cancelada desde el panel' })
            if (newStatus === 'COMPLETED') await completeAppointment(id, { observations: 'Completada desde el panel' })
            if (newStatus === 'NO_SHOW') await setAsNoShowAppointment(id)

            toast.success(`Estado actualizado a "${APPOINTMENT_STATUS[newStatus]?.label ?? newStatus}"`)
            setStatusModal(null)
            refetch()
        } catch (err) {
            toast.error(err.message ?? 'Error al actualizar el estado')
        }
    }

    const change = (field) => e => setForm(f => ({ ...f, [field]: e.target.value }))

    const getPatientName = (a) => {
        if (a.patient?.fullName) return a.patient.fullName
        const p = patients.find(p => p.patientId === a.patient?.patientId)
        return p?.fullName ?? '—'
    }

    const getDoctorName = (a) => {
        if (a.doctor?.fullName) return a.doctor.fullName
        const d = doctors.find(d => d.doctorId === a.doctor?.doctorId)
        return d?.fullName ?? '—'
    }

    const statusActions = {
        SCHEDULED: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: [],
        NO_SHOW: [],
    }

    return (
        <div>
            <PageHeader title="Citas" subtitle={`${appointments.length} cita${appointments.length !== 1 ? 's' : ''}`}>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Icon name="plus" size={14} /> Nueva Cita
                </button>
            </PageHeader>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {Object.entries(APPOINTMENT_STATUS).map(([key, { label, variant }]) => {
                    const count = (data?.content ?? data?.data ?? data ?? []).filter(a => a.status === key).length
                    return (
                        <button key={key}
                            className={`btn btn-sm ${filterStatus === key ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilterStatus(f => f === key ? '' : key)}
                        >
                            <Badge variant={variant} dot={false}>{label}</Badge>
                            <span style={{ marginLeft: 4, fontWeight: 700 }}>{count}</span>
                        </button>
                    )
                })}
            </div>

            <div className="filter-row">
                <div className="search-bar">
                    <span className="search-bar-icon"><Icon name="search" size={14} /></span>
                    <input placeholder="Buscar paciente o doctor…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <input type="date" className="select-input" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                    style={{ fontFamily: 'var(--font)' }} />
                {filterDate && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilterDate('')}>
                        <Icon name="close" size={12} /> Limpiar fecha
                    </button>
                )}
            </div>

            <div className="table-wrapper">
                {loading && <SkeletonTable rows={6} cols={7} />}
                {error && <EmptyState icon="alert" title="Error al cargar" sub={error.message} />}
                {!loading && !error && appointments.length === 0 && (
                    <EmptyState icon="clock" title="Sin citas"
                        sub={search || filterStatus || filterDate ? 'Ninguna cita coincide con los filtros' :
                            'No hay citas registradas'}
                        action={<button className="btn btn-primary btn-sm"
                            onClick={openCreate}><Icon name="plus" size={13} /> Nueva cita</button>}
                    />
                )}
                {!loading && !error && appointments.length > 0 && (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Doctor</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Consultorio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(a => {
                                const st = APPOINTMENT_STATUS[a.status] ?? { label: a.status, variant: 'neutral' }
                                const officeName = a.office?.name ?? offices.find(o => o.officeId === a.office)?.name ?? '—'
                                const actions = statusActions[a.status] ?? []
                                return (
                                    <tr key={a.appointmentId}>
                                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{getPatientName(a)}</td>
                                        <td>{getDoctorName(a)}</td>
                                        <td style={{ fontSize: 12 }}>{formatDate(a.startAt)}</td>
                                        <td style={{ fontSize: 12 }}>{formatTime(a.startAt)}</td>
                                        <td style={{ fontSize: 12 }}>{officeName}</td>
                                        <td>
                                            {actions.length > 0
                                                ? (
                                                    <button className={`badge badge-${st.variant}`}
                                                        style={{ border: 'none', cursor: 'pointer' }}
                                                        onClick={() => setStatusModal({ id: a.appointmentId, current: a.status })}>
                                                        <span className="badge-dot" />
                                                        {st.label} <Icon name="chevron-down" size={10} style={{ marginLeft: 4 }} />
                                                    </button>
                                                )
                                                : <Badge variant={st.variant}>{st.label}</Badge>
                                            }
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-ghost btn-icon" title="Ver" onClick={() => setViewItem(a)}>
                                                    <Icon name="eye" size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal open={modalOpen} onClose={() => setModal(false)}
                title={'Nueva cita'} size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setModal(false)} disabled={saving}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando…' : 'Crear cita'}
                        </button>
                    </>
                }
            >
                <div className="form-grid">
                    <FormGroup label="Paciente" required colSpan={2}>
                        <select className="form-control" value={form.patientId} onChange={change('patientId')}>
                            <option value="">— Seleccionar paciente —</option>
                            {patients.map(p => <option key={p.patientId} value={String(p.patientId)} > {p.fullName} </option>)}
                        </select>
                    </FormGroup>
                    <FormGroup label="Doctor" required colSpan={2}>
                        <select className="form-control" value={form.doctorId} onChange={change('doctorId')}>
                            <option value="">— Seleccionar doctor —</option>
                            {doctors.map(d => <option key={d.doctorId} value={String(d.doctorId)}>{d.fullName}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup label="Consultorio" colSpan={2}>
                        <select className="form-control" value={form.officeId} onChange={change('officeId')}>
                            <option value="">— Sin asignar —</option>
                            {offices.filter(o => o.status !== 'INACTIVE').map(o => <option key={o.officeId} value={String(o.officeId)}>{o.name}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup label="Tipo de cita" colspan={2}>
                        <select className="form-control" value={form.typeId} onChange={change('typeId')}>
                            <option value="">- Seleccionar tipo de cita -</option>
                            {types.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup label="Fecha" required>
                        <input type="date" className="form-control" value={form.date} onChange={change('date')} />
                    </FormGroup>
                    <FormGroup label="Hora inicio">
                        <input type="time" className="form-control" value={form.startTime} onChange={change('startTime')} />
                    </FormGroup>
                </div>
            </Modal>

            {statusModal && (
                <Modal open size="sm" onClose={() => setStatusModal(null)} title="Cambiar estado de cita">
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                        Estado actual: <Badge variant={APPOINTMENT_STATUS[statusModal.current]?.variant ?? 'neutral'}>
                            {APPOINTMENT_STATUS[statusModal.current]?.label ?? statusModal.current}
                        </Badge>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(statusActions[statusModal.current] ?? []).map(ns => {
                            const st = APPOINTMENT_STATUS[ns]
                            return (
                                <button key={ns} className="btn btn-secondary w-full"
                                    style={{ justifyContent: 'flex-start' }}
                                    onClick={() => handleStatusChange(statusModal.id, ns)}
                                >
                                    <Badge variant={st.variant} dot={false}>{st.label}</Badge>
                                    <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-muted)' }}>→ Cambiar a este estado</span>
                                </button>
                            )
                        })}
                    </div>
                </Modal>
            )}

            {viewItem && (
                <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Detalle de la cita"
                    footer={
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary" onClick={() => { setViewItem(null); openEdit(viewItem) }}>
                                <Icon name="edit" size={13} /> Editar
                            </button>
                            <button className="btn btn-secondary" onClick={() => setViewItem(null)}>Cerrar</button>
                        </div>
                    }
                >
                    {[
                        ['Paciente', getPatientName(viewItem)],
                        ['Doctor', getDoctorName(viewItem)],
                        ['Fecha', formatDate(viewItem.startAt)],
                        ['Hora', `${formatTime(viewItem.startAt?.slice(11,16))} — ${formatTime(viewItem.endAt?.slice(11,16))}`],
                        ['Consultorio', viewItem.office?.name ?? offices.find(o => o.officeId === viewItem.officeId)?.name ?? '—'],
                    ].map(([lbl, val]) => (
                        <div key={lbl} className="info-row">
                            <div className="info-row-label">{lbl}</div>
                            <div className="info-row-value">{val}</div>
                        </div>
                    ))}
                    <div className="info-row">
                        <div className="info-row-label">Estado</div>
                        <div className="info-row-value">
                            <Badge variant={APPOINTMENT_STATUS[viewItem.status]?.variant ?? 'neutral'}>
                                {APPOINTMENT_STATUS[viewItem.status]?.label ?? viewItem.status}
                            </Badge>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    )
}