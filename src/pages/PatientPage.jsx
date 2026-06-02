import { useState, useMemo } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import { createPatient, updatePatient, getPatientById, getAllPatients } from '../services/PatientService.js'
import { useApp } from '../context/AppContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import FormGroup from '../components/ui/FormGroup.jsx'
import SkeletonTable from '../components/ui/SkeletonTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Icon from '../components/ui/Icon.jsx'
import { formatDate, calcAge } from '../utils/dateUtils.js'
import {PATIENT_STATUS} from '../utils/constants.js'

const EMPTY_FORM = {
    fullName: '', email: '', status: 'ACTIVE',
}

export default function PatientPage() {
    const { toast } = useApp()
    const { data, loading, error, refetch } = useFetch(getAllPatients)

    const [search, setSearch] = useState('')
    const [filterStatus, setFilter] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [modalOpen, setModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [viewItem, setViewItem] = useState(null)

    const patients = useMemo(() => {
        const list = data?.content ?? data?.data ?? data ?? []
        return list.filter(p => {
            const name = `${p.fullName}`.toLowerCase()
            const matchSearch = !search || name.includes(search.toLowerCase())
            const matchStatus = !filterStatus || p.status === filterStatus
            return matchSearch && matchStatus
        })
    }, [data, search, filterStatus])

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setModal(true)
    }

    const openEdit = (p) => {
        setForm({
            fullName: p.fullName,
            email: p.email,
            status: p.status ?? 'ACTIVE',
        })
        setEditId(p.patientId)
        setModal(true)
    }

    const handleSave = async () => {
        if (!form.fullName.trim() || !form.email.trim()) {
            toast.error('Nombre completo y correo electrónico son obligatorios')
            return
        }
        setSaving(true)
        try {
            if (editId) {
                await updatePatient(editId, form)
                toast.success('Paciente actualizado')
            } else {
                console.log(form)
                await createPatient(form)
                toast.success('Paciente creado exitosamente')
            }
            setModal(false)
            refetch()
        } catch (err) {
            toast.error(err.message ?? 'Error al guardar el paciente')
        } finally {
            setSaving(false)
        }
    }

    const change = (field) => e => setForm(f => ({ ...f, [field]: e.target.value }))

    return (
        <div>
            <PageHeader title="Pacientes" subtitle={`${patients.length} paciente${patients.length !== 1 ? 's' : ''} registrados`}>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Icon name="plus" size={14} /> Nuevo Paciente
                </button>
            </PageHeader>

            <div className="filter-row">
                <div className="search-bar">
                    <span className="search-bar-icon"><Icon name="search" size={14} /></span>
                    <input
                        placeholder="Buscar por nombre o documento…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className="select-input" value={filterStatus} onChange={e => setFilter(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                </select>
            </div>

            <div className="table-wrapper">
                {loading && <SkeletonTable rows={6} cols={6} />}
                {error && <EmptyState icon="alert" title="Error al cargar" sub={error.message} />}
                {!loading && !error && patients.length === 0 && (
                    <EmptyState
                        icon="users"
                        title="Sin pacientes"
                        sub={search ? 'Intenta con otro término de búsqueda' : 'Registra el primer paciente'}
                        action={
                            <button className="btn btn-primary btn-sm" onClick={openCreate}>
                                <Icon name="plus" size={13} /> Nuevo
                            </button>
                        }
                    />
                )}
                {!loading && !error && patients.length > 0 && (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(p => {
                                const st = PATIENT_STATUS[p.status] ?? { label: p.status, variant: 'neutral' }
                                return (
                                    <tr key={p.patientId}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                                                {p.fullName}
                                            </div>
                                            {p.email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.email}</div>}
                                        </td>
                                        <td><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-ghost btn-icon" title="Ver" onClick={() => setViewItem(p)}>
                                                    <Icon name="eye" size={14} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title="Editar" onClick={() => openEdit(p)}>
                                                    <Icon name="edit" size={14} />
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
                title={editId ? 'Editar paciente' : 'Nuevo paciente'}
                size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setModal(false)} disabled={saving}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando…' : editId ? 'Actualizar' : 'Crear paciente'}
                        </button>
                    </>
                }
            >
                <div className="form-grid">
                    <FormGroup label="Nombre Completo" required>
                        <input className="form-control" value={form.fullName} onChange={change('fullName')} placeholder="Nombre completo" />
                    </FormGroup>
                    <FormGroup label="Correo electrónico">
                        <input type="email" className="form-control" value={form.email} onChange={change('email')} placeholder="correo@ejemplo.com" />
                    </FormGroup>
                    {editId && (
                        <FormGroup label="Estado">
                            <select className="form-control" value={form.status} onChange={change('status')}>
                                <option value="ACTIVE">Activo</option>
                                <option value="INACTIVE">Inactivo</option>
                            </select>
                        </FormGroup>
                    )}
                </div>
            </Modal>

            {viewItem && (
                <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Detalle del paciente"
                    footer={<button className="btn btn-secondary" onClick={() => setViewItem(null)}>Cerrar</button>}
                >
                    <div className="info-row"><div className="info-row-label">Nombre completo</div>
                        <div className="info-row-value">{viewItem.fullName}</div></div>
                    <div className="info-row"><div className="info-row-label">Correo</div>
                        <div className="info-row-value">{viewItem.email ?? '—'}</div></div>
                    <div className="info-row"><div className="info-row-label">Estado</div>
                        <div className="info-row-value">
                            <Badge variant={PATIENT_STATUS[viewItem.status]?.variant ?? 'neutral'}>
                                {PATIENT_STATUS[viewItem.status]?.label ?? viewItem.status}
                            </Badge>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    )
}