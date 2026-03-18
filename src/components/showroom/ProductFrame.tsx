import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Image, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface ProductFrameProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  image: string;
  name: string;
  price: number;
  onClick: () => void;
}

const ProductFrame = ({ position, rotation = [0, 0, 0], image, name, price, onClick }: ProductFrameProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = hovered ? 1.05 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), delta * 5);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Frame backing */}
      <RoundedBox args={[1.8, 2.4, 0.08]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={hovered ? '#c9a227' : '#1a1a1a'}
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Gold border frame */}
      <RoundedBox args={[1.9, 2.5, 0.04]} radius={0.08} smoothness={4} position={[0, 0, -0.03]}>
        <meshStandardMaterial
          color="#c9a227"
          metalness={0.9}
          roughness={0.1}
          emissive="#c9a227"
          emissiveIntensity={hovered ? 0.3 : 0.05}
        />
      </RoundedBox>

      {/* Product image */}
      <Image
        url={image || '/placeholder.svg'}
        position={[0, 0.15, 0.05]}
        scale={[1.5, 1.5]}
        transparent
      />

      {/* Product name */}
      <Text
        position={[0, -0.9, 0.05]}
        fontSize={0.1}
        maxWidth={1.5}
        textAlign="center"
        color="#ffffff"
        anchorY="top"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
      >
        {name}
      </Text>

      {/* Price tag */}
      <group position={[0, -1.05, 0.06]}>
        <RoundedBox args={[1, 0.22, 0.02]} radius={0.04} smoothness={4}>
          <meshStandardMaterial
            color="#c9a227"
            metalness={0.7}
            roughness={0.3}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.09}
          color="#0a0a0a"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
          fontWeight={700}
        >
          TSh {price.toLocaleString()}
        </Text>
      </group>

      {/* Spotlight effect on hover */}
      {hovered && (
        <pointLight
          position={[0, 0, 1.5]}
          intensity={2}
          distance={4}
          color="#c9a227"
        />
      )}
    </group>
  );
};

export default ProductFrame;
