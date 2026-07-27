import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { useTheme } from '../../hooks/useTheme'
import type { DiceTemplate } from '../../hooks/useDiceTemplate'

const EDGE_WIDTH = 3 // px de pantalla — LineBasicMaterial ignora linewidth en la mayoría de GPUs
const ROLL_DURATION = 1.4 // segundos
const SETTLE_PAUSE = 1 // segundos de pausa tras asentarse, antes de abrir el panel

// Invierte el sentido de los triángulos (índices 1↔2 de cada cara) — hace
// falta tras un reflejo (escala negativa en un eje), que voltea las normales
// hacia dentro.
function flipWinding(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const index = geometry.index
  if (!index) return geometry
  const arr = index.array as Uint16Array | Uint32Array
  for (let i = 0; i < arr.length; i += 3) {
    const tmp = arr[i + 1]
    arr[i + 1] = arr[i + 2]
    arr[i + 2] = tmp
  }
  index.needsUpdate = true
  return geometry
}

// d10: three.js no trae un trapezoedro pentagonal (la forma real de un d10).
// Se aproxima uniendo dos conos de base pentagonal por su base — dos veces 5
// caras triangulares = 10 caras reales con normales propias, suficiente para
// numerarlas y hacer que el dado se asiente en la cara correcta.
//
// El cono de abajo se refleja con scale(1,-1,1) en vez de rotateX(180°): rotar
// también espeja el anillo ecuatorial en XZ (queda desfasado respecto al de
// arriba y el pentágono sale "retorcido"); escalar solo en Y invierte el
// ápice manteniendo el anillo en el mismo sitio exacto que el de arriba.
function buildD10Geometry(): THREE.BufferGeometry {
  const top = new THREE.ConeGeometry(0.75, 0.85, 5, 1, true)
  top.translate(0, 0.425, 0)

  const bottom = new THREE.ConeGeometry(0.75, 0.85, 5, 1, true)
  bottom.translate(0, 0.425, 0)
  bottom.scale(1, -1, 1)
  flipWinding(bottom)

  return mergeGeometries([top, bottom]) ?? top
}

function buildDieGeometry(sides: number): THREE.BufferGeometry {
  switch (sides) {
    case 4: return new THREE.TetrahedronGeometry(0.85)
    case 6: return new THREE.BoxGeometry(1.15, 1.15, 1.15)
    case 8: return new THREE.OctahedronGeometry(0.95)
    case 12: return new THREE.DodecahedronGeometry(0.85)
    case 20: return new THREE.IcosahedronGeometry(0.9)
    case 10: return buildD10Geometry()
    default: return new THREE.IcosahedronGeometry(0.9)
  }
}

interface Face {
  normal: THREE.Vector3
  centroid: THREE.Vector3
}

// Agrupa los triángulos de la geometría por normal compartida — cada grupo es
// una cara real del poliedro (p.ej. las 2 mitades de un cuadrado en un cubo,
// o los 3 triángulos que forman un pentágono en un dodecaedro). Funciona igual
// para los 5 sólidos platónicos sin necesitar lógica particular por tipo.
function computeFaces(geometry: THREE.BufferGeometry): Face[] {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry
  const pos = geo.getAttribute('position')
  const triCount = pos.count / 3
  const groups: { normal: THREE.Vector3; sum: THREE.Vector3; count: number }[] = []

  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const n = new THREE.Vector3()
  const centroid = new THREE.Vector3()

  for (let i = 0; i < triCount; i++) {
    a.fromBufferAttribute(pos, i * 3)
    b.fromBufferAttribute(pos, i * 3 + 1)
    c.fromBufferAttribute(pos, i * 3 + 2)
    THREE.Triangle.getNormal(a, b, c, n)
    centroid.copy(a).add(b).add(c).divideScalar(3)

    const match = groups.find((g) => g.normal.angleTo(n) < 0.05)
    if (match) {
      match.sum.add(centroid)
      match.count++
    } else {
      groups.push({ normal: n.clone(), sum: centroid.clone(), count: 1 })
    }
  }

  return groups.map((g) => ({ normal: g.normal, centroid: g.sum.divideScalar(g.count) }))
}

const textureCache = new Map<string, THREE.CanvasTexture>()

