import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

const LETTERS = 'SHAPIO 3D'
const FONT_URL = '/fonts/helvetiker_bold.typeface.json'

/* ═══════════════════════════════════════════
   Realistic 3D Printer Nozzle
   Based on brass hexagonal hotend nozzle
   ═══════════════════════════════════════════ */
function Nozzle({ position }) {
  const groupRef = useRef()
  const glowRef = useRef()

  // Animate the glow/heat effect
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const t = clock.getElapsedTime()
      glowRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 6) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* ─── Heatsink body (silver aluminum) ─── */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.4, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Heatsink fins */}
      {[0, 0.1, 0.2, -0.1].map((y, i) => (
        <mesh key={i} position={[0, 0.55 + y, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.025, 6]} />
          <meshStandardMaterial color="#999999" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* ─── Heat break (thinner silver tube) ─── */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.14, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ─── Heater block (brass/gold body) ─── */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.28, 0.2, 0.22]} />
        <meshStandardMaterial color="#c4993d" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* ─── Hexagonal nozzle (brass) ─── */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 6]} />
        <meshStandardMaterial color="#d4a94d" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ─── Nozzle tip (tapered) ─── */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.025, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#d4a94d" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ─── Hot glowing tip ─── */}
      <mesh ref={glowRef} position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff4400"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* ─── Heat glow point light ─── */}
      <pointLight position={[0, -0.06, 0]} color="#ff6600" intensity={2} distance={1.5} decay={2} />

      {/* ─── Thermistor wire (red) ─── */}
      <mesh position={[0.14, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 4]} />
        <meshStandardMaterial color="#cc2222" />
      </mesh>

      {/* ─── Heater cartridge wire (blue) ─── */}
      <mesh position={[-0.14, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 4]} />
        <meshStandardMaterial color="#2255cc" />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════
   Filament Wire being extruded
   ═══════════════════════════════════════════ */
function FilamentWire({ nozzlePos }) {
  const tubeRef = useRef()
  const pointsRef = useRef([])
  const MAX_POINTS = 500

  useFrame(() => {
    if (!nozzlePos.current) return

    // Add new point at nozzle tip position
    const tip = new THREE.Vector3(
      nozzlePos.current.x,
      nozzlePos.current.y - 0.08,
      nozzlePos.current.z
    )
    pointsRef.current.push(tip)
    if (pointsRef.current.length > MAX_POINTS) pointsRef.current.shift()

    // Create tube from points
    if (tubeRef.current && pointsRef.current.length > 3) {
      const curve = new THREE.CatmullRomCurve3(pointsRef.current)
      const tubeGeom = new THREE.TubeGeometry(curve, pointsRef.current.length, 0.018, 6, false)

      if (tubeRef.current.geometry) tubeRef.current.geometry.dispose()
      tubeRef.current.geometry = tubeGeom
    }
  })

  return (
    <mesh ref={tubeRef}>
      <bufferGeometry />
      <meshStandardMaterial
        color="#e8e8e8"
        metalness={0.3}
        roughness={0.4}
        emissive="#ff6600"
        emissiveIntensity={0.05}
      />
    </mesh>
  )
}

/* ═══════════════════════════════════════════
   Single Letter — revealed by nozzle
   ═══════════════════════════════════════════ */
