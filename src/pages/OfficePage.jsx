import { useState, useMemo } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import { createOffice, updateOffice, getOffices } from '../services/OfficeService.js'
import { useApp } from '../context/AppContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import FormGroup from '../components/ui/FormGroup.jsx'
import SkeletonTable from '../components/ui/SkeletonTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Icon from '../components/ui/Icon.jsx'
import { OFFICE_STATUS } from '../utils/constants.js'

const EMPTY_FORM = { name: '', location: '', status: 'AVAILABLE' }

export default function OfficePage() {
    const { toast } = useApp()
    const { data, loading, error, refetch } = useFetch(getOffices)

    const [search, setSearch] = useState('')
    const [filterStatus, setFilter] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [modalOpen, setModal] = useState(false)
    const [saving, setSaving] = useState(false)

    const offices = useMemo(() => {
        const list = data?.content ?? data?.data ?? data ?? []
        return list.filter(o => {
            const text = `${o.name ?? ''} ${o.location ?? ''}`.toLowerCase()
            return (!search || text.includes(search.toLowerCase())) &&
                (!filterStatus || o.status === filterStatus)
        })
    }, [data, search, filterStatus])

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setModal(true)
    }

    const openEdit = (o) => {
        setForm({
            name: o.name ?? '', location: o.location ?? '', status: o.status ?? 'AVAILABLE'
        })
        setEditId(o.officeId)
        setModal(true)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.location.trim()) {
            toast.error('Campos obligatorios')
            return
        }
        setSaving(true)

        try {
            if (editId) {
                await updateOffice(editId, form)
                toast.success('Consultorio actualizado')
            } else {
                await createOffice(form)
                toast.success('Consultorio creado correctamente')
            }
            setModal(false)
            refetch()
        } catch (err) {
            toast.error(err.message ?? 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const change = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const counts = useMemo(() => {
        const list = data?.content ?? data?.data ?? data ?? []
        return {
            available: list.filter(r => r.status === 'AVAILABLE').length,
            occupied: list.filter(r => r.status === 'UNAVAILABLE').length,
            maintenance: list.filter(r => r.status === 'MAINTENANCE').length,
        }
    }, [data])

    return (
        <div>
            <PageHeader title="Consultorios" subtitle="Gestión de espacios físicos">
                <button className="btn btn-primary" onClick={openCreate}>
                    <Icon name="plus" size={14} /> Nuevo consultorio
                </button>
            </PageHeader>

            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                {[
                    { label: 'Disponibles', value: counts.available, variant: 'success' },
                    { label: 'Ocupados', value: counts.occupied, variant: 'danger' },
                    { label: 'Inactivos', value: counts.maintenance, variant: 'warning' },
                ].map(s => (
                    <div key={s.label} className="stat-item" style={{ minWidth: 110 }}>
                        <span className="stat-num" style={{ fontSize: 18 }}>{s.value}</span>
                        <Badge variant={s.variant} dot={false}>{s.label}</Badge>
                    </div>
                ))}
            </div>

            <div className="filter-row">
                <div className="search-bar">
                    <span className="search-bar-icon"><Icon name="search" size={14} /></span>
                    <input placeholder="Buscar consultorio…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="select-input" value={filterStatus} onChange={e => setFilter(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="AVAILABLE">Disponible</option>
                    <option value="UNAVAILABLE">Ocupado</option>
                    <option value="INACTIVE">Inactivo</option>
                </select>
            </div>

            <div className="table-wrapper">
                {loading && <SkeletonTable rows={5} cols={5} />}
                {error && <EmptyState icon="alert" title="Error al cargar" sub={error.message} />}
                {!loading && !error && offices.length === 0 && (
                    <EmptyState icon="building" title="Sin consultorios"
                        sub="Registra el primer consultorio"
                        action={<button className="btn btn-primary btn-sm" onClick={openCreate}><Icon name="plus" size={13} /> Nuevo</button>}
                    />
                )}
                {!loading && !error && offices.length > 0 && (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Consultorio</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offices.map(o => {
                                const st = OFFICE_STATUS[o.status] ?? { label: o.status, variant: 'neutral' }
                                return (
                                    <tr key={o.officeId}>
                                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{o.name}</td>
                                        <td>{o.location ?? '—'}</td>
                                        <td><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-ghost btn-icon" title="Editar" onClick={() => openEdit(o)}>
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

            <Modal open={modalOpen} onClose={() => setModal(false)} title={editId ? 'Editar consultorio' : 'Nuevo consultorio'} size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setModal(false)} disabled={saving}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando…' : editId ? 'Actualizar' : 'Crear'}
                        </button>
                    </>
                }
            >
                <div className="form-grid">
                    <FormGroup label="Nombre" required>
                        <input className="form-control" value={form.name} onChange={change('name')} placeholder="Ej: Consultorio 1" />
                    </FormGroup>
                    <FormGroup label="Ubicación">
                        <input className="form-control" value={form.number} onChange={change('location')} placeholder="Ej: Piso 1 - 101" />
                    </FormGroup>
                    {editId && (
                        <FormGroup label="Estado">
                            <select className="form-control" value={form.status} onChange={change('status')}>
                                <option value="AVAILABLE">Disponible</option>
                                <option value="UNAVAILABLE">Ocupado</option>
                                <option value="INACTIVE">Inactivo</option>
                            </select>
                        </FormGroup>
                    )}
                </div>
            </Modal>
        </div>
    )
}