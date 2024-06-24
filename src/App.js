import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector3, Euler } from 'three';

function ThirdPersonControls({ avatarRef, speed = 0.1, maxHeight = 10 }) {
  const { camera } = useThree();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [rotateLeft, setRotateLeft] = useState(false);
  const [rotateRight, setRotateRight] = useState(false);
  const [moveUp, setMoveUp] = useState(false);
  const [moveDown, setMoveDown] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });

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
        setRotateLeft(true);
        break;
      case 'd':
      case 'ArrowRight':
        setRotateRight(true);
        break;
      case 'q':
        setMoveUp(true);
        break;
      case 'z':
        setMoveDown(true);
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
        setRotateLeft(false);
        break;
      case 'd':
      case 'ArrowRight':
        setRotateRight(false);
        break;
      case 'q':
        setMoveUp(false);
        break;
      case 'z':
        setMoveDown(false);
        break;
      default:
        break;
    }
  };

  const onMouseMove = (event) => {
    mouseRef.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useFrame(() => {
    if (!avatarRef.current) return;

    const direction = new Vector3();
    const avatarRotation = avatarRef.current.rotation.y;

    if (moveBackward) {
      direction.set(Math.sin(avatarRotation), 0, Math.cos(avatarRotation));
    }
    if (moveForward) {
      direction.set(-Math.sin(avatarRotation), 0, -Math.cos(avatarRotation));
    }
    if (moveUp) {
      direction.set(0, 1, 0);
    }
    if (moveDown && avatarRef.current.position.y > 0) {
      direction.set(0, -1, 0);
    }

    direction.normalize().multiplyScalar(speed);
    avatarRef.current.position.add(direction);

    if (rotateRight) {
      avatarRef.current.rotation.y -= 0.05;
    }
    if (rotateLeft) {
      avatarRef.current.rotation.y += 0.05;
    }

    // Constrain the avatar's height
    if (avatarRef.current.position.y > maxHeight) {
      avatarRef.current.position.y = maxHeight;
    }
    if (avatarRef.current.position.y < 0) {
      avatarRef.current.position.y = 0;
    }

    // Update the camera position to follow the avatar
    const offset = new Vector3(0, 2, -5);
    const rotatedOffset = offset.applyEuler(new Euler(0, avatarRef.current.rotation.y, 0));
    camera.position.copy(avatarRef.current.position).add(rotatedOffset);
    camera.lookAt(avatarRef.current.position);

    // Update the camera rotation based on mouse movement
    const { x, y } = mouseRef.current;
    const rotationAngleY = x * Math.PI; // Full horizontal rotation
    const rotationAngleX = y * Math.PI / 4; // Limited vertical rotation

    camera.rotation.set(rotationAngleX, avatarRef.current.rotation.y, 0, 'YXZ');
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
  return scene ? <primitive object={scene} /> : null;
}

function App() {
  const avatarRef = useRef();

  return (
    <Canvas style={{ height: '100vh', width: '100vw' }} backgroundColor="lightblue">
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <BaseModel url="https://emmanuelw21.github.io/3d/models/environment.glb" />
      <Avatar url="https://emmanuelw21.github.io/3d/models/face.glb" ref={avatarRef} />
      <ThirdPersonControls avatarRef={avatarRef} maxHeight={10} />
    </Canvas>
  );
}

export default App;
