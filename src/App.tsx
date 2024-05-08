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
  const timeLeft = useQuery(api.rounds.getTimeLeft) || 0;

  const addBox = useMutation(api.boxes.add);

  async function handleAddBox(event: FormEvent) {
    event.preventDefault();
    await addBox();
  }
  return (
    <main>
      <h1>Convex Three Fiber</h1>
      {Badge()}
      <div style={{ width: "100%" }}>
        <div>
          <p>When not activated, a box has the owner play color and bring them -1 point.</p>
          <p>When activated, it is always orange and brings them +1 point.</p>

          <p>What is the best strategy to win?</p>
        </div>
        <div style={{float: "left", width: "70%"}}>
          <Canvas style={{ height: "80vh"}}>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            {boxes.map((box) => (
              <Box box={box} />
            ))}
            <OrbitControls />
          </Canvas>  
          <form onSubmit={handleAddBox}>
            <input type="submit" value="Add box" />
            <SignOutButton />
          </form>
        </div>
        <div style={{float: "right", width: "25%"}}>
          <h2>Time Left</h2>
          <h2>{timeLeft}</h2>
          <h2>Score board</h2>
          <ul>
            {scores.map((score) => (
              <li key={score.userId.toString()}>
                <span>{score.name}:</span>
                <span>{score.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
