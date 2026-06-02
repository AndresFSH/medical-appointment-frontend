import { useState, useMemo } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import { createDoctor, updateDoctor, getDoctorById, getAllDoctors } from '../services/DoctorService'
import { getSpecialties } from '../services/SpecialtyService.js'
import { useApp } from '../context/AppContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import FormGroup from '../components/ui/FormGroup.jsx'
import SkeletonTable from '../components/ui/SkeletonTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Icon from '../components/ui/Icon.jsx'

const EMPTY_FORM = {
    fullName: '', specialtyId: '', active: true
}

export default function DoctorPage() {
    const { toast } = useApp()
    const { data, loading, error, refetch } = useFetch(getAllDoctors)
    const { data: specialtiesData } = useFetch(getSpecialties)

    const [search, setSearch] = useState('')
    const [filterStatus, setFilter] = useState('')
    const [filterSpec, setFilterSpec] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [modalOpen, setModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [viewItem, setViewItem] = useState(null)

    const specialties = specialtiesData?.content ?? specialtiesData?.data ?? specialtiesData ?? []

    const doctors = useMemo(() => {
        const list = data?.content ?? data?.data ?? data ?? []
        return list.filter(d => {
            const fullName = `${d.fullName}`.toLowerCase()
            const matchSearch = !search || fullName.includes(search.toLowerCase())
            const matchStatus = !filterStatus || String(d.active) === filterStatus
            const matchSpec = !filterSpec || String(d.specialty?.specialtyId) === filterSpec
            return matchSearch && matchStatus && matchSpec
        })
    }, [data, search, filterStatus, filterSpec])

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setModal(true)
    }

    const openEdit = (d) => {
        setForm({
            fullName: d.fullName ?? '',
            specialtyId: String(d.specialty?.specialtyId ?? ''),
            active: d.active,
        })
        setEditId(d.doctorId)
        setModal(true)
    }

    const handleSave = async () => {
        if (!form.fullName.trim() || !form.specialtyId) {
            toast.error('Campos obligatorios')
            return
        }
        setSaving(true)
        try {
            const payload = { ...form, specialtyId: form.specialtyId || null }
            if (editId) {
                await updateDoctor(editId, payload)
                toast.success('Doctor actualizado')
            } else {
                await createDoctor(payload)
                toast.success('Doctor creado exitosamente')
            }
            setModal(false)
            refetch()
        } catch (e) {
            toast.error(e.message ?? 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const change = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    return (
        <div>
            <PageHeader title="Doctores" subtitle={`${doctors.length} doctor${doctors.length !== 1 ? 'es' : ''} registrados`}>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Icon name="plus" size={14} /> Nuevo doctor
                </button>
            </PageHeader>

            <div className="filter-row">
                <div className="search-bar">
                    <span className="search-bar-icon"><Icon name="search" size={14} /></span>
                    <input placeholder="Buscar por nombre o registro…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="select-input" value={filterStatus} onChange={e => setFilter(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                </select>
                <select className="select-input" value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
                    <option value="">Todas las especialidades</option>
                    {specialties.map(s => <option key={s.specialtyId} value={String(s.specialtyId)}>{s.name}</option>)}
                </select>
            </div>

            <div className="table-wrapper">
                {loading && <SkeletonTable rows={6} cols={6} />}
                {error && <EmptyState icon="alert" title="Error al cargar" sub={error.message} />}
                {!loading && !error && doctors.length === 0 && (
                    <EmptyState icon="stethoscope" title="Sin doctores"
                        sub={search ? 'Intenta con otro término' : 'Registra el primer doctor'}
                        action={<button className="btn btn-primary btn-sm" onClick={openCreate}><Icon name="plus" size={13} /> Nuevo</button>}
                    />
                )}
                {!loading && !error && doctors.length > 0 && (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Especialidad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(d => {
                                return (
                                    <tr key={d.doctorId}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{d.fullName}</div>
                                        </td>
                                        <td>{d.specialty?.name ?? '-'}</td>
                                        <td><Badge variant={d.active ? 'success' : 'neutral'}>{d.active ? 'Activo' : 'Inactivo'}</Badge></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-ghost btn-icon" title="Ver" onClick={() => setViewItem(d)}>
                                                    <Icon name="eye" size={14} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title="Editar" onClick={() => openEdit(d)}>
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

            <Modal open={modalOpen} onClose={() => setModal(false)} title={editId ? 'Editar doctor' : 'Nuevo doctor'} size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setModal(false)} disabled={saving}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando…' : editId ? 'Actualizar' : 'Crear doctor'}
                        </button>
                    </>
                }
            >
                <div className="form-grid">
                    <FormGroup label="Nombre completo" required>
                        <input className="form-control" value={form.fullName} onChange={change('fullName')} placeholder="Nombre" />
                    </FormGroup>
                    <FormGroup label="Especialidad">
                        <select className="form-control" value={form.specialtyId} onChange={change('specialtyId')}>
                            <option value="">— Seleccionar —</option>
                            {specialties.map(s => <option key={s.specialtyId} value={String(s.specialtyId)}>{s.name}</option>)}
                        </select>
                    </FormGroup>
                    {editId && (<FormGroup label="Estado" colSpan={2}>
                            <select className="form-control" value={form.active} onChange={change('active')}>
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </FormGroup>
                    )}
                </div>
            </Modal>

            {viewItem && (
                <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Detalle del doctor"
                    footer={<button className="btn btn-secondary" onClick={() => setViewItem(null)}>Cerrar</button>}
                >
                    {[
                        ['Nombre completo', `${viewItem.fullName}`],
                        ['Especialidad', viewItem.specialty?.name ?? specialties.find(s => s.specialtyId === viewItem.specialtyId)?.name ?? '—'],
                    ].map(([lbl, val]) => (
                        <div key={lbl} className="info-row">
                            <div className="info-row-label">{lbl}</div>
                            <div className="info-row-value">{val}</div>
                        </div>
                    ))}
                    <div className="info-row">
                        <div className="info-row-label">Estado</div>
                        <div className="info-row-value">
                            <Badge variant={viewItem.active ? 'success' : 'neutral'}>{viewItem.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                    </div>
                </Modal>
            )}
        </div>



    )
}