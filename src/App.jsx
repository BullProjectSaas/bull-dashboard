import { useMemo, useState } from 'react'
import { C } from './theme'
import { useSheetData } from './hooks/useSheetData'
import {
  computeDashboard,
  filterByDateRange,
  fmtARS,
  fmtDays,
  fmtInt,
  fmtPct,
  fmtROAS,
  pctChange,
  previousPeriod,
  roasColor,
} from './utils/metrics'
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
import CampaignBoard from './components/board/CampaignBoard'

function computeForRange(data, from, to) {
  const ventas = filterByDateRange(data.ventas, 'Fecha de venta', from, to)
  const metricas = filterByDateRange(data.metricas, 'Day', from, to)
  const tally = filterByDateRange(data.tally, 'Fecha', from, to)
  return computeDashboard(ventas, metricas, tally)
}

export default function App() {
  const { data, loading, error, sheetId, refetch } = useSheetData()

  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [cumulative, setCumulative] = useState(true)

  const rangeActive = Boolean(range.from && range.to)

  const dashboard = useMemo(() => {
    if (!data) return null
    return computeForRange(data, range.from, range.to)
  }, [data, range])

  // Full-history (unfiltered) aggregate, for the campaign board — its auto-coloring is a
  // structural/status view of each ad, independent from the scorecards' date filter.
  const fullDashboard = useMemo(() => {
    if (!data) return null
    return computeDashboard(data.ventas, data.metricas, data.tally)
  }, [data])

  const previousDashboard = useMemo(() => {
    if (!data || !compareEnabled || !rangeActive) return null
    const prev = previousPeriod(range.from, range.to)
    if (!prev) return null
    return computeForRange(data, prev.from, prev.to)
  }, [data, compareEnabled, rangeActive, range])

  const deltas = useMemo(() => {
    if (!dashboard || !previousDashboard) return null
    const c = dashboard.scorecards
    const p = previousDashboard.scorecards
    return Object.fromEntries(Object.keys(c).map((k) => [k, pctChange(c[k], p[k])]))
  }, [dashboard, previousDashboard])

  const applyPreset = (from, to) => {
    setFromInput(from)
    setToInput(to)
    setRange({ from, to })
  }

  const resetFilter = () => {
    setFromInput('')
    setToInput('')
    setRange({ from: '', to: '' })
    setCompareEnabled(false)
  }

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
        onReset={resetFilter}
        onPreset={applyPreset}
        active={rangeActive}
        compareEnabled={compareEnabled}
        onToggleCompare={() => setCompareEnabled((v) => !v)}
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
          <ScoreCard label="Inversión" value={fmtARS(s.inversion)} delta={deltas?.inversion} />
          <ScoreCard label="Facturación" value={fmtARS(s.facturacion)} color={C.gold} delta={deltas?.facturacion} />
          <ScoreCard label="ROAS" value={fmtROAS(s.roas)} color={roasColor(s.roas)} delta={deltas?.roas} />
          <ScoreCard label="Total Leads" value={fmtInt(s.totalLeads)} delta={deltas?.totalLeads} />
          <ScoreCard label="Total Ventas" value={fmtInt(s.totalVentas)} delta={deltas?.totalVentas} />
          <ScoreCard label="Tasa de Cierre" value={fmtPct(s.tasaCierre)} delta={deltas?.tasaCierre} />
          <ScoreCard label="CPL" value={fmtARS(s.cpl)} delta={deltas?.cpl} />
          <ScoreCard label="Costo por Venta" value={fmtARS(s.costoPorVenta)} delta={deltas?.costoPorVenta} />
          <ScoreCard label="Ticket Promedio" value={fmtARS(s.ticket)} delta={deltas?.ticket} />
          <ScoreCard label="Tiempo Conv. Prom." value={fmtDays(s.tiempoConvProm)} delta={deltas?.tiempoConvProm} />
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

        <Section
          title={cumulative ? 'Evolución acumulada diaria' : 'Evolución diaria'}
          actions={
            <button
              onClick={() => setCumulative((v) => !v)}
              style={{
                background: 'transparent',
                color: C.muted,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Ver {cumulative ? 'diaria' : 'acumulada'}
            </button>
          }
        >
          <DailyEvolutionChart data={dashboard.daily} cumulative={cumulative} />
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

        <Section title="Estructura de campañas">
          <CampaignBoard sheetId={sheetId} byAd={fullDashboard.byAd} tally={data.tally} />
        </Section>
      </main>
    </div>
  )
}
