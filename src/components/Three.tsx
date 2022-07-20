import { Effects, OrbitControls, OrbitControlsProps, useGLTF } from "@react-three/drei";
import { Canvas, extend, MeshBasicMaterialProps, Object3DNode, useFrame, useThree, Vector3 } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { BoxGeometry, BufferGeometry, Color, DoubleSide, GridHelper, Group, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Vector3 as V3 } from "three";
import { UnrealBloomPass } from "three-stdlib";
import { useSpring, a, SpringValue } from '@react-spring/three'


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

const CameraAnimation = (props: any) => {
    const [started, setStarted] = useState(false)
    const vec = new V3();
  
    useEffect(() => {
      setStarted(true);
    });
  
    useFrame(state => {
        const position:V3 = props.pos ? props.pos : [10, -5, 5]
        const distance = state.camera.position.distanceTo(position)
        if (distance > 0.8) {
            if (started) {
              state.camera.lookAt(10,5,0);
              state.camera.position.lerp(vec.set(15-position.x, state.camera.position.y, position.z + 10), .08)
            } 

        }
        return null
        
    })
     return null;
  }

  function BoxScene () {
      const [heightValues, setHeightValue] = useState(new Array(100).fill(null).map(() => Math.floor(Math.random() * 3 * 100) / 100))
      let maxHeightIndex = 0
      heightValues.forEach((value, i) => { if (value > heightValues[maxHeightIndex]) { maxHeightIndex = i } })
      const boxTable = new Array(10).fill(null).map((v, y) => {
          return new Array(10).fill(null).map((v, x) => {
              const height = heightValues[y * 10 + x]
              return <Box key={x + '' + y} position={[1.5 * x - 5, 1.5 * y - 5, height / 2]} scale={[1, 1, height]} isHighest={height === heightValues[maxHeightIndex]} />
          })
      })
      return (
          <Canvas camera={{ fov: 45, position:  [10, -5, 5]}} style={{ height: '100vh', width: '100vw' }}>
              <CameraAnimation />
              <OrbitControls/>
              <ambientLight intensity={0.5} />
              <fog attach="fog" args={['#B8860B', 5, 20]} />
              <Effects disableGamma>
                  <customElement threshold={0.4} strength={0.3} radius={0.6} />
              </Effects>
              <pointLight position={[10, 10, 10]} intensity={1} />
              {boxTable}
              <mesh scale={[1, 1, 1]} >
                  <planeGeometry args={[40, 40, 40]}></planeGeometry>
                  <meshPhongMaterial side={DoubleSide} color={'#666644'}></meshPhongMaterial>
              </mesh>
          </Canvas>
      )
  }

  function BuildingScene () {
    
    const _getHighest = () => {
        let highestFloorId = 0
        buildingFloors.forEach((value, i) => { if (value > buildingFloors[highestFloorId]) { highestFloorId = i } })
        return highestFloorId
    }
    
    const [buildingFloors, setFloorsValue] = useState(new Array(100).fill(null).map(() => Math.floor(Math.random() * 30)))
    const [buildingClicked, setCanvasHovered] = useState(undefined) as [MutableRefObject<Group> | undefined, any]
    const [isAnyHovered, setisAnyHovered] = useState(false) as [boolean, any]
    const highestBuildingId = _getHighest()
    const buildingTable = new Array(10).fill(null).map((v, y) => {
        return new Array(10).fill(null).map((v, x) => {
            const height = buildingFloors[y * 10 + x]
            const modelId = +(y * 10 + x)
            return <Model 
            key={modelId}
            position={[2 * x - 0, 2 * y - 0, 0]} 
            floorCount={height} 
            isHighest={height === buildingFloors[highestBuildingId]} 
            onPointerOver={(ref:MutableRefObject<Group>)=> {
                setCanvasHovered(ref)
            }}
            setHovered={(isHovered: boolean)=>{
                setisAnyHovered(isHovered)
            }}
            isAnyHovered={isAnyHovered}
            />
        })
    })
    const getPosition = (building:MutableRefObject<Group> | undefined) => {
        return building ? [building.current.position.x, building.current.position.y, -0.1] : [0,0,-0.1]
    }
    const getReversePosition = (building:MutableRefObject<Group> | undefined) => {
        return [0,0,-0.1]
    }
    const animationProps = useSpring({
        position: getPosition(buildingClicked)
    })
    const orbitRef = useRef<MutableRefObject<OrbitControlsProps>>();
    const enableCameraLooking = true
    useEffect( () => {
        // if (!orbitRef.current) return 
        // console.log((orbitRef.current as any).target);
        // if (!(orbitRef.current as any).target) return 
        // (orbitRef.current as any).target = new V3(5,5,5);
        // console.log((orbitRef.current as any).target);
        // (orbitRef.current as any).update()
    })
      return (
        <Canvas camera={{ fov: 45, position:  [10, -5, 5]}} style={{ height: '100vh', width: '100vw' }}>
            {/* {enableCameraLooking ? <CameraAnimation pos={buildingClicked?.current.position}/> : ''} */}
            <OrbitControls ref={orbitRef} target={[10,5,0]}/>
            <ambientLight intensity={0.3} />
            <spotLight intensity={0.3} position={[15,-5, 5]} color={'#ff0000'}/>
            <spotLight intensity={0.3} position={[0,-10, 5]} color={'#ffff00'}/>
            <fog attach="fog" args={['#B8860B', 15, 30]} />
            <Effects disableGamma>
                <customElement threshold={0.6} strength={0.25} radius={0.6} />
            </Effects>
            <pointLight position={[10, 10, 10]} intensity={1} />
            {buildingTable}
            <a.mesh scale={[10, 10, 10]} position={animationProps.position} >
                <planeGeometry args={[40, 40, 40]}></planeGeometry>
                <meshPhongMaterial side={DoubleSide} color={'#666644'}></meshPhongMaterial>
            </a.mesh>
        </Canvas>
      )
  }

