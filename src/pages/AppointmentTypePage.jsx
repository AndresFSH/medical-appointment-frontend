import { useState, useMemo, use } from 'react'
import { useFetch } from '../hooks/useFetch'
import { createAppointmentType, getAppointmentTypes } from '../services/AppointmentTypeService'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import FormGroup from '../components/ui/FormGroup.jsx'
import SkeletonTable from '../components/ui/SkeletonTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Icon from '../components/ui/Icon.jsx'

const EMPTY_FORM = { name: '', durationMinutes: '' }

export default function AppointmentTypePage() {
    const { toast } = useApp()
    const { data, loading, error, refetch } = useFetch(getAppointmentTypes)

    const [search, setSearch] = useState('')
    const [filterDuration, setFilter] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [modalOpen, setModal] = useState(false)
    const [saving, setSaving] = useState(false)

    const types = useMemo(() => {
        const list = data?.content ?? data?.data ?? data ?? []
        return list.filter(t => {
            const name = `${t.name}`.toLowerCase()
            return (!search || name.includes(search.toLowerCase())) &&
                (!filterDuration || t.durationMinutes === filterDuration)
        })
    }, [data, search, filterDuration])

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setModal(true)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.durationMinutes) {
            toast.error('Los campos son obligatorios')
            return
        }
        setSaving(true)
        try {
            await createAppointmentType(form)
            toast.success('Tipo creado exitosamente')
        } catch (err) {
            toast.error(err.message ?? 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const change = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    return (
        <div>
            <PageHeader title="Tipos de cita" subtitle="Tipos registrados">
                <button className='btn btn-primary' onClick={openCreate}>
                    <Icon name="plus" size={14} />Nuevo tipo
                </button>
            </PageHeader>

            <div className="filter-row">
                <div className="search-bar">
                    <span className="search-bar-icon"><Icon name="search" size={14} /></span>
                    <input placeholder="Buscar tipo…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading && (
                <div className="table-wrapper"><SkeletonTable rows={4} cols={3} /></div>
            )}
            {error && <EmptyState icon="alert" title="Error al cargar" sub={error.message} />}
            {!loading && !error && types.length === 0 && (
                <EmptyState icon="book" title="Sin tipos" sub="Crea el primer tipo de cita médica"
                    action={<button className="btn btn-primary btn-sm" onClick={openCreate}><Icon name="plus" size={13} /> Nuevo</button>}
                />
            )}
            {!loading && !error && types.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                    {types.map(t => (
                        <div key={t.id} className="card" style={{ padding: 0 }}>
                            <div style={{
                                height: 6,
                                background: t.color ?? 'var(--accent)',
                                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                            }} />
                            <div style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{t.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModal(false)} title={'Nuevo tipo'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setModal(false)} disabled={saving}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando…' : 'Crear'}
                        </button>
                    </>
                }
            >
                <div className="form-grid form-grid-1" style={{ gap: 14 }}>
                    <FormGroup label="Nombre" required>
                        <input className="form-control" value={form.name} onChange={change('name')} placeholder="Ej: Control" />
                    </FormGroup>

                    <FormGroup label="Duración (min)" required>
                        <input className="form-control" values={form.durationMinutes} onChange={change('durationMinutes')} placeholder='Ej: 30' />
                    </FormGroup>
                </div>
            </Modal>

        </div>
    )
}