function PrintedLetter({ char, index, totalLetters, font, printProgress }) {
  const meshRef = useRef()
  const materialRef = useRef()

  const geometry = useMemo(() => {
    const shapes = font.generateShapes(char, 0.9)
    const geom = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    })
    geom.computeBoundingBox()
    return geom
  }, [char, font])

  const xPos = useMemo(() => {
    const spacing = 1.05
    const totalWidth = totalLetters * spacing
    return -totalWidth / 2 + index * spacing
  }, [index, totalLetters])

  useFrame(() => {
    if (!meshRef.current) return

    // Each letter starts printing at a specific progress point
    const letterStart = index / totalLetters
    const letterEnd = (index + 1) / totalLetters
    const letterProgress = Math.max(0, Math.min(1, (printProgress.current - letterStart) / (letterEnd - letterStart)))

    // Scale Y from 0 to 1 (letter "grows" upward like layers being deposited)
    meshRef.current.scale.y = THREE.MathUtils.lerp(
      meshRef.current.scale.y,
      letterProgress,
      0.15
    )

    // Color transition: hot orange → warm → cool silver
    if (materialRef.current) {
      const heat = letterProgress > 0.9 ? 1 - ((letterProgress - 0.9) / 0.1) : letterProgress < 0.5 ? letterProgress * 2 : 1
      const cooldown = Math.max(0, 1 - (printProgress.current - letterEnd) * totalLetters * 2)

      if (letterProgress > 0 && letterProgress < 1) {
        // Currently being printed — hot
        materialRef.current.emissive.setHex(0xff4400)
        materialRef.current.emissiveIntensity = 0.3
      } else if (letterProgress >= 1) {
        // Printed — cooling down
        materialRef.current.emissive.setHex(0xff4400)
        materialRef.current.emissiveIntensity = Math.max(0, cooldown * 0.3)
      } else {
        materialRef.current.emissiveIntensity = 0
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[xPos, -0.45, 0]}
      scale={[1, 0, 1]}
    >
      <meshStandardMaterial
        ref={materialRef}
        color="#d0d0d0"
        metalness={0.7}
        roughness={0.25}
        emissive="#ff4400"
        emissiveIntensity={0}
      />
    </mesh>
  )
}

/* ═══════════════════════════════════════════
   Build Plate (print bed)
   ═══════════════════════════════════════════ */
function BuildPlate() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Main plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Grid lines on build plate */}
      <gridHelper args={[12, 30, '#333333', '#222222']} />

      {/* Subtle edge glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[12.2, 6.2]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive="#1a1a1a"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════
   Gantry Rails (X-axis rail the nozzle rides on)
   ═══════════════════════════════════════════ */
function GantryRail({ nozzleY }) {
  return (
    <group position={[0, nozzleY + 0.65, -0.8]}>
      {/* Main horizontal rail */}
      <mesh>
        <boxGeometry args={[10, 0.12, 0.12]} />
        <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Rail mounts */}
      {[-4.5, 4.5].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Vertical rail */}
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════
   Main Printer Scene
   ═══════════════════════════════════════════ */
function PrinterScene() {
  const { viewport } = useThree()
  const [font, setFont] = useState(null)
  const printProgress = useRef(0)
  const nozzlePos = useRef(new THREE.Vector3(0, 0, 0))
  const [nozzlePosition, setNozzlePosition] = useState([-5, 0.5, 0.3])
  const printSpeed = 0.12 // How fast the print progresses

  // Load font
  useEffect(() => {
    const loader = new FontLoader()
    loader.load(FONT_URL, (loadedFont) => setFont(loadedFont))
  }, [])

  // Animate nozzle position + print progress
  useFrame((_, delta) => {
    if (!font) return

    // Advance print progress
    if (printProgress.current < 1) {
      printProgress.current = Math.min(1, printProgress.current + delta * printSpeed)
    } else {
      // After printing is done, nozzle pulls away
      printProgress.current = Math.min(1.2, printProgress.current + delta * 0.05)
    }

    // Calculate nozzle X position based on progress
    const spacing = 1.05
    const totalWidth = LETTERS.length * spacing
    const startX = -totalWidth / 2 - 0.5
    const endX = totalWidth / 2 + 0.5

    const clampedProgress = Math.min(printProgress.current, 1)
    const targetX = startX + clampedProgress * (endX - startX)

    // Nozzle Y position — slight layer-by-layer bobbing + lift after done
    const printingY = 0.15 + Math.sin(clampedProgress * Math.PI * 16) * 0.02
    const afterY = printProgress.current > 1 ? 0.15 + (printProgress.current - 1) * 4 : printingY

    // Nozzle Z — slight forward movement
    const nozzleZ = 0.35

    // Update nozzle position
    nozzlePos.current.set(targetX, afterY, nozzleZ)
    setNozzlePosition([targetX, afterY, nozzleZ])
  })

  const scale = Math.min(viewport.width / 12, 1)

  if (!font) {
    return (
      <group>
        <ambientLight intensity={0.3} />
      </group>
    )
  }

  return (
    <group scale={scale}>
      {/* ─── Lighting ─── */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[8, 12, 5]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-5, 8, -3]} intensity={0.4} color="#8888aa" />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />

      {/* Subtle fill light from below */}
      <pointLight position={[0, -2, 0]} intensity={0.15} color="#334455" />

      {/* ─── Build Plate ─── */}
      <BuildPlate />

      {/* ─── Gantry Rails ─── */}
      <GantryRail nozzleY={nozzlePosition[1]} />

      {/* ─── Nozzle ─── */}
      <Nozzle position={nozzlePosition} />

      {/* ─── Filament Wire Trail ─── */}
      <FilamentWire nozzlePos={nozzlePos} />

      {/* ─── Letters being printed ─── */}
      {LETTERS.split('').map((char, i) => (
        <PrintedLetter
          key={i}
          char={char}
          index={i}
          totalLetters={LETTERS.length}
          font={font}
          printProgress={printProgress}
        />
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════
   Exported Component
   ═══════════════════════════════════════════ */
export default function PrinterText() {
  return (
    <div className="w-full h-[350px] md:h-[450px] relative">
      <Canvas
        camera={{ position: [0, 3, 9], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <React.Suspense fallback={null}>
          <PrinterScene />
        </React.Suspense>
      </Canvas>

      {/* Fade overlay at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
        }}
      />
    </div>
  )
}