export default function ThreeDom() {
    return (
        // <BoxScene></BoxScene>
        <BuildingScene></BuildingScene>
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

const removeSomeFloors = (floors: Object3D, floorCount: number) => {
    const _removeExtraFloors = (floorNumber: number) => {
        const floorToRemove = floors.getObjectByName(`nadi_f${floorNumber + 1}`)
        floorToRemove?.scale.setScalar(0)
    }
    const _removeRoofAndTop = () => {
        const top = floors.getObjectByName(`NADI_Top`)
        const roof = floors.getObjectByName(`nadi_f13`)
        top?.scale.setScalar(0)
        roof?.scale.setScalar(0)
    }
    _removeExtraFloors(floorCount)
    _removeRoofAndTop()
}

const recoverFloors = (floors: Object3D, floorCount: number) => {
    const _removeExtraFloors = (floorNumber: number) => {
        const floorToRemove = floors.getObjectByName(`nadi_f${floorNumber + 1}`)
        floorToRemove?.scale.setScalar(1)
    }
    const _removeRoofAndTop = () => {
        const top = floors.getObjectByName(`NADI_Top`)
        const roof = floors.getObjectByName(`nadi_f13`)
        top?.scale.setScalar(1)
        roof?.scale.setScalar(1)
    }
    _removeExtraFloors(floorCount)
    _removeRoofAndTop()
}

function Model(props: any) {
    const gltf = useGLTF('./src/assets/NADI_headquarter.gltf');
    const scene = useMemo(() => gltf.scene.clone(), [gltf]);
    const ref = useRef<THREE.Mesh>(null!)
    const material = new MeshStandardMaterial({
        opacity: 1,
        transparent: true,
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
    const [sliceMode, toggleSliceMode] = useState(false)
    if (sliceMode) {
        console.log('sliceMode');
        removeSomeFloors(floors, props.floorCount)
    }   else {
        recoverFloors(floors, props.floorCount)
    }
    

    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    let color: string | Color = 'orange'
    let opacity: number = 1
    if (hovered) {
        color = new Color(0.5, 0.5, 0.5)
    } else if (props.isHighest) {
        color = 'hotpink'
    }    
    if (props.isAnyHovered && !hovered) {
        opacity = 1
    }   else {
        opacity = 1
    }
    scene.traverse((object: any) => {
        if (object.material) {
            object.material = material
            object.material.color.set(color);
            (object.material as MeshPhongMaterial).opacity = opacity
        }
    })
    return (<primitive {...props}
        onClick={() => click(!clicked)}
        onPointerOver={() => {
            props.onPointerOver(ref)
            hover(true)
            toggleSliceMode(true)
            props.setHovered(true)
        }}
        onPointerOut={() => {
            hover(false)
            toggleSliceMode(false)
            props.setHovered(false)
        }}
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

