import { FLOW_PATH, HALL } from '@/data/demo/tour'
import { MAT } from './materials'
import { Box } from './primitives'

const W = HALL.width
const D = HALL.depth
const H = HALL.height

/** Корпус цеха в разрезе: пол, разметка, задняя и торцевые стены с воротами, колонны, фермы. */
export function Hall() {
  const columnsX = [-34, -22, -10, 2, 14, 26, 34]
  const [laneStart, laneEnd] = [FLOW_PATH[0][0], FLOW_PATH[FLOW_PATH.length - 1][0]]
  const laneZ = FLOW_PATH[0][2]
  const laneLength = laneEnd - laneStart

  return (
    <group>
      {/* Внешняя площадка и пол цеха */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={MAT.ground} receiveShadow>
        <planeGeometry args={[160, 110]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={MAT.floor} receiveShadow>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* Стены: задняя глухая, торцевые с воротами приёмки и отгрузки, передняя — низкий парапет (разрез) */}
      <Box p={[0, H / 2, -D / 2]} s={[W, H, 0.3]} m={MAT.wall} />
      <Box p={[0, 0.5, D / 2]} s={[W, 1, 0.3]} m={MAT.wallDark} />
      {[-W / 2, W / 2].map((x) => (
        <group key={x}>
          <Box p={[x, H / 2, -7]} s={[0.3, H, 18]} m={MAT.wall} />
          <Box p={[x, H / 2, 13]} s={[0.3, H, 6]} m={MAT.wall} />
          <Box p={[x, H - 1.25, 6]} s={[0.3, 2.5, 8]} m={MAT.wall} />
          <Box p={[x, H - 2.55, 6]} s={[0.4, 0.15, 8]} m={MAT.safety} />
        </group>
      ))}

      {/* Колонны (передний ряд и покрытие сняты — разрез для обзора) */}
      {columnsX.map((x) => (
        <group key={x}>
          <Box p={[x, H / 2, -D / 2 + 0.45]} s={[0.4, H, 0.4]} m={MAT.steel} />
          <Box p={[x, 0.6, D / 2 - 0.45]} s={[0.4, 1.2, 0.4]} m={MAT.steel} />
        </group>
      ))}
      <Box p={[0, H + 0.15, -D / 2 + 0.45]} s={[W, 0.3, 0.25]} m={MAT.steel} shadow={false} />

      {/* Транспортная полоса потока изделий со стрелками направления */}
      <Box p={[(laneStart + laneEnd) / 2, 0.015, laneZ]} s={[laneLength, 0.03, 1.8]} m={MAT.lane} shadow={false} />
      {[-0.95, 0.95].map((dz) => (
        <Box key={dz} p={[(laneStart + laneEnd) / 2, 0.02, laneZ + dz]} s={[laneLength, 0.035, 0.1]} m={MAT.safety} shadow={false} />
      ))}
      {Array.from({ length: Math.floor(laneLength / 4) }).map((_, i) => (
        <mesh key={i} position={[laneStart + 2 + i * 4, 0.04, laneZ + 0.62]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} material={MAT.laneArrow}>
          <circleGeometry args={[0.22, 3]} />
        </mesh>
      ))}

      {/* Пешеходный проход вдоль задней стены */}
      <Box p={[0, 0.012, -D / 2 + 1.4]} s={[W - 1, 0.024, 0.08]} m={MAT.safety} shadow={false} />
    </group>
  )
}
