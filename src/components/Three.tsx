import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, Vector3 } from "@react-three/fiber";
import { MutableRefObject, useRef, useState } from "react";
import { BoxGeometry, Color, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D } from "three";


export default function ThreeDom() {
    const onj = new Mesh(new BoxGeometry(1,1,1), new MeshPhongMaterial({color: 'red'}))
    // onj.rotateX
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
            <Model floorCount={22}/>
        </Canvas>
    )
}

const addFloors = (floors: Object3D, count: number) => {
    const _appendFloor = (addFloorCount: number, parent: Object3D) => {
        const newFloor = parent.getObjectByName('nadi_f12')!.clone() as Mesh<any>
        newFloor.name = `nadi_f${12 + addFloorCount}`
        newFloor.position.setY(newFloor.position.y + (283.956 * addFloorCount))
        parent.add(newFloor)
    }
    const _offsetRoof = (addFloorCount: number, parent: Object3D) => {
        const roof = floors.getObjectByName('NADI_Top')!
        const top = floors.getObjectByName('nadi_f13')!
        roof.position.setY(roof.position.y + (283.956 * (count - 1)))
        top.position.setY(top.position.y + (283.956 * (count - 1)))
    }
    for (let i = 0; i < count; i++) {
        _appendFloor(i, floors)
    }
    _offsetRoof(count, floors)
}
 
const reduceFloors = (floors: Object3D, count: number) => {

    const _removeExtraFloors = (floorNumber:number) => {
        const floorToRemove = floors.getObjectByName(`nadi_f${floorNumber+1}`)
        floorToRemove?.removeFromParent()
    }
    const _queryRemainFloors = () => {
        return floors.children.filter( floor => {
            const roof = floor.name.includes('NADI_Top')
            const normalFloor = floor.name.includes('nadi_f')
            return roof || normalFloor
        })
    }
    const _offsetFloorsDownward = (floors: Object3D[]) => floors.forEach( f => f.position.setY(f.position.y-283.956))

    for (let i = 0; i < count; i++) {
        _removeExtraFloors(i)
        const remainFloors = _queryRemainFloors()
        _offsetFloorsDownward(remainFloors)   
    }
}

function Model({floorCount}: {floorCount: number}) {
    const gltf = useGLTF('./src/assets/NADI_headquarter.gltf')
    const ref = useRef<THREE.Mesh>(null!)
    const floors = gltf.scene.children[0]
    if (12 - floorCount < 0) {
        addFloors(floors, floorCount - 12)
    }   else {
        reduceFloors(floors, 12 - floorCount)
    }
    
    return (<primitive object={gltf.scene}  scale={0.0005} rotation={[Math.PI*0.5,0,0]} ref={ref}/>)
  }
  

function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null!)
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
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
            <boxGeometry args={[1, 1, 1]}/>
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

