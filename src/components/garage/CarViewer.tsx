import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import * as THREE from "three";
import type { Car } from "@/data/types";

/* ------------------------------------------------------------------ */
/* Procedural F1 car — each regulated component is its own group so it
   can be selected, highlighted and annotated. Stylised, not to scale. */
/* ------------------------------------------------------------------ */

type ComponentId = string;

const CAR_LENGHT = 5.6; // metres, approximates the regulated envelope

function Wheel({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.x -= delta * 2.2; // slow roll for life
  });
  return (
    <group ref={ref} position={position}>
      <mesh rotation-y={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.42, 24]} />
        <meshStandardMaterial color="#151517" roughness={0.85} />
      </mesh>
      <mesh rotation-y={Math.PI / 2} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.44, 16]} />
        <meshStandardMaterial
          color="#2a2a2e"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

interface PartProps {
  color: string;
  onSelect: (id: ComponentId, e: ThreeEvent<MouseEvent>) => void;
  onHover: (id: ComponentId | null) => void;
  selected: ComponentId | null;
  hovered: ComponentId | null;
}

function usePartHandlers(
  id: ComponentId,
  onSelect: PartProps["onSelect"],
  onHover: PartProps["onHover"],
  selected: ComponentId | null,
  hovered: ComponentId | null,
) {
  const isSel = selected === id;
  const isHover = hovered === id;
  const emissive = isSel ? "#e10600" : isHover ? "#5a6070" : "#000000";
  const emissiveIntensity = isSel ? 0.45 : isHover ? 0.3 : 0;
  return {
    onPointerDown: (e: ThreeEvent<MouseEvent>) => onSelect(id, e),
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover(id);
    },
    onPointerOut: () => onHover(null),
    emissive,
    emissiveIntensity,
  };
}

function FrontWing({ color, ...sel }: PartProps) {
  const h = usePartHandlers(
    "front-wing",
    sel.onSelect,
    sel.onHover,
    sel.selected,
    sel.hovered,
  );
  return (
    <group position={[-2.45, 0.22, 0]} name="Front Wing">
      <mesh castShadow {...h}>
        <boxGeometry args={[0.55, 0.05, 2.0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.35}
          roughness={0.35}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      <mesh position={[-0.1, -0.08, 0]} {...h}>
        <boxGeometry args={[0.5, 0.04, 1.9]} />
        <meshStandardMaterial
          color="#202024"
          metalness={0.4}
          roughness={0.4}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      {[1.02, -1.02].map((z) => (
        <mesh key={z} position={[0, 0.02, z]} castShadow {...h}>
          <boxGeometry args={[0.62, 0.3, 0.05]} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.4}
            emissive={h.emissive}
            emissiveIntensity={h.emissiveIntensity}
          />
        </mesh>
      ))}
    </group>
  );
}

