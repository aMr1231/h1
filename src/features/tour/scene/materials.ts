import { MeshStandardMaterial } from 'three'

/**
 * Общие материалы сцены (переиспользуются всеми объектами — меньше материалов и шейдеров).
 * Палитра сдержанная: светло-серое оборудование, графитовые детали, один акцент — цвет продукта.
 */
const std = (color: string, extra: Partial<ConstructorParameters<typeof MeshStandardMaterial>[0]> = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...extra })

export const MAT = {
  floor: std('#e2e5e8', { roughness: 0.92 }),
  floorZone: std('#d9dde1', { roughness: 0.95 }),
  ground: std('#d3d7db', { roughness: 1 }),
  wall: std('#cdd2d7', { roughness: 0.9 }),
  wallDark: std('#aeb5bc', { roughness: 0.9 }),
  steel: std('#7f8891', { roughness: 0.5, metalness: 0.45 }),
  machine: std('#e4e7ea', { roughness: 0.55 }),
  machineDark: std('#3a4148', { roughness: 0.6 }),
  accent: std('#17708a', { roughness: 0.5 }),
  glassDark: std('#26313a', { roughness: 0.15, metalness: 0.3 }),
  glass: std('#b9d3dc', { roughness: 0.1, transparent: true, opacity: 0.18, depthWrite: false }),
  granite: std('#4a4f55', { roughness: 0.35 }),
  safety: std('#d2a93b', { roughness: 0.8 }),
  lane: std('#cdd3d9', { roughness: 0.9 }),
  laneArrow: std('#9aa3ad', { roughness: 0.9 }),
  pallet: std('#b48a5a', { roughness: 0.9 }),
  cardboard: std('#c9a46c', { roughness: 0.95 }),
  casting: std('#5b6168', { roughness: 0.8, metalness: 0.2 }),
  machined: std('#b9c1c9', { roughness: 0.3, metalness: 0.7 }),
  rack: std('#2f5d8a', { roughness: 0.6, metalness: 0.2 }),
  rackBeam: std('#e07b2e', { roughness: 0.6 }),
  truck: std('#f1f2f3', { roughness: 0.5 }),
  truckCab: std('#2c3e50', { roughness: 0.45 }),
  rubber: std('#24282c', { roughness: 0.9 }),
  wood: std('#9c7a52', { roughness: 0.85 }),
  monitor: std('#1c2126', { roughness: 0.3 }),
}
