import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, Vector3 } from "@react-three/fiber";
import { MutableRefObject, useRef, useState } from "react";
import { Color } from "three";


export default function ThreeDom() {
    const [heightValues, setHeightValue] = useState(new Array(100).fill(null).map(() => Math.floor(Math.random() * 3 * 100) / 100))
    let maxHeightIndex = 0
    heightValues.forEach((value, i) => { if (value > heightValues[maxHeightIndex]) { maxHeightIndex = i } })
    const buildingTable = new Array(10).fill(null).map((v, y) => {
        return new Array(10).fill(null).map((v, x) => {
            const height = heightValues[y * 10 + x]
            return <Box key={x + '' + y} position={[1.5 * x - 5, 1.5 * y - 5, height / 2]} scale={[1, 1, height]} isHighest={height === heightValues[maxHeightIndex]} />
        })
    })

    return (
        <Canvas style={{ height: '100vh', width: '100vw' }}>
            <OrbitControls makeDefault />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            {buildingTable}
        </Canvas>
    )
}

function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null!)
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    console.log(props.isHighest);
    let color: string | Color = 'orange'
    if (hovered) {
        color = 'hotpink'
    } else if (props.isHighest) {
        color = new Color(0.5,0.5,0.8)
    }
    // useFrame((state, delta) => (ref.current.rotation.x += 0.01))
    return (
        <mesh
            {...props}
            ref={ref}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

