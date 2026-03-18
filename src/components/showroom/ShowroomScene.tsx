import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Float, Text, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import ProductFrame from './ProductFrame';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ShowroomSceneProps {
  products: Product[];
  onProductClick: (id: string) => void;
}

const ShowroomScene = ({ products, onProductClick }: ShowroomSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Arrange products on 3 walls (back, left, right)
  const productPositions = useMemo(() => {
    const positions: { position: [number, number, number]; rotation: [number, number, number]; product: Product }[] = [];
    const perWall = Math.ceil(products.length / 3);

    products.forEach((product, i) => {
      const wall = Math.floor(i / perWall);
      const indexOnWall = i % perWall;
      const spacing = 2.8;
      const wallWidth = perWall * spacing;

      if (wall === 0) {
        // Back wall
        const x = (indexOnWall - (Math.min(perWall, products.length) - 1) / 2) * spacing;
        positions.push({
          position: [x, 1.2, -5],
          rotation: [0, 0, 0],
          product,
        });
      } else if (wall === 1) {
        // Left wall
        const z = -5 + indexOnWall * spacing + 1.5;
        positions.push({
          position: [-6, 1.2, z],
          rotation: [0, Math.PI / 2, 0],
          product,
        });
      } else {
        // Right wall
        const z = -5 + indexOnWall * spacing + 1.5;
        positions.push({
          position: [6, 1.2, z],
          rotation: [0, -Math.PI / 2, 0],
          product,
        });
      }
    });

    return positions;
  }, [products]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.5} castShadow color="#fff5e0" />
      
      {/* Spotlights on walls */}
      <spotLight position={[0, 5, -3]} angle={0.6} penumbra={0.8} intensity={1.5} color="#c9a227" castShadow target-position={[0, 1, -5]} />
      <spotLight position={[-4, 5, 0]} angle={0.6} penumbra={0.8} intensity={1} color="#fff5e0" target-position={[-6, 1, 0]} />
      <spotLight position={[4, 5, 0]} angle={0.6} penumbra={0.8} intensity={1} color="#fff5e0" target-position={[6, 1, 0]} />

      {/* Ceiling lights */}
      {[-3, 0, 3].map((x) => (
        <group key={x} position={[x, 4.9, -1]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
            <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} emissive="#c9a227" emissiveIntensity={0.5} />
          </mesh>
          <pointLight intensity={0.8} distance={8} color="#fff5e0" position={[0, -0.1, 0]} />
        </group>
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <MeshReflectorMaterial
          mirror={0.4}
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={0.6}
          roughness={0.8}
          depthScale={1.2}
          color="#0a0a0a"
          metalness={0.5}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#0d0d0d" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.5, -6]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#0f0f0f" />
      </mesh>

      {/* Right wall */}
      <mesh position={[7, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#0f0f0f" />
      </mesh>

      {/* Store sign */}
      <Float speed={1} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, 3.8, -5.9]}
          fontSize={0.45}
          color="#c9a227"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
          fontWeight={700}
        >
          iTechGlass
        </Text>
      </Float>

      {/* Gold accent line on back wall */}
      <mesh position={[0, 3.3, -5.95]}>
        <boxGeometry args={[8, 0.01, 0.01]} />
        <meshStandardMaterial color="#c9a227" emissive="#c9a227" emissiveIntensity={0.5} />
      </mesh>

      {/* Products */}
      <group ref={groupRef}>
        {productPositions.map(({ position, rotation, product }) => (
          <ProductFrame
            key={product.id}
            position={position}
            rotation={rotation}
            image={product.image}
            name={product.name}
            price={product.price}
            onClick={() => onProductClick(product.id)}
          />
        ))}
      </group>

      {/* Pedestal displays for featured items */}
      {products.slice(0, 2).map((product, i) => (
        <group key={`pedestal-${product.id}`} position={[i === 0 ? -2 : 2, 0, 1]}>
          {/* Pedestal */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.6, 0.8, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Gold ring */}
          <mesh position={[0, 0.8, 0]}>
            <torusGeometry args={[0.52, 0.015, 8, 32]} />
            <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} emissive="#c9a227" emissiveIntensity={0.3} />
          </mesh>
          {/* Spotlight on pedestal */}
          <spotLight position={[0, 4, 0]} angle={0.3} penumbra={0.5} intensity={2} color="#c9a227" target-position={[0, 0.8, 0]} />
        </group>
      ))}

      <Environment preset="night" />
    </>
  );
};

export default ShowroomScene;
