import { Effects, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, extend, MeshBasicMaterialProps, Object3DNode, useFrame, Vector3 } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { BoxGeometry, Color, GridHelper, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PlaneGeometry } from "three";
import { UnrealBloomPass } from "three-stdlib";
import { useSpring, a } from '@react-spring/three'


// Create our custom element
class CustomElement extends UnrealBloomPass { }

// Extend so the reconciler will learn about it
extend({ CustomElement })

// Add types to JSX.Intrinsic elements so primitives pick up on it
declare global {
    namespace JSX {
        interface IntrinsicElements {
            customElement: Object3DNode<CustomElement, typeof CustomElement>
        }
    }
}

export default function ThreeDom() {
    // const [heightValues, setHeightValue] = useState(new Array(100).fill(null).map(() => Math.floor(Math.random() * 3 * 100) / 100))
    // let maxHeightIndex = 0
    // heightValues.forEach((value, i) => { if (value > heightValues[maxHeightIndex]) { maxHeightIndex = i } })
    // const boxTable = new Array(10).fill(null).map((v, y) => {
    //     return new Array(10).fill(null).map((v, x) => {
    //         const height = heightValues[y * 10 + x]
    //         return <Box key={x + '' + y} position={[1.5 * x - 5, 1.5 * y - 5, height / 2]} scale={[1, 1, height]} isHighest={height === heightValues[maxHeightIndex]} />
    //     })
    // })

    const [floorsValues, setFloorsValue] = useState(new Array(100).fill(null).map(() => Math.floor(Math.random() * 30)))
    let maxFloorIndex = 0
    const box = new Mesh(new BoxGeometry(10, 10, 10), new MeshPhongMaterial())
    box.translateZ
    floorsValues.forEach((value, i) => { if (value > floorsValues[maxFloorIndex]) { maxFloorIndex = i } })
    const buildingTable = new Array(10).fill(null).map((v, y) => {
        return new Array(10).fill(null).map((v, x) => {
            const height = floorsValues[y * 10 + x]
            return <Model key={x + '' + y} position={[2 * x - 0, 2 * y - 0, 0]} floorCount={height} isHighest={height === floorsValues[maxFloorIndex]} />
        })
    })
    const [isCanvasClicked, setCanvasClicked] = useState(false)
    const props = useSpring({
        position: isCanvasClicked ? [10, 10, 0] : [0, 0, 0]
    })

    return (
        <Canvas style={{ height: '100vh', width: '100vw' }} onClick={() => setCanvasClicked(!isCanvasClicked)}>
            <OrbitControls makeDefault />
            <ambientLight intensity={0.5} />
            <fog attach="fog" args={['#B8860B', 5, 20]} />
            <Effects disableGamma>
                {/* <unrealBloomPass threshold={1} strength={1.0} radius={0.5} /> */}
                <customElement threshold={0.4} strength={0.3} radius={0.6} />
            </Effects>
            <pointLight position={[10, 10, 10]} intensity={1} />
            {/* {boxTable} */}
            {buildingTable}
            <a.mesh scale={[1, 1, 1]} position={props.position} >
                <planeGeometry args={[40, 40, 40]}></planeGeometry>
                <meshPhongMaterial color={'#666644'}></meshPhongMaterial>
            </a.mesh>
            {/* <Model position={[1 - 0, 0 - 0, 0]} floorCount={12} />
            <Model position={[2 - 0, 0 - 0, 0]} floorCount={12} /> */}
        </Canvas>
    )
}

const addFloors = (floors: Object3D, count: number) => {
    for (let i = 0; i < count; i++) {
        const newFloor = floors.getObjectByName('nadi_f12')!.clone() as Mesh<any>
        const roof = floors.getObjectByName('nadi_f13') as Mesh<any>
        const top = floors.getObjectByName('NADI_Top') as Mesh<any>
        newFloor.name = `nadi_f${12 + i}`
        newFloor.position.setY(283.956 * (i))
        roof.position.setY(283.956 * (0 + i))
        top.position.setY(283.956 * (0 + i))
        floors.add(newFloor)
    }
}

const reduceFloors = (floors: Object3D, count: number) => {

    const _removeExtraFloors = (floorNumber: number) => {
        const floorToRemove = floors.getObjectByName(`nadi_f${floorNumber + 1}`)
        floorToRemove?.removeFromParent()
    }
    const _queryRemainFloors = () => {
        return floors.children.filter(floor => {
            const roof = floor.name.includes('NADI_Top')
            const normalFloor = floor.name.includes('nadi_f')
            return roof || normalFloor
        })
    }
    const _offsetFloorsDownward = (floors: Object3D[]) => floors.forEach(f => f.position.setY(f.position.y - 283.956))

    for (let i = 0; i < count; i++) {
        _removeExtraFloors(i)
        const remainFloors = _queryRemainFloors()
        _offsetFloorsDownward(remainFloors)
    }
}

function Model(props: any) {
    const gltf = useGLTF('./src/assets/NADI_headquarter.gltf');
    const scene = useMemo(() => gltf.scene.clone(), [gltf]);
    const ref = useRef<THREE.Mesh>(null!)
    const material = new MeshPhongMaterial({
        color: 'red',
        // wireframe: true
    })
    const floors = scene.children[0]
    const [floorsSet, markFloorsSet] = useState(false)

    if (!floorsSet) {
        if (12 - props.floorCount < 0) {
            addFloors(floors, props.floorCount - 12)
        } else {
            reduceFloors(floors, 12 - props.floorCount)
        }
        markFloorsSet(true)
        console.log('floorsSet');
    }

    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    let color: string | Color = 'orange'
    if (hovered) {
        color = 'hotpink'
    } else if (props.isHighest) {
        color = new Color(0.5, 0.5, 0.8)
    }
    scene.traverse((object: any) => {
        if (object.material) {
            object.material = material
            object.material.color.set(color)
        }
    })
    return (<primitive {...props}
        onClick={() => click(!clicked)}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        object={scene}
        scale={0.0005}
        rotation={[Math.PI * 0.5, 0, 0]}
        ref={ref} />)

}


function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null!)
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    let color: string | Color = 'orange'
    if (hovered) {
        color = 'hotpink'
    } else if (props.isHighest) {
        color = new Color(0.5, 0.5, 0.8)
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

