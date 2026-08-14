import { useCallback, useEffect, useMemo, useRef } from 'react'
import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, ReactFlowProvider, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'
import { C } from '../../theme'
import { useBoard } from '../../hooks/useBoard'
import AdNode from './AdNode'
import GroupNode from './GroupNode'
import Palette from './Palette'
import Legend from './Legend'

const nodeTypes = { ad: AdNode, container: GroupNode }

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `n_${Date.now()}_${Math.random().toString(36).slice(2)}`)

function CampaignBoardInner({ sheetId, byAd, tally, metricas }) {
  const { nodes: rawNodes, setNodes: setRawNodes, edges: rawEdges, setEdges: setRawEdges, ready, syncError, persist } = useBoard(sheetId)
  const { fitView } = useReactFlow()

  const nodesRef = useRef(rawNodes)
  const edgesRef = useRef(rawEdges)
  useEffect(() => {
    nodesRef.current = rawNodes
  }, [rawNodes])
  useEffect(() => {
    edgesRef.current = rawEdges
  }, [rawEdges])

  // Keep newly added blocks visible instead of leaving them outside the current pan/zoom —
  // fitView only auto-runs once on mount, so every palette "add" re-triggers it.
  const scheduleFit = useCallback(() => {
    // React Flow measures a new node's size asynchronously (ResizeObserver) before it can
    // be included in fitView's bounding box — a bare requestAnimationFrame fires too early.
    setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 120)
  }, [fitView])

  const byAdMap = useMemo(() => new Map(byAd.map((a) => [a.ad, a])), [byAd])
  const placedAdNames = useMemo(() => new Set(rawNodes.filter((n) => n.data.linkedAd).map((n) => n.data.linkedAd)), [rawNodes])
  const placedGroupNames = useMemo(() => new Set(rawNodes.filter((n) => n.type === 'container').map((n) => n.data.label)), [rawNodes])

  const nextPosition = () => {
    const count = nodesRef.current.length
    return { x: 40 + (count % 5) * 210, y: 40 + Math.floor(count / 5) * 150 }
  }

  const handleDelete = useCallback((id) => {
    const nextNodes = nodesRef.current.filter((n) => n.id !== id)
    const nextEdges = edgesRef.current.filter((e) => e.source !== id && e.target !== id)
    setRawNodes(nextNodes)
    setRawEdges(nextEdges)
    persist(nextNodes, nextEdges)
  }, [persist, setRawNodes, setRawEdges])

  const handleRename = useCallback((id, label) => {
    const nextNodes = nodesRef.current.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
    setRawNodes(nextNodes)
    persist(nextNodes, edgesRef.current)
  }, [persist, setRawNodes])

  const handleColorChange = useCallback((id, color) => {
    const nextNodes = nodesRef.current.map((n) => (n.id === id ? { ...n, data: { ...n.data, color } } : n))
    setRawNodes(nextNodes)
    persist(nextNodes, edgesRef.current)
  }, [persist, setRawNodes])

  const onNodesChange = useCallback((changes) => {
    const next = applyNodeChanges(changes, nodesRef.current)
    setRawNodes(next)
    persist(next, edgesRef.current)
  }, [persist, setRawNodes])

  const onEdgesChange = useCallback((changes) => {
    const next = applyEdgeChanges(changes, edgesRef.current)
    setRawEdges(next)
    persist(nodesRef.current, next)
  }, [persist, setRawEdges])

  const onConnect = useCallback((connection) => {
    const next = addEdge({ ...connection, id: uid(), style: { stroke: C.gold } }, edgesRef.current)
    setRawEdges(next)
    persist(nodesRef.current, next)
  }, [persist, setRawEdges])

  // Explicit width so React Flow doesn't have to wait on ResizeObserver to measure a
  // freshly-added node before it can position handles/edges and fitView — without it,
  // fast-following adds could momentarily draw an edge against a stale/default-sized box.
  const NODE_WIDTH = 190

  const onAddAd = useCallback((adName) => {
    const node = { id: uid(), type: 'ad', position: nextPosition(), style: { width: NODE_WIDTH }, data: { kind: 'ad', label: adName, linkedAd: adName } }
    const next = [...nodesRef.current, node]
    setRawNodes(next)
    persist(next, edgesRef.current)
    scheduleFit()
  }, [persist, setRawNodes, scheduleFit])

  const onAddManualAd = useCallback((label) => {
    const node = { id: uid(), type: 'ad', position: nextPosition(), style: { width: NODE_WIDTH }, data: { kind: 'ad', label, linkedAd: null } }
    const next = [...nodesRef.current, node]
    setRawNodes(next)
    persist(next, edgesRef.current)
    scheduleFit()
  }, [persist, setRawNodes, scheduleFit])

  const onAddGroup = useCallback((kind, label) => {
    const node = {
      id: uid(),
      type: 'container',
      position: nextPosition(),
      style: { width: NODE_WIDTH },
      data: { kind, label, color: kind === 'campaign' ? '#7BD98A' : '#E8EDF2' },
    }
    const next = [...nodesRef.current, node]
    setRawNodes(next)
    persist(next, edgesRef.current)
    scheduleFit()
  }, [persist, setRawNodes, scheduleFit])

  const hydratedNodes = useMemo(
    () =>
      rawNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          adData: n.type === 'ad' && n.data.linkedAd ? byAdMap.get(n.data.linkedAd) || null : n.data.adData,
          onDelete: handleDelete,
          onRename: handleRename,
          onColorChange: handleColorChange,
        },
      })),
    [rawNodes, byAdMap, handleDelete, handleRename, handleColorChange],
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <Legend />
        {syncError && (
          <span style={{ fontSize: 12, color: C.red }}>No se pudo sincronizar con el equipo ({syncError}). Los cambios quedan solo en tu navegador.</span>
        )}
      </div>

      {!ready ? (
        <p style={{ color: C.muted, fontSize: 13 }}>Cargando tablero…</p>
      ) : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <Palette
            byAd={byAd}
            tally={tally}
            metricas={metricas}
            placedAdNames={placedAdNames}
            placedGroupNames={placedGroupNames}
            onAddAd={onAddAd}
            onAddGroup={onAddGroup}
            onAddManualAd={onAddManualAd}
          />
          <div style={{ flex: 1, height: 560, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <ReactFlow
              nodes={hydratedNodes}
              edges={rawEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode={['Backspace', 'Delete']}
              proOptions={{ hideAttribution: true }}
            >
              <Background color={C.border} gap={20} />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CampaignBoard(props) {
  return (
    <ReactFlowProvider>
      <CampaignBoardInner {...props} />
    </ReactFlowProvider>
  )
}
