import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import SkeletonTable from '../components/ui/SkeletonTable'
import BarChart from '../components/ui/BarChart' 
import {
    getOfficeOccupancy,
    getDoctorProductivity,
    getNoShowPatients
} from '../services/ReportService'
import { todayISO } from '../utils/DateUtils'

export default function ReportPage() {

    const [from, setFrom] = useState(todayISO())
    const [to, setTo] = useState(todayISO())

    const [officeOccupancy, setOfficeOccupancy] = useState([])
    const [doctorProductivity, setDoctorProductivity] = useState([])
    const [noShowPatients, setNoShowPatients] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fromDateTime = `${from}T00:00:00`
    const toDateTime = `${to}T23:59:59`

    const loadReports = async () => {
        try {
            setLoading(true)
            setError(null)

            const [
                occupancy,
                productivity,
                noShows
            ] = await Promise.all([
                getOfficeOccupancy(fromDateTime, toDateTime),
                getDoctorProductivity(),
                getNoShowPatients(fromDateTime, toDateTime)
            ])

            setOfficeOccupancy(occupancy ?? [])
            setDoctorProductivity(productivity ?? [])
            setNoShowPatients(noShows ?? [])

        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadReports()
    }, [])

    const occupancyChartData = officeOccupancy.map(item => ({
        label: item.officeName,
        value: item.totalAppointments
    }))

    const productivityChartData = doctorProductivity.map(item => ({
        label: item.doctorName,
        value: item.completedAppointments
    }))

    const noShowChartData = noShowPatients.map(item => ({
        label: item.patientName,
        value: item.totalNoShows
    }))

    return (
        <div>

            <PageHeader
                title="Reportes"
                subtitle="Indicadores del sistema"
            />

            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    marginBottom: 20
                }}
            >
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="form-control"
                />

                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="form-control"
                />

                <button
                    className="btn btn-primary"
                    onClick={loadReports}
                >
                    Generar
                </button>
            </div>

            {loading && (
                <SkeletonTable rows={5} cols={4} />
            )}

            {error && (
                <EmptyState
                    title="Error"
                    sub={error.message}
                />
            )}

            <BarChart items={occupancyChartData} />

            <BarChart
                items={productivityChartData}
                color="var(--success)"
            />

            <BarChart
                items={noShowChartData}
                color="var(--danger)"
            />
        </div>
    )
}