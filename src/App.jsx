import { useMemo, useState } from 'react'
import { C } from './theme'
import { useSheetData } from './hooks/useSheetData'
import { computeDashboard, filterByDateRange, fmtARS, fmtDays, fmtInt, fmtPct, fmtROAS, roasColor } from './utils/metrics'
import Header from './components/Header'
import DateFilter from './components/DateFilter'
import ScoreCard from './components/ScoreCard'
import Section from './components/Section'
import RoasByAdChart from './components/RoasByAdChart'
import SpendVsRevenueChart from './components/SpendVsRevenueChart'
import DailyEvolutionChart from './components/DailyEvolutionChart'
import AdTable from './components/AdTable'
import ZonaTable from './components/ZonaTable'
import ProductoTable from './components/ProductoTable'
import Spinner from './components/Spinner'
import ErrorState from './components/ErrorState'

export default function App() {
  const { data, loading, error, sheetId, refetch } = useSheetData()

  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })

  const dashboard = useMemo(() => {
    if (!data) return null
    const ventas = filterByDateRange(data.ventas, 'Fecha de venta', range.from, range.to)
    const metricas = filterByDateRange(data.metricas, 'Day', range.from, range.to)
    const tally = filterByDateRange(data.tally, 'Fecha', range.from, range.to)
    return computeDashboard(ventas, metricas, tally)
  }, [data, range])

  if (loading && !data) return <Spinner />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />

  const s = dashboard?.scorecards

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <Header sheetId={sheetId} updatedAt={data?.updatedAt} loading={loading} />

      <DateFilter
        from={fromInput}
        to={toInput}
        onFromChange={setFromInput}
        onToChange={setToInput}
        onApply={() => setRange({ from: fromInput, to: toInput })}
        onReset={() => {
          setFromInput('')
          setToInput('')
          setRange({ from: '', to: '' })
        }}
        active={Boolean(range.from || range.to)}
      />

      {error && data && (
        <div
          style={{
            margin: '16px 24px 0',
            padding: '10px 16px',
            background: 'rgba(239,68,68,0.1)',
            border: `1px solid ${C.red}`,
            borderRadius: 8,
            color: C.red,
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>No se pudo actualizar: {error}</span>
          <button
            onClick={refetch}
            style={{ background: 'transparent', border: `1px solid ${C.red}`, color: C.red, borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      )}

      <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14,
          }}
        >
          <ScoreCard label="Inversión" value={fmtARS(s.inversion)} />
          <ScoreCard label="Facturación" value={fmtARS(s.facturacion)} color={C.gold} />
          <ScoreCard label="ROAS" value={fmtROAS(s.roas)} color={roasColor(s.roas)} />
          <ScoreCard label="Total Leads" value={fmtInt(s.totalLeads)} />
          <ScoreCard label="Total Ventas" value={fmtInt(s.totalVentas)} />
          <ScoreCard label="Tasa de Cierre" value={fmtPct(s.tasaCierre)} />
          <ScoreCard label="CPL" value={fmtARS(s.cpl)} />
          <ScoreCard label="Costo por Venta" value={fmtARS(s.costoPorVenta)} />
          <ScoreCard label="Ticket Promedio" value={fmtARS(s.ticket)} />
          <ScoreCard label="Tiempo Conv. Prom." value={fmtDays(s.tiempoConvProm)} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: 20,
          }}
        >
          <Section title="ROAS por anuncio">
            <RoasByAdChart data={dashboard.byAd} />
          </Section>
          <Section title="Inversión vs Facturación por anuncio">
            <SpendVsRevenueChart data={dashboard.byAd} />
          </Section>
        </div>

        <Section title="Evolución acumulada diaria">
          <DailyEvolutionChart data={dashboard.daily} />
        </Section>

        <Section title="Detalle por anuncio">
          <AdTable data={dashboard.byAd} />
        </Section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 20,
          }}
        >
          <Section title="Leads por zona">
            <ZonaTable data={dashboard.byZona} />
          </Section>
          <Section title="Ventas por producto">
            <ProductoTable data={dashboard.byProducto} />
          </Section>
        </div>
      </main>
    </div>
  )
}
