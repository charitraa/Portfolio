import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type NodeMouseHandler,
  type OnSelectionChangeFunc,
} from '@xyflow/react'
import { devices, links } from '../../data/topology'
import type { NodeId } from '../../data/types'
import { DeviceNode, type DeviceFlowNode } from '../nodes/DeviceNode'
import { PacketEdge, type PacketFlowEdge } from './PacketEdge'
import { useApp } from '../../store/AppState'

const nodeTypes = { device: DeviceNode }
const edgeTypes = { packet: PacketEdge }

const NODE_W = 216
const NODE_H = 96

const initialNodes: DeviceFlowNode[] = devices.map((device) => ({
  id: device.data.id,
  type: 'device',
  position: device.position,
  data: device.data,
}))

const initialEdges: PacketFlowEdge[] = links.map((link) => ({
  id: `${link.from}-${link.to}`,
  source: link.from,
  target: link.to,
  sourceHandle: `s-${link.fromPort}`,
  targetHandle: `t-${link.toPort}`,
  type: 'packet',
  data: { label: link.label, dashed: Boolean(link.dashed) },
}))

function Flow() {
  const { selected, select, focusRequest, clearFocus, setHovered, pushLog } = useApp()
  const [nodes, setNodes, onNodesChange] = useNodesState<DeviceFlowNode>(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState<PacketFlowEdge>(initialEdges)
  const { setCenter, fitView } = useReactFlow()
  const wrapper = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  // Only chase a node on resize once the visitor has actually picked one;
  // before that, the whole route is the more interesting view.
  const userFocused = useRef(false)

  const positions = useMemo(
    () => new Map(nodes.map((n) => [n.id, n.position])),
    [nodes],
  )

  // Mirror the app selection onto the map.
  useEffect(() => {
    setNodes((current) =>
      current.map((node) => (node.selected === (node.id === selected) ? node : { ...node, selected: node.id === selected })),
    )
  }, [selected, setNodes])

  // Fly to a node when something else (sidebar, palette) asks for it.
  useEffect(() => {
    if (!focusRequest) return
    userFocused.current = true
    const pos = positions.get(focusRequest)
    if (pos) {
      setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, { zoom: 1.15, duration: 700 })
    }
    clearFocus()
  }, [focusRequest, positions, setCenter, clearFocus])

  const onNodeClick = useCallback<NodeMouseHandler<DeviceFlowNode>>(
    (_event, node) => {
      userFocused.current = true
      select(node.id as NodeId)
      setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2, {
        zoom: 1.15,
        duration: 600,
      })
      pushLog(`${node.data.hostname} → ${node.data.section} requested`, 'ok')
    },
    [select, setCenter, pushLog],
  )

  const onNodeEnter = useCallback<NodeMouseHandler<DeviceFlowNode>>(
    (_event, node) => setHovered(node.id as NodeId),
    [setHovered],
  )

  const onNodeLeave = useCallback(() => setHovered(null), [setHovered])

  // React Flow handles Enter/Space on a focused node itself, so pick the
  // selection up from the store rather than only from mouse clicks.
  const onSelectionChange = useCallback<OnSelectionChangeFunc<DeviceFlowNode>>(
    ({ nodes: selectedNodes }) => {
      const node = selectedNodes[0]
      if (node && node.id !== selectedRef.current) {
        select(node.id as NodeId)
        pushLog(`${node.data.hostname} → ${node.data.section} requested`, 'ok')
      }
    },
    [select, pushLog],
  )

  // The detail panel steals horizontal space; recompose the view when it does
  // so the map never ends up half off-screen. Width is compared explicitly
  // because the observer outlives selection changes.
  const positionsRef = useRef(positions)
  positionsRef.current = positions
  const lastWidth = useRef(0)

  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    let timer = 0
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      if (width === lastWidth.current) return
      const isFirst = lastWidth.current === 0
      lastWidth.current = width
      if (isFirst) return

      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const current = selectedRef.current
        const pos =
          userFocused.current && current ? positionsRef.current.get(current as NodeId) : undefined
        if (pos) {
          setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, { zoom: 1.15, duration: 300 })
        } else {
          fitView({ padding: 0.16, duration: 300 })
        }
      }, 160)
    })
    observer.observe(el)
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [setCenter, fitView])

  return (
    <div ref={wrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeEnter}
        onNodeMouseLeave={onNodeLeave}
        onSelectionChange={onSelectionChange}
        onDoubleClick={() => fitView({ padding: 0.22, duration: 600 })}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.35}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        selectionOnDrag={false}
        className="[&_.react-flow__pane]:cursor-grab [&_.react-flow__pane:active]:cursor-grabbing"
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1.4} color="var(--grid)" />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bottom-4 !right-4 overflow-hidden !rounded-lg !border !shadow-lg"
        />
        <MiniMap
          position="top-right"
          pannable
          zoomable
          nodeColor={() => 'var(--accent)'}
          maskColor="color-mix(in srgb, var(--bg) 72%, transparent)"
          className="!top-4 !right-4 hidden lg:block"
          style={{ width: 148, height: 108 }}
        />
      </ReactFlow>
    </div>
  )
}

export function TopologyMap() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
