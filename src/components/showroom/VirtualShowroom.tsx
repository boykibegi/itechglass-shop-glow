import { Suspense, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, Loader } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import ShowroomScene from './ShowroomScene';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  category: string;
}

interface VirtualShowroomProps {
  products: Product[];
}

const VirtualShowroom = ({ products }: VirtualShowroomProps) => {
  const navigate = useNavigate();

  const formattedProducts = useMemo(
    () =>
      products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.images?.[0] || '/placeholder.svg',
        category: p.category,
      })),
    [products]
  );

  const handleProductClick = useCallback(
    (id: string) => {
      navigate(`/product/${id}`);
    },
    [navigate]
  );

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] rounded-2xl overflow-hidden border border-border/30 bg-[hsl(0,0%,4%)]">
      {/* Controls hint */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md border border-border/30">
        <span className="text-[11px] text-muted-foreground">🖱️ Drag to look around • Scroll to zoom • Click a product to view</span>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ShowroomScene products={formattedProducts} onProductClick={handleProductClick} />
          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 1.5, -2]}
            enableDamping
            dampingFactor={0.05}
          />
          <Preload all />
        </Suspense>
      </Canvas>
      <Loader
        containerStyles={{ backgroundColor: 'hsl(0,0%,4%)' }}
        barStyles={{ backgroundColor: 'hsl(43,74%,49%)', height: '3px' }}
        dataStyles={{ color: 'hsl(43,74%,49%)', fontSize: '12px' }}
      />
    </div>
  );
};

export default VirtualShowroom;
