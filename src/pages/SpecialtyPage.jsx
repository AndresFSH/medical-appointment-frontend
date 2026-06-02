import { useState, useMemo } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import { createSpecialty, getSpecialties } from '../services/SpecialtyService.js'
import { useApp } from '../context/AppContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Modal from '../components/ui/Modal.jsx'
import FormGroup from '../components/ui/FormGroup.jsx'
import SkeletonTable from '../components/ui/SkeletonTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Icon from '../components/ui/Icon.jsx'

const EMPTY_FORM = { name : '' }

export default function SpecialtyPage() {
    const { toast } = useApp()
    const { data, loading, error, refetch } = useFetch(getSpecialties)

    const [search, setSearch] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [modalOpen, setModal] = useState(false)
    const [saving, setSaving] = useState(false)

    const specialties = useMemo(() => {
        const list = data?.content ?? data?.data ?? data ?? []
        return list.filter(s => !search || (s.name ?? '').toLowerCase().includes(search.toLowerCase()))
    }, [data, search])

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setModal(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }
        setSaving(true)
        try {
            await createSpecialty(form)
            toast.success('Especialidad creada')
        } catch (err) {
            toast.error(err.message ?? 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const change = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    return (
        <div>
            <PageHeader title="Catálogo" subtitle="Especialidades médicas registradas">
                <button className="btn btn-primary" onClick={openCreate}>
                    <Icon name="plus" size={14} /> Nueva especialidad
                </button>
            </PageHeader>

            <div className="filter-row">
                <div className="search-bar">
                    <span className="search-bar-icon"><Icon name="search" size={14} /></span>
                    <input placeholder="Buscar especialidad…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading && (
                <div className="table-wrapper"><SkeletonTable rows={4} cols={3} /></div>
            )}
            {error && <EmptyState icon="alert" title="Error al cargar" sub={error.message} />}
            {!loading && !error && specialties.length === 0 && (
                <EmptyState icon="book" title="Sin especialidades" sub="Crea la primera especialidad médica"
                    action={<button className="btn btn-primary btn-sm" onClick={openCreate}><Icon name="plus" size={13} /> Nueva</button>}
                />
            )}
            {!loading && !error && specialties.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                    {specialties.map(s => (
                        <div key={s.specialtyId} className="card" style={{ padding: 0 }}>
                            <div style={{
                                height: 6,
                                background: s.color ?? 'var(--accent)',
                                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                            }} />
                            <div style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{s.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModal(false)} title={'Nueva especialidad'}
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
                        <input className="form-control" value={form.name} onChange={change('name')} placeholder="Ej: Cardiología" />
                    </FormGroup>
                </div>
            </Modal>
        </div>
    )

}