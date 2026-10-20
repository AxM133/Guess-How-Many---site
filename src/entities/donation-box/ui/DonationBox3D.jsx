import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ContactShadows,
  Edges,
  Environment,
  Float,
  Lightformer,
  PresentationControls,
  Sparkles,
  useCursor,
} from '@react-three/drei'
import * as THREE from 'three'
import { DROP_EVENT, dropNotes } from '../model/drop'
import { DENOMINATIONS, drawBanknote, drawPoster, drawSide, fontsReady } from '../lib/textures'

// Размеры в «метрах» сцены, пропорции сняты с фото коробки
const BASE = { w: 1.0, h: 1.15, d: 1.0 }
const GLASS = { w: 0.9, h: 0.7, d: 0.9, y0: 1.06, t: 0.012 }
const GLASS_TOP = GLASS.y0 + GLASS.h
const TRAY_TOP = GLASS.y0 + 0.05
const NOTE = { w: 0.3, h: 0.14 }
const SLOT = { w: 0.34, h: 0.036 }
const MAX_LANDED = 45

const texturesPromise = fontsReady.then(() => ({
  poster: drawPoster(),
  side: drawSide(),
  notes: DENOMINATIONS.map(drawBanknote),
}))

function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)
const easeOut = (x) => 1 - (1 - x) ** 3
const clamp01 = (x) => Math.min(1, Math.max(0, x))

// Слегка изогнутые купюры выглядят живее, чем плоские
function useNoteGeometries() {
  return useMemo(
    () =>
      [0, 0.012, -0.01, 0.02].map((bend) => {
        const g = new THREE.PlaneGeometry(NOTE.w, NOTE.h, 10, 2)
        const pos = g.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i)
          pos.setZ(i, Math.cos((x / NOTE.w) * Math.PI) * bend)
        }
        g.computeVertexNormals()
        return g
      }),
    [],
  )
}

function pickDenomination(r) {
  const weights = [3, 5, 6, 5, 4, 3, 2, 1]
  let x = r() * weights.reduce((a, b) => a + b)
  return weights.findIndex((w) => (x -= w) < 0)
}

function randomRestingPose(r, layer) {
  const radius = 0.27
  const x = (r() * 2 - 1) * radius
  const z = (r() * 2 - 1) * radius
  const hump = (radius - Math.hypot(x, z) * 0.7) * 0.22
  return {
    position: [x, TRAY_TOP + 0.004 + layer * 0.0028 + hump, z],
    rotation: [-Math.PI / 2 + (r() - 0.5) * 0.25, (r() - 0.5) * 0.2, r() * Math.PI * 2],
  }
}

