import { FormEvent, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Badge from "./Badge";
import { SignOutButton } from "@clerk/clerk-react";

import * as THREE from 'three'
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Doc } from "../convex/_generated/dataModel";

function Box(props: {
    box: Doc<"boxes"> & {color: string},
  }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)

  const setActive = useMutation(api.boxes.setActive);
  const box = props.box;

  // meshRef.current.rotation.x = props.xRotation;

  useFrame((state, delta) => (meshRef.current.rotation.x += delta))
  return (
    <mesh
      position={new THREE.Vector3(box.position[0] * 2.4, box.position[1] * 2.4, box.position[2] * 2.4)}
      //rotation={new THREE.Euler(props.xRotation)}
      ref={meshRef}
      scale={box.active ? 1.5 : 1}
      onClick={(event) => setActive({
        id: box._id,
        active: !box.active,
      })}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : (box.active ? 'orange': box.color) } />
    </mesh>
  )
}

export default function App() {
  const boxes = useQuery(api.boxes.list) || [];
  const scores = useQuery(api.boxes.getScores) || [];

  const addBox = useMutation(api.boxes.add);

  async function handleAddBox(event: FormEvent) {
    event.preventDefault();
    await addBox();
  }
  return (
    <main>
      <h1>Convex Three Fiber</h1>
      {Badge()}
      <Canvas style={{ height: "80vh"}}>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {boxes.map((box) => (
          <Box box={box} />
        ))}
        <OrbitControls />
      </Canvas>
      <div>+1 if your box is clicked, -1 otherwise</div>
      <form onSubmit={handleAddBox}>
        <input type="submit" value="Add box" />
        <SignOutButton />
      </form>
      <h2>Score board</h2>
      <ul>
        {scores.map((score) => (
          <li key={score.userId.toString()}>
            <span>{score.name}:</span>
            <span>{score.score}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}