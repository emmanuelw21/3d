import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Vector3, Euler } from 'three';

function ThirdPersonControls({ avatarRef, cameraOffset, speed = 0.1 }) {
  const { camera } = useThree();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  const onKeyDown = (event) => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        setMoveForward(true);
        break;
      case 's':
      case 'ArrowDown':
        setMoveBackward(true);
        break;
      case 'a':
      case 'ArrowLeft':
        setMoveLeft(true);
        break;
      case 'd':
      case 'ArrowRight':
        setMoveRight(true);
        break;
      default:
        break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        setMoveForward(false);
        break;
      case 's':
      case 'ArrowDown':
        setMoveBackward(false);
        break;
      case 'a':
      case 'ArrowLeft':
        setMoveLeft(false);
        break;
      case 'd':
      case 'ArrowRight':
        setMoveRight(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state) => {
    if (!avatarRef.current) return;

    const direction = new Vector3();
    const rotation = new Euler(0, camera.rotation.y, 0, 'YXZ');

    if (moveForward) direction.z -= 1;
    if (moveBackward) direction.z += 1;
    if (moveLeft) direction.x -= 1;
    if (moveRight) direction.x += 1;

    direction.normalize().multiplyScalar(speed);
    avatarRef.current.position.add(direction.applyEuler(rotation));

    // Update the avatar's rotation to face the cursor direction
    const { x, y } = state.mouse;
    const cursorDirection = new Euler(y * Math.PI / 2, x * Math.PI, 0, 'YXZ');
    avatarRef.current.rotation.copy(cursorDirection);

    // Update the camera position and orientation
    camera.position.copy(avatarRef.current.position).add(cameraOffset);
    camera.lookAt(avatarRef.current.position);

    // Update the camera to follow the cursor
    const cameraRotation = new Euler(y * Math.PI / 2, x * Math.PI, 0, 'YXZ');
    camera.rotation.copy(cameraRotation);
  });

  return null;
}

const Avatar = React.forwardRef(({ url }, ref) => {
  const { scene } = useGLTF(url);
  const avatarRef = ref;

  useEffect(() => {
    if (avatarRef.current) {
      avatarRef.current.position.set(0, 0, 0); // Initial position of the avatar
    }
  }, [scene]);

  return scene ? <primitive ref={avatarRef} object={scene} /> : null;
});

function BaseModel({ url }) {
  const { scene } = useGLTF(url);
  const controls = useRef();

  return (
    <>
      {scene && <primitive object={scene} />}
      <OrbitControls ref={controls} />
    </>
  );
}

function App() {
  const avatarRef = useRef();
  const cameraOffset = new Vector3(0, 2, -5); // Offset for third-person view (above and behind)

  useEffect(() => {
    if (avatarRef.current) {
      const camera = avatarRef.current.parent;
      camera.position.copy(avatarRef.current.position).add(cameraOffset);
      camera.lookAt(avatarRef.current.position);
    }
  }, [avatarRef]);

  return (
    <Canvas style={{ height: '100vh', width: '100vw' }} camera={{ position: [0, 2, 5] }} backgroundColor="lightblue">
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <BaseModel url="/models/environment.glb" />
      <Avatar url="/models/face.glb" ref={avatarRef} />
      <ThirdPersonControls avatarRef={avatarRef} cameraOffset={cameraOffset} />
      <OrbitControls enablePan={false} enableRotate enableZoom={false} />
    </Canvas>
  );
}

export default App;
