import { useRef, useMemo } from 'react';
import { Float, Text } from '@react-three/drei';
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

  // Limit products to fit the room and arrange on 3 walls
  const displayProducts = useMemo(() => products.slice(0, 12), [products]);

  const productPositions = useMemo(() => {
    const positions: { position: [number, number, number]; rotation: [number, number, number]; product: Product }[] = [];
    const total = displayProducts.length;
    const backCount = Math.min(4, total);
    const leftCount = Math.min(4, Math.max(0, total - backCount));
    const rightCount = Math.max(0, total - backCount - leftCount);

    let idx = 0;

    // Back wall — max 4 products, evenly spaced across 10 units
    for (let i = 0; i < backCount; i++, idx++) {
      const spacing = 10 / (backCount + 1);
      const x = -5 + spacing * (i + 1);
      positions.push({ position: [x, 1.2, -5], rotation: [0, 0, 0], product: displayProducts[idx] });
    }

    // Left wall
    for (let i = 0; i < leftCount; i++, idx++) {
      const spacing = 8 / (leftCount + 1);
      const z = -4 + spacing * (i + 1);
      positions.push({ position: [-6, 1.2, z], rotation: [0, Math.PI / 2, 0], product: displayProducts[idx] });
    }

    // Right wall
    for (let i = 0; i < rightCount; i++, idx++) {
      const spacing = 8 / (rightCount + 1);
      const z = -4 + spacing * (i + 1);
      positions.push({ position: [6, 1.2, z], rotation: [0, -Math.PI / 2, 0], product: displayProducts[idx] });
    }

    return positions;
  }, [displayProducts]);

  return (
    <>
      {/* Lighting — brighter for visibility */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow color="#fff5e0" />
      <directionalLight position={[-3, 6, 2]} intensity={0.5} color="#ffffff" />

      {/* Spotlights on walls */}
      <spotLight position={[0, 5, -3]} angle={0.8} penumbra={0.5} intensity={2} color="#c9a227" castShadow />
      <spotLight position={[-4, 5, 0]} angle={0.8} penumbra={0.5} intensity={1.5} color="#fff5e0" />
      <spotLight position={[4, 5, 0]} angle={0.8} penumbra={0.5} intensity={1.5} color="#fff5e0" />

      {/* Ceiling lights */}
      {[-3, 0, 3].map((x) => (
        <group key={x} position={[x, 4.9, -1]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
            <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} emissive="#c9a227" emissiveIntensity={0.5} />
          </mesh>
          <pointLight intensity={1.5} distance={10} color="#fff5e0" position={[0, -0.1, 0]} />
        </group>
      ))}

      {/* Floor — simple material for compatibility */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.5, -6]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#1e1e1e" />
      </mesh>

      {/* Right wall */}
      <mesh position={[7, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#1e1e1e" />
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
      {displayProducts.slice(0, 2).map((product, i) => (
        <group key={`pedestal-${product.id}`} position={[i === 0 ? -2 : 2, 0, 1]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.6, 0.8, 32]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <torusGeometry args={[0.52, 0.015, 8, 32]} />
            <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} emissive="#c9a227" emissiveIntensity={0.3} />
          </mesh>
          <spotLight position={[0, 4, 0]} angle={0.3} penumbra={0.5} intensity={2} color="#c9a227" />
        </group>
      ))}
    </>
  );
};

export default ShowroomScene;