function getNumberTexture(label: string, color: string): THREE.CanvasTexture {
  const key = `${label}:${color}`
  const cached = textureCache.get(key)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.font = `bold ${label.length > 2 ? 44 : 60}px "Fira Code", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 64, 70)
  const texture = new THREE.CanvasTexture(canvas)
  textureCache.set(key, texture)
  return texture
}

// Plano orientado según la normal de la cara (no un sprite): así la etiqueta
// gira junto con el dado y se ve de frente solo cuando esa cara concreta
// queda mirando a cámara, igual que un número real grabado en la cara.
function FaceLabel({ label, position, normal, color }: { label: string; position: THREE.Vector3; normal: THREE.Vector3; color: string }) {
  const texture = useMemo(() => getNumberTexture(label, color), [label, color])
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize()),
    [normal]
  )
  return (
    <mesh position={position} quaternion={quaternion}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

// LineBasicMaterial ignora `linewidth` en casi todas las GPU (limitación de
// WebGL/ANGLE, siempre pinta 1px). Para un grosor real se usan las "fat
// lines" de three.js (LineSegments2 + LineMaterial), que sí lo respetan.
function DieEdges({ geometry, color }: { geometry: THREE.BufferGeometry; color: string }) {
  const { gl, size } = useThree()

  const lineSegments = useMemo(() => {
    const edges = new THREE.EdgesGeometry(geometry)
    const lineGeo = new LineSegmentsGeometry()
    lineGeo.setPositions(Array.from(edges.getAttribute('position').array as Float32Array))
    const material = new LineMaterial({ linewidth: EDGE_WIDTH })
    return new LineSegments2(lineGeo, material)
  }, [geometry])

  useEffect(() => {
    lineSegments.material.color.set(color)
  }, [lineSegments, color])

  useEffect(() => {
    // El grosor de las fat lines se calcula en pixels a partir de `resolution`
    // — hay que usar el tamaño real del framebuffer (con dpr ya aplicado), no
    // el tamaño CSS del canvas (`size`), o el grosor sale más fino de lo
    // esperado. `size` solo se usa aquí para volver a leerlo si cambia.
    lineSegments.material.resolution.set(gl.domElement.width, gl.domElement.height)
  }, [lineSegments, gl, size])

  return <primitive object={lineSegments} />
}

// Gira rápido y decreciente mientras converge (slerp con ease-out) hacia la
// orientación final que deja `targetNormal` mirando a cámara (+Z) — así el
// dado termina mostrando la cara correcta, no una al azar.
function useSettlingRotation(targetQuat: THREE.Quaternion, duration: number) {
  const ref = useRef<THREE.Group>(null)
  const anim = useRef<{ start: THREE.Quaternion; axis: THREE.Vector3; elapsed: number; done: boolean } | null>(null)
  if (!anim.current) {
    anim.current = {
      start: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      ),
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      elapsed: 0,
      done: false,
    }
  }

  useFrame((_, delta) => {
    const a = anim.current!
    if (!ref.current || a.done) return
    a.elapsed += delta
    const t = Math.min(a.elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)

    const base = new THREE.Quaternion().slerpQuaternions(a.start, targetQuat, eased)
    const spin = new THREE.Quaternion().setFromAxisAngle(a.axis, (1 - eased) * 10)
    ref.current.quaternion.copy(base).multiply(spin)

    if (t >= 1) {
      a.done = true
      ref.current.quaternion.copy(targetQuat)
    }
  })

  return ref
}

export type DieVariant = 'percentTens' | 'percentUnits'

interface DieMeshProps {
  sides: number
  value: number
  variant?: DieVariant
  dieColor: string
  inkColor: string
}

// Etiqueta y cara-objetivo de cada tipo: la convención normal es 1..N (cara i
// muestra i+1); para el d100 partido en decenas/unidades, la decena muestra
// 00,10,20...90 y la unidad 0..9, y el valor ya viene en esas unidades reales.
function getFaceLabel(index: number, variant: DieVariant | undefined): string {
  if (variant === 'percentTens') return index === 0 ? '00' : String(index * 10)
  if (variant === 'percentUnits') return String(index)
  return String(index + 1)
}

function getTargetIndex(value: number, faceCount: number, variant: DieVariant | undefined): number {
  if (variant === 'percentTens') return ((value / 10) % faceCount + faceCount) % faceCount
  if (variant === 'percentUnits') return (value % faceCount + faceCount) % faceCount
  return ((value - 1) % faceCount + faceCount) % faceCount
}

function DieMesh({ sides, value, variant, dieColor, inkColor }: DieMeshProps) {
  const geometry = useMemo(() => buildDieGeometry(sides), [sides])
  const faces = useMemo(() => computeFaces(geometry), [geometry])
  const faceCount = faces.length

  const targetIndex = useMemo(() => getTargetIndex(value, faceCount, variant), [value, faceCount, variant])

  const targetQuat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(faces[targetIndex].normal.clone().normalize(), new THREE.Vector3(0, 0, 1)),
    [faces, targetIndex]
  )

  const ref = useSettlingRotation(targetQuat, ROLL_DURATION)

  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={dieColor} flatShading />
      </mesh>
      <DieEdges geometry={geometry} color={inkColor} />
      {faces.map((f, i) => (
        <FaceLabel
          key={i}
          label={getFaceLabel(i, variant)}
          position={f.centroid.clone().addScaledVector(f.normal, 0.015)}
          normal={f.normal}
          color={inkColor}
        />
      ))}
    </group>
  )
}

export interface DieRoll {
  sides: number
  value: number
  variant?: DieVariant
}

interface Dice3DProps {
  dice: DieRoll[]
  template: DiceTemplate
  onSettled?: () => void
}

// Anima cada dado desde un giro rápido hasta asentarse en su cara correcta.
// onSettled se dispara una sola vez, tras ROLL_DURATION + SETTLE_PAUSE — ese
// margen extra es para poder ver el dado ya quieto antes de que desaparezca.
export function Dice3D({ dice, template, onSettled }: Dice3DProps) {
  const { theme } = useTheme()
  const inkColor = theme === 'dark' ? template.edgeColorDark : template.edgeColorLight

  useEffect(() => {
    if (!onSettled) return
    const timeout = setTimeout(onSettled, (ROLL_DURATION + SETTLE_PAUSE) * 1000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = dice.slice(0, 6)
  const spacing = 1.9
  const startX = -((visible.length - 1) * spacing) / 2

  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <directionalLight position={[-3, -2, -4]} intensity={0.5} />
      {visible.map((d, i) => (
        <group key={i} position={[startX + i * spacing, 0, 0]}>
          <DieMesh sides={d.sides} value={d.value} variant={d.variant} dieColor={template.dieColor} inkColor={inkColor} />
        </group>
      ))}
    </Canvas>
  )
}