function NotesPile({ materials, geometries }) {
  const notes = useMemo(() => {
    const r = rng(7)
    const flat = Array.from({ length: 70 }, (_, i) => ({
      ...randomRestingPose(r, i),
      denom: pickDenomination(r),
      geo: Math.floor(r() * geometries.length),
    }))
    // несколько купюр прислонены к стенкам
    const leaning = [
      { position: [-0.33, TRAY_TOP + 0.08, 0.05], rotation: [-Math.PI / 2, 0.95, Math.PI / 2 + 0.2] },
      { position: [0.12, TRAY_TOP + 0.07, -0.34], rotation: [-0.55, 0, 0.15] },
      { position: [0.33, TRAY_TOP + 0.06, -0.08], rotation: [-Math.PI / 2, -1.05, Math.PI / 2 - 0.3] },
    ].map((p, i) => ({ ...p, denom: [5, 3, 7][i], geo: 1 }))
    return [...flat, ...leaning]
  }, [geometries.length])

  const coins = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 22 }, (_, i) => ({
      position: [(r() * 2 - 1) * 0.3, TRAY_TOP + 0.2 + r() * 0.05, (r() * 2 - 1) * 0.3],
      rotation: [(r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.6],
      gold: i % 3 !== 0,
    }))
  }, [])

  return (
    <group>
      {notes.map((n, i) => (
        <mesh key={i} geometry={geometries[n.geo]} material={materials[n.denom]} position={n.position} rotation={n.rotation} />
      ))}
      {coins.map((c, i) => (
        <mesh key={`c${i}`} position={c.position} rotation={c.rotation}>
          <cylinderGeometry args={[0.038, 0.038, 0.008, 28]} />
          <meshStandardMaterial
            color={c.gold ? '#e0b44a' : '#cfd4dc'}
            metalness={1}
            roughness={0.28}
            envMapIntensity={1.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// Купюра, которая падает в прорезь и ложится на кучу
function FallingNote({ note, material, geometry, onLanded }) {
  const ref = useRef()
  const start = useRef(null)
  const done = useRef(false)
  const DURATION = 2.1

  useFrame(({ clock }) => {
    const m = ref.current
    if (!m || done.current) return
    if (start.current === null) start.current = clock.elapsedTime
    const t = (clock.elapsedTime - start.current) / DURATION
    const [tx, ty, tz] = note.position
    const [rx, ry, rz] = note.rotation

    if (t < 0.4) {
      // появляется над прорезью и покачивается
      const p = easeOut(clamp01(t / 0.4))
      m.position.set(0, GLASS_TOP + 0.62 - p * 0.36, 0)
      m.rotation.set(0, Math.sin(t * 18) * 0.06 * (1 - p), Math.sin(t * 12) * 0.04)
      m.scale.setScalar(0.4 + p * 0.6)
    } else if (t < 0.68) {
      // проскальзывает внутрь
      const p = easeInOut((t - 0.4) / 0.28)
      m.position.set(0, GLASS_TOP + 0.26 - p * 0.42, 0)
      m.rotation.set(0, 0, 0)
      m.scale.setScalar(1)
    } else {
      // планирует вниз и ложится
      const p = easeOut(clamp01((t - 0.68) / 0.32))
      const flutter = Math.sin(p * Math.PI * 3) * 0.25 * (1 - p)
      m.position.set(tx * p + flutter * 0.2, THREE.MathUtils.lerp(GLASS_TOP - 0.16, ty, p), tz * p)
      m.rotation.set(THREE.MathUtils.lerp(0, rx, p) + flutter, ry * p, THREE.MathUtils.lerp(0, rz, p))
      if (t >= 1) {
        done.current = true
        m.position.set(tx, ty, tz)
        m.rotation.set(rx, ry, rz)
        onLanded(note.id)
      }
    }
  })

  return <mesh ref={ref} geometry={geometry} material={material} position={[0, GLASS_TOP + 0.62, 0]} scale={0.4} />
}

function useDroppingNotes(enabled) {
  const [notes, setNotes] = useState([])
  const nextId = useRef(0)
  const layer = useRef(72)
  const r = useMemo(() => rng(1234), [])

  useEffect(() => {
    const timers = new Set()
    const spawn = (count) => {
      const fresh = Array.from({ length: count }, (_, i) => {
        layer.current = Math.min(layer.current + 1, 72 + MAX_LANDED)
        return {
          id: nextId.current++,
          denom: pickDenomination(r),
          geo: Math.floor(r() * 4),
          delay: i * 380,
          landed: false,
          ...randomRestingPose(r, layer.current),
        }
      })
      fresh.forEach((n) => {
        const id = setTimeout(() => {
          timers.delete(id)
          setNotes((list) => {
            const next = [...list, n]
            // не даём куче расти бесконечно
            const landed = next.filter((x) => x.landed)
            return landed.length > MAX_LANDED ? next.filter((x) => x !== landed[0]) : next
          })
        }, n.delay)
        timers.add(id)
      })
    }
    const onDrop = (e) => spawn(e.detail || 1)
    window.addEventListener(DROP_EVENT, onDrop)
    const auto = enabled ? setInterval(() => !document.hidden && spawn(1), 3400) : null
    const first = setTimeout(() => spawn(1), 900)
    return () => {
      window.removeEventListener(DROP_EVENT, onDrop)
      clearInterval(auto)
      clearTimeout(first)
      timers.forEach(clearTimeout)
    }
  }, [enabled, r])

  const markLanded = (id) => setNotes((list) => list.map((n) => (n.id === id ? { ...n, landed: true } : n)))
  return [notes, markLanded]
}

// Скруглённая «таблетка» — форма прорези для купюр
function pill(path, width, r) {
  const cx = width / 2 - r
  path.absarc(-cx, 0, r, Math.PI / 2, (Math.PI * 3) / 2, false)
  path.absarc(cx, 0, r, (Math.PI * 3) / 2, Math.PI / 2, false)
  return path
}

function GlassBox({ glassMaterial }) {
  const { w, h, d, y0, t } = GLASS
  const cy = y0 + h / 2

  const lid = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-w / 2, -d / 2)
    shape.lineTo(w / 2, -d / 2)
    shape.lineTo(w / 2, d / 2)
    shape.lineTo(-w / 2, d / 2)
    shape.closePath()
    const hole = new THREE.Path()
    pill(hole, SLOT.w, SLOT.h / 2)
    shape.holes.push(hole)
    return new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false })
  }, [w, d, t])

  const slotRim = useMemo(() => {
    const m = 0.016
    const outer = new THREE.Shape()
    pill(outer, SLOT.w + m * 2, SLOT.h / 2 + m)
    const inner = new THREE.Path()
    pill(inner, SLOT.w, SLOT.h / 2)
    outer.holes.push(inner)
    return new THREE.ExtrudeGeometry(outer, { depth: 0.006, bevelEnabled: false })
  }, [])

  return (
    <group>
      {/* стенки */}
      <mesh position={[0, cy, d / 2]} material={glassMaterial}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[0, cy, -d / 2]} material={glassMaterial}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[w / 2, cy, 0]} rotation={[0, Math.PI / 2, 0]} material={glassMaterial}>
        <planeGeometry args={[d, h]} />
      </mesh>
      <mesh position={[-w / 2, cy, 0]} rotation={[0, Math.PI / 2, 0]} material={glassMaterial}>
        <planeGeometry args={[d, h]} />
      </mesh>
      {/* крышка с прорезью */}
      <mesh geometry={lid} material={glassMaterial} position={[0, GLASS_TOP - t, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={slotRim} position={[0, GLASS_TOP + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#5b6472" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* светящиеся грани акрила */}
      <mesh position={[0, cy, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial visible={false} />
        <Edges color="#d8fbff" transparent opacity={0.7} />
      </mesh>
      {/* белое дно */}
      <mesh position={[0, y0 + 0.025, 0]}>
        <boxGeometry args={[w - 0.02, 0.05, d - 0.02]} />
        <meshStandardMaterial color="#eef2f6" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Stand({ poster, side }) {
  return (
    <mesh position={[0, BASE.h / 2, 0]}>
      <boxGeometry args={[BASE.w, BASE.h, BASE.d]} />
      <meshStandardMaterial attach="material-0" map={side} roughness={0.75} />
      <meshStandardMaterial attach="material-1" map={side} roughness={0.75} />
      <meshStandardMaterial attach="material-2" color="#16133f" roughness={0.8} />
      <meshStandardMaterial attach="material-3" color="#16133f" roughness={0.8} />
      <meshStandardMaterial attach="material-4" map={poster} roughness={0.55} />
      <meshStandardMaterial attach="material-5" color="#1d1a52" roughness={0.8} />
    </mesh>
  )
}

function Scene({ autoDrop }) {
  const tex = use(texturesPromise)
  const geometries = useNoteGeometries()
  const noteMaterials = useMemo(
    () =>
      tex.notes.map(
        (map) => new THREE.MeshStandardMaterial({
          map,
          emissiveMap: map,
          emissive: '#ffffff',
          emissiveIntensity: 0.28,
          roughness: 0.65,
          side: THREE.DoubleSide,
        }),
      ),
    [tex],
  )
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#dff7ff',
        transparent: true,
        opacity: 0.16,
        roughness: 0.03,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 2.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  )
  const [falling, markLanded] = useDroppingNotes(autoDrop)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered, 'grab')

  const idle = useRef()
  useFrame(({ clock }) => {
    if (idle.current) idle.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.35
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <spotLight position={[-3, 3, -3]} angle={0.6} penumbra={1} intensity={60} color="#22d3ee" />
      <pointLight position={[0, 1.55, 0.2]} intensity={3} distance={2.2} color="#fff1c2" />

      <PresentationControls
        global={false}
        cursor={false}
        snap
        rotation={[0.05, -0.55, 0]}
        polar={[-0.2, 0.3]}
        azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
      >
        <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.35} floatingRange={[-0.03, 0.05]}>
          <group
            ref={idle}
            position={[0, -0.95, 0]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
              e.stopPropagation()
              dropNotes(1)
            }}
          >
            <Stand poster={tex.poster} side={tex.side} />
            <NotesPile materials={noteMaterials} geometries={geometries} />
            {falling.map((n) =>
              n.landed ? (
                <mesh key={n.id} geometry={geometries[n.geo]} material={noteMaterials[n.denom]} position={n.position} rotation={n.rotation} />
              ) : (
                <FallingNote
                  key={n.id}
                  note={n}
                  geometry={geometries[n.geo]}
                  material={noteMaterials[n.denom]}
                  onLanded={markLanded}
                />
              ),
            )}
            <GlassBox glassMaterial={glassMaterial} />
          </group>
        </Float>
      </PresentationControls>

      <ContactShadows position={[0, -1.0, 0]} opacity={0.55} scale={4} blur={2.6} far={2} color="#000" />
      <Sparkles count={45} scale={[3.5, 2.6, 2.5]} position={[0, 0.2, 0]} size={2.2} speed={0.35} color="#67e8f9" />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} scale={[6, 1.5, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} color="#67e8f9" position={[-4, 1, 0]} scale={[2, 4, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.5} color="#a78bfa" position={[4, 1, -1]} scale={[2, 4, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={2} position={[0, 1, 5]} scale={2} />
      </Environment>
    </>
  )
}

export default function DonationBox3D({ autoDrop = true, className = '' }) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.7, 4.0], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
      >
        <Suspense fallback={null}>
          <Scene autoDrop={autoDrop} />
        </Suspense>
      </Canvas>
    </div>
  )
}
