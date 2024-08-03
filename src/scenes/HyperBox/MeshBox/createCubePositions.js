export default function createCubePositions(size, segments) {
    const particles = [];
    const lines = [];
    const step = size / segments;
  
    const isOnSurface = (x, y, z) => 
        x === 0 || x === segments || y === 0 || y === segments || z === 0 || z === segments;
  
    for (let x = 0; x <= segments; x++) {
        for (let y = 0; y <= segments; y++) {
            for (let z = 0; z <= segments; z++) {
                if (isOnSurface(x, y, z)) {
                    const px = (x * step) - size / 2;
                    const py = (y * step) - size / 2;
                    const pz = (z * step) - size / 2;
                    particles.push(px, py, pz);
  
                    if (x < segments && isOnSurface(x + 1, y, z)) {
                        lines.push(px, py, pz, px + step, py, pz);
                    }
                    if (y < segments && isOnSurface(x, y + 1, z)) {
                        lines.push(px, py, pz, px, py + step, pz);
                    }
                    if (z < segments && isOnSurface(x, y, z + 1)) {
                        lines.push(px, py, pz, px, py, pz + step);
                    }
                }
            }
        }
    }
  
    return { particles, lines };
  }