function Nose({ color, ...sel }: PartProps) {
  const h = usePartHandlers(
    "nose",
    sel.onSelect,
    sel.onHover,
    sel.selected,
    sel.hovered,
  );
  return (
    <group name="Nose & Chassis">
      {/* nose cone */}
      <mesh position={[-1.7, 0.42, 0]} rotation-z={0.08} castShadow {...h}>
        <boxGeometry args={[1.5, 0.22, 0.4]} />
        <meshStandardMaterial
          color={color}
          metalness={0.45}
          roughness={0.3}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      {/* monocoque */}
      <mesh position={[0, 0.5, 0]} castShadow {...h}>
        <boxGeometry args={[2.4, 0.5, 0.75]} />
        <meshStandardMaterial
          color={color}
          metalness={0.45}
          roughness={0.3}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      {/* cockpit halo */}
      <mesh
        position={[0.45, 0.88, 0]}
        rotation-x={Math.PI / 2}
        castShadow
        {...h}
      >
        <torusGeometry args={[0.32, 0.045, 10, 24, Math.PI]} />
        <meshStandardMaterial
          color="#16161a"
          metalness={0.7}
          roughness={0.25}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      <mesh position={[0.32, 0.72, 0]} castShadow {...h}>
        <cylinderGeometry args={[0.045, 0.045, 0.55, 8]} />
        <meshStandardMaterial
          color="#16161a"
          metalness={0.7}
          roughness={0.25}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      {/* driver helmet */}
      <mesh position={[0.55, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.17, 16, 12]} />
        <meshStandardMaterial color="#d8d8dc" metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Suspension({ ...sel }: PartProps) {
  const h = usePartHandlers(
    "suspension",
    sel.onSelect,
    sel.onHover,
    sel.selected,
    sel.hovered,
  );
  const arms: {
    from: [number, number, number];
    to: [number, number, number];
  }[] = [];
  for (const side of [0.78, -0.78]) {
    arms.push({ from: [-1.7, 0.45, side * 0.2], to: [-1.98, 0.42, side] });
    arms.push({ from: [-1.5, 0.6, side * 0.2], to: [-1.98, 0.42, side] });
    arms.push({ from: [1.35, 0.45, side * 0.2], to: [1.62, 0.42, side] });
    arms.push({ from: [1.2, 0.6, side * 0.2], to: [1.62, 0.42, side] });
  }
  return (
    <group name="Suspension">
      {arms.map((a, i) => {
        const from = new THREE.Vector3(...a.from);
        const to = new THREE.Vector3(...a.to);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const len = from.distanceTo(to);
        return (
          <mesh
            key={i}
            position={mid}
            quaternion={new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              to.clone().sub(from).normalize(),
            )}
            {...h}
          >
            <cylinderGeometry args={[0.028, 0.028, len, 6]} />
            <meshStandardMaterial
              color="#2e2e34"
              metalness={0.75}
              roughness={0.3}
              emissive={h.emissive}
              emissiveIntensity={h.emissiveIntensity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Floor({ color, ...sel }: PartProps) {
  const h = usePartHandlers(
    "floor",
    sel.onSelect,
    sel.onHover,
    sel.selected,
    sel.hovered,
  );
  return (
    <group name="Floor">
      <mesh position={[0.2, 0.14, 0]} castShadow {...h}>
        <boxGeometry args={[4.2, 0.1, 1.6]} />
        <meshStandardMaterial
          color="#1c1c20"
          metalness={0.3}
          roughness={0.55}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      {/* diffuser ramp */}
      <mesh position={[2.35, 0.2, 0]} rotation-x={-0.35} castShadow {...h}>
        <boxGeometry args={[0.7, 0.08, 1.45]} />
        <meshStandardMaterial
          color="#1c1c20"
          metalness={0.3}
          roughness={0.55}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
    </group>
  );
}

function Sidepods({ color, ...sel }: PartProps) {
  const h = usePartHandlers(
    "sidepods",
    sel.onSelect,
    sel.onHover,
    sel.selected,
    sel.hovered,
  );
  return (
    <group name="Sidepods">
      {[0.52, -0.52].map((z) => (
        <group key={z}>
          <mesh position={[0.1, 0.42, z]} castShadow {...h}>
            <boxGeometry args={[1.7, 0.34, 0.5]} />
            <meshStandardMaterial
              color={color}
              metalness={0.4}
              roughness={0.35}
              emissive={h.emissive}
              emissiveIntensity={h.emissiveIntensity}
            />
          </mesh>
          <mesh
            position={[-0.62, 0.46, z]}
            rotation-y={z > 0 ? -0.4 : 0.4}
            castShadow
            {...h}
          >
            <boxGeometry args={[0.34, 0.26, 0.42]} />
            <meshStandardMaterial
              color="#141416"
              metalness={0.5}
              roughness={0.4}
              emissive={h.emissive}
              emissiveIntensity={h.emissiveIntensity}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EngineCover({ color, ...sel }: PartProps) {
  const h = usePartHandlers(
    "engine-cover",
    sel.onSelect,
    sel.onHover,
    sel.selected,
    sel.hovered,
  );
  return (
    <group name="Engine Cover & Halo">
      <mesh position={[0.9, 0.78, 0]} rotation-z={-0.12} castShadow {...h}>
        <boxGeometry args={[1.7, 0.42, 0.42]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.35}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      {/* roll hoop / airbox */}
      <mesh position={[0.35, 1.02, 0]} castShadow {...h}>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.35}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      <mesh position={[0.35, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.12, 12]} />
        <meshStandardMaterial color="#0d0d10" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function RearWing({ color, ...sel }: PartProps) {
  const h = usePartHandlers(
    "rear-wing",
    sel.onSelect,
    sel.onHover,
    sel.selected,
    sel.hovered,
  );
  return (
    <group position={[2.35, 0.85, 0]} name="Rear Wing">
      <mesh castShadow {...h}>
        <boxGeometry args={[0.42, 0.05, 1.55]} />
        <meshStandardMaterial
          color={color}
          metalness={0.35}
          roughness={0.35}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      <mesh position={[0.1, -0.12, 0]} rotation-z={-0.2} castShadow {...h}>
        <boxGeometry args={[0.4, 0.04, 1.5]} />
        <meshStandardMaterial
          color="#202024"
          metalness={0.4}
          roughness={0.4}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
      {[0.8, -0.8].map((z) => (
        <mesh key={z} position={[0, -0.05, z]} castShadow {...h}>
          <boxGeometry args={[0.55, 0.42, 0.05]} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.4}
            emissive={h.emissive}
            emissiveIntensity={h.emissiveIntensity}
          />
        </mesh>
      ))}
      {/* DRS actuator pod */}
      <mesh position={[0.18, 0.06, 0]} {...h}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial
          color="#3a3a40"
          metalness={0.6}
          roughness={0.3}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </mesh>
    </group>
  );
}

function CarModel({
  color,
  selected,
  hovered,
  onSelect,
  onHover,
  autoRotate,
}: {
  color: string;
  selected: ComponentId | null;
  hovered: ComponentId | null;
  onSelect: (id: ComponentId) => void;
  onHover: (id: ComponentId | null) => void;
  autoRotate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current && autoRotate) group.current.rotation.y += delta * 0.25;
  });

  const handleSelect = (id: ComponentId, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };

  const props: PartProps = {
    color,
    onSelect: handleSelect,
    onHover,
    selected,
    hovered,
  };

  return (
    <group ref={group} position={[0, 0.4, 0]}>
      <FrontWing {...props} />
      <Nose {...props} />
      <Suspension {...props} />
      <Floor {...props} />
      <Sidepods {...props} />
      <EngineCover {...props} />
      <RearWing {...props} />
      <Wheel position={[-1.98, 0.36, 0.85]} />
      <Wheel position={[-1.98, 0.36, -0.85]} />
      <Wheel position={[1.62, 0.36, 0.85]} />
      <Wheel position={[1.62, 0.36, -0.85]} />
      {/* rear light */}
      <mesh position={[2.68, 0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color="#ff2222"
          emissive="#ff2222"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

type CameraView = {
  pos: [number, number, number];
  target: [number, number, number];
};

const VIEWS = {
  "three-quarter": { pos: [-4.2, 1.9, 4.2], target: [0, 0.55, 0] },
  front: { pos: [-5.4, 0.9, 0], target: [0, 0.55, 0] },
  side: { pos: [0, 0.9, 5.6], target: [0, 0.55, 0] },
  rear: { pos: [5.4, 1.2, 0], target: [0, 0.55, 0] },
  top: { pos: [0.2, 5.6, 0.8], target: [0, 0, 0] },
} satisfies Record<string, CameraView>;

const componentCameras: Record<string, CameraView> = {
  "front-wing": { pos: [-3.4, 0.6, 1.6], target: [-2.4, 0.3, 0] },
  nose: { pos: [-2.6, 1.0, 2.0], target: [-1.2, 0.6, 0] },
  suspension: { pos: [-2.4, 0.8, 2.2], target: [-1.7, 0.45, 0.6] },
  floor: { pos: [0.5, 0.7, 3.0], target: [0.2, 0.2, 0] },
  sidepods: { pos: [0.2, 1.0, 2.6], target: [0.1, 0.45, 0] },
  "engine-cover": { pos: [1.4, 1.6, 2.2], target: [0.7, 0.85, 0] },
  "rear-wing": { pos: [3.6, 1.4, 2.0], target: [2.35, 0.85, 0] },
};

function CameraRig({
  view,
  controls,
}: {
  view: { pos: [number, number, number]; target: [number, number, number] };
  controls: React.MutableRefObject<any>;
}) {
  const desiredPos = useRef(new THREE.Vector3(...view.pos));
  const desiredTarget = useRef(new THREE.Vector3(...view.target));

  useEffect(() => {
    desiredPos.current.set(...view.pos);
    desiredTarget.current.set(...view.target);
  }, [view]);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    camera.position.lerp(desiredPos.current, 1 - Math.exp(-3 * delta));
    if (controls.current) {
      controls.current.target.lerp(
        desiredTarget.current,
        1 - Math.exp(-3 * delta),
      );
      controls.current.update();
    }
  });
  return null;
}

export interface CarViewerProps {
  car: Car;
  teamColor: string;
  teamName: string;
}

export function CarViewer({ car, teamColor, teamName }: CarViewerProps) {
  const [selected, setSelected] = useState<ComponentId | null>(null);
  const [hovered, setHovered] = useState<ComponentId | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewName, setViewName] = useState<keyof typeof VIEWS>("three-quarter");
  const controls = useRef<any>(null);

  const view =
    (selected ? componentCameras[selected] : undefined) ?? VIEWS[viewName];
  const annotation = selected
    ? car.components.find((c) => c.id === selected)
    : null;

  const reset = () => {
    setSelected(null);
    setViewName("three-quarter");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* Studio viewport */}
      <div className="relative min-h-[320px] flex-1 bg-graphite">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: VIEWS["three-quarter"].pos, fov: 45 }}
          onPointerMissed={() => setSelected(null)}
        >
          <color attach="background" args={["#0b0b0e"]} />
          <fog attach="fog" args={["#0b0b0e", 9, 22]} />
          <ambientLight intensity={0.35} color="#3a3d46" />
          <spotLight
            position={[0, 8, 2]}
            angle={0.5}
            penumbra={0.9}
            intensity={220}
            color="#f5f2ea"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <spotLight
            position={[-6, 4, -3]}
            angle={0.6}
            penumbra={1}
            intensity={60}
            color="#e10600"
          />
          <directionalLight position={[4, 6, 4]} intensity={0.6} />
          <CarModel
            color={teamColor}
            selected={selected}
            hovered={hovered}
            onSelect={setSelected}
            onHover={setHovered}
            autoRotate={autoRotate && !selected}
          />
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.75}
            scale={14}
            blur={2.4}
            far={3}
          />
          {/* floor disc */}
          <mesh rotation-x={-Math.PI / 2} position-y={-0.002} receiveShadow>
            <circleGeometry args={[7, 48]} />
            <meshStandardMaterial
              color="#101013"
              roughness={0.7}
              metalness={0.25}
            />
          </mesh>
          <Environment resolution={128}>
            <Lightformer
              intensity={2.2}
              position={[0, 5, 0]}
              scale={[10, 10, 1]}
              rotation-x={Math.PI / 2}
            />
            <Lightformer
              intensity={0.9}
              color="#8b93a5"
              position={[-5, 1, -1]}
              rotation-y={Math.PI / 2}
              scale={[16, 1, 1]}
            />
            <Lightformer
              intensity={0.9}
              color="#8b93a5"
              position={[5, 1, 1]}
              rotation-y={-Math.PI / 2}
              scale={[16, 1, 1]}
            />
            <Lightformer
              intensity={1.4}
              color={teamColor}
              position={[0, 1.2, -5]}
              scale={[8, 0.6, 1]}
            />
          </Environment>
          <OrbitControls
            ref={controls}
            enableDamping
            dampingFactor={0.08}
            minDistance={2.2}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2.05}
          />
          <CameraRig view={view} controls={controls} />
        </Canvas>

        {/* viewport overlay controls */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-4">
          <div className="pointer-events-auto flex flex-wrap gap-1.5">
            {(Object.keys(VIEWS) as (keyof typeof VIEWS)[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSelected(null);
                  setViewName(v);
                }}
                className={`rounded-sm border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                  viewName === v && !selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/70 text-muted-foreground hover:text-foreground backdrop-blur"
                }`}
              >
                {v === "three-quarter" ? "3/4" : v}
              </button>
            ))}
          </div>
          <div className="pointer-events-auto flex gap-1.5">
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className="rounded-sm border border-border bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground backdrop-blur"
            >
              {autoRotate ? "Stop spin" : "Auto spin"}
            </button>
            <button
              onClick={reset}
              className="rounded-sm border border-border bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground backdrop-blur"
            >
              Reset view
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute left-4 top-4">
          <p className="eyebrow text-[10px] text-muted-foreground">
            {teamName} · {car.designation}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Drag to rotate · scroll to zoom · click a component
          </p>
        </div>
      </div>

      {/* Annotation panel */}
      <aside className="w-full shrink-0 border-t border-border bg-card p-5 lg:h-full lg:w-96 lg:overflow-y-auto lg:border-l lg:border-t-0">
        <h3 className="eyebrow text-primary">Technical annotation</h3>
        {annotation ? (
          <div className="mt-4">
            <h4 className="headline text-xl">{annotation.name}</h4>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {annotation.plain}
            </p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="eyebrow text-[10px] text-muted-foreground">
                Deeper technical detail
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {annotation.deep}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Select a component on the car — front wing, suspension, floor,
              sidepods, rear wing and more — to read what it does.
            </p>
            <div className="mt-5 space-y-1.5">
              {car.components.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className="w-full rounded-sm border border-border bg-secondary/60 px-3 py-2 text-left text-sm font-semibold transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  {c.name}
                </button>
              ))}
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground/70">
              Stylised geometry for annotation, not a dimensionally accurate CAD
              model. Camera moves to the selected component.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
