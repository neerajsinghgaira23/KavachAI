import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'node' | 'packet' | 'threat';
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: string;
  active: boolean;
}

interface Node {
  x: number;
  y: number;
  z: number;
  theta: number;
  phi: number;
  label: string;
  color: string;
  pulse: number;
  pulseSpeed: number;
  isTheat: boolean;
}

export const CyberOrb3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotXRef = useRef(0.3);
  const rotYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isVisibleRef = useRef(true);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;

    const RADIUS = 130;
    const NODE_COUNT = 18;
    const COLORS = {
      safe: '#22d3ee',
      threat: '#f43f5e',
      warning: '#fbbf24',
      neutral: '#818cf8',
    };

    // Create sphere nodes using fibonacci distribution
    const nodes: Node[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const nodeLabels = [
      'RDAP', 'DNS', 'SMTP', 'HTTP', 'TLS',
      'THREAT', 'SCAM', 'PHISH', 'FRAUD',
      'SAFE', 'SCAN', 'AI', 'OCR', 'SHA',
      'WHOIS', 'JWT', 'RULE', 'SOC',
    ];
    const threatNodes = new Set([5, 6, 7, 8]);

    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const phi = (2 * Math.PI * i) / goldenRatio;
      const isTheat = threatNodes.has(i);

      nodes.push({
        x: RADIUS * Math.sin(theta) * Math.cos(phi),
        y: RADIUS * Math.sin(theta) * Math.sin(phi),
        z: RADIUS * Math.cos(theta),
        theta,
        phi,
        label: nodeLabels[i] || 'NODE',
        color: isTheat ? COLORS.threat : i % 4 === 0 ? COLORS.warning : i % 3 === 0 ? COLORS.neutral : COLORS.safe,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        isTheat,
      });
    }
    nodesRef.current = nodes;

    // Create connections
    const connections: Connection[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < RADIUS * 1.1 && connections.length < 24) {
          const isRedLine = nodes[i].isTheat || nodes[j].isTheat;
          connections.push({
            from: i,
            to: j,
            progress: Math.random(),
            speed: 0.003 + Math.random() * 0.005,
            color: isRedLine ? COLORS.threat : COLORS.safe,
            active: Math.random() > 0.3,
          });
        }
      }
    }
    connectionsRef.current = connections;

    const resize = () => {
      const size = Math.min(canvas.parentElement?.clientWidth || 440, 440);
      canvas.width = size;
      canvas.height = size;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Handle tab visibility to pause animation loop when user is in another tab
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const project = (x: number, y: number, z: number, cx: number, cy: number) => {
      const fov = 600;
      const depth = fov / (fov + z + 200);
      return {
        sx: cx + x * depth,
        sy: cy + y * depth,
        depth,
        z,
      };
    };

    const rotateY = (x: number, y: number, z: number, angle: number) => ({
      x: x * Math.cos(angle) + z * Math.sin(angle),
      y,
      z: -x * Math.sin(angle) + z * Math.cos(angle),
    });

    const rotateX = (x: number, y: number, z: number, angle: number) => ({
      x,
      y: y * Math.cos(angle) - z * Math.sin(angle),
      z: y * Math.sin(angle) + z * Math.cos(angle),
    });

    const spawnParticle = (node: Node) => {
      if (particlesRef.current.length > 40) return;
      particlesRef.current.push({
        x: node.x,
        y: node.y,
        z: node.z,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        vz: (Math.random() - 0.5) * 1.5,
        color: node.color,
        size: 1 + Math.random() * 2,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 25,
        type: node.isTheat ? 'threat' : 'packet',
      });
    };

    const draw = () => {
      if (!isVisibleRef.current) return;

      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      if (!isDraggingRef.current) {
        rotYRef.current += 0.0035;
      }

      const ry = rotYRef.current;
      const rx = rotXRef.current;

      // Outer glow rings
      const grad = ctx.createRadialGradient(cx, cy, RADIUS * 0.4, cx, cy, RADIUS * 1.2);
      grad.addColorStop(0, 'rgba(34,211,238,0)');
      grad.addColorStop(0.7, 'rgba(34,211,238,0.015)');
      grad.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, RADIUS * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Sphere wireframe
      const WIRE_SEGMENTS = 16;
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 0.5;

      for (let lat = 0; lat < 4; lat++) {
        const latAngle = ((lat + 1) / 5) * Math.PI;
        ctx.beginPath();
        for (let seg = 0; seg <= WIRE_SEGMENTS; seg++) {
          const lonAngle = (seg / WIRE_SEGMENTS) * Math.PI * 2;
          let px = RADIUS * Math.sin(latAngle) * Math.cos(lonAngle);
          let py = RADIUS * Math.sin(latAngle) * Math.sin(lonAngle);
          let pz = RADIUS * Math.cos(latAngle);
          let r = rotateY(px, py, pz, ry);
          r = rotateX(r.x, r.y, r.z, rx);
          const p = project(r.x, r.y, r.z, cx, cy);
          seg === 0 ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Projected nodes
      const projected = nodes.map((n) => {
        n.pulse += n.pulseSpeed;
        let r = rotateY(n.x, n.y, n.z, ry);
        r = rotateX(r.x, r.y, r.z, rx);
        return { ...project(r.x, r.y, r.z, cx, cy), node: n, orig: r };
      });

      const sorted = [...projected].sort((a, b) => a.z - b.z);

      // Connections
      connections.forEach((conn) => {
        if (!conn.active) return;
        const fromP = projected[conn.from];
        const toP = projected[conn.to];
        if (!fromP || !toP) return;

        const minZ = Math.min(fromP.z, toP.z);
        const alpha = Math.max(0.05, Math.min(0.35, (minZ + 300) / 600));

        ctx.beginPath();
        ctx.moveTo(fromP.sx, fromP.sy);
        ctx.lineTo(toP.sx, toP.sy);
        ctx.strokeStyle = conn.color;
        ctx.globalAlpha = alpha * 0.45;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        conn.progress += conn.speed;
        if (conn.progress > 1) conn.progress = 0;
        const px = fromP.sx + (toP.sx - fromP.sx) * conn.progress;
        const py = fromP.sy + (toP.sy - fromP.sy) * conn.progress;
        ctx.beginPath();
        ctx.arc(px, py, 1.8 * Math.min(fromP.depth, toP.depth), 0, Math.PI * 2);
        ctx.fillStyle = conn.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Render nodes
      sorted.forEach(({ sx, sy, depth, z, node }) => {
        const isFront = z > -50;
        const alpha = Math.max(0.2, Math.min(1, (z + 300) / 400));
        const baseSize = 3.5 * depth;
        const pulseScale = 1 + 0.2 * Math.sin(node.pulse);
        const nodeSize = baseSize * pulseScale;

        // Glow
        if (isFront) {
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, nodeSize * 3.5);
          grd.addColorStop(0, `${node.color}44`);
          grd.addColorStop(1, `${node.color}00`);
          ctx.beginPath();
          ctx.arc(sx, sy, nodeSize * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(sx, sy, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        if (node.isTheat) {
          ctx.beginPath();
          ctx.arc(sx, sy, nodeSize * 2 * pulseScale, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = alpha * 0.5;
          ctx.stroke();
        }

        if (isFront && depth > 0.85) {
          ctx.font = `bold ${Math.floor(7.5 * depth)}px monospace`;
          ctx.fillStyle = node.color;
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillText(node.label, sx + nodeSize + 3, sy + 3 * depth);
        }

        if (Math.random() < 0.002) {
          spawnParticle(node);
        }
      });

      // Particles
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        let r = rotateY(p.x, p.y, p.z, ry);
        r = rotateX(r.x, r.y, r.z, rx);
        const pp = project(r.x, r.y, r.z, cx, cy);

        ctx.beginPath();
        ctx.arc(pp.sx, pp.sy, p.size * pp.depth, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fill();
      });

      // Central core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
      coreGrad.addColorStop(0, 'rgba(34,211,238,0.8)');
      coreGrad.addColorStop(0.5, 'rgba(34,211,238,0.2)');
      coreGrad.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 0.04);
      ctx.fill();

      ctx.globalAlpha = 1;

      timeRef.current++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      rotYRef.current += dx * 0.005;
      rotXRef.current += dy * 0.005;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDraggingRef.current = false; };

    const onTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.touches[0].clientX - lastMouseRef.current.x;
      const dy = e.touches[0].clientY - lastMouseRef.current.y;
      rotYRef.current += dx * 0.005;
      rotXRef.current += dy * 0.005;
      lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onMouseUp, { passive: true });

    return () => {
      cancelAnimationFrame(animRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-3xl" />

      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing relative z-10 rounded-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      <div className="absolute top-2 left-2 font-mono text-[9px] text-cyan-500/60 leading-tight pointer-events-none">
        <div>KAVACH-3D v1.4</div>
        <div>THREAT MAP ACTIVE</div>
      </div>
      <div className="absolute top-2 right-2 font-mono text-[9px] text-rose-400/60 leading-tight pointer-events-none text-right">
        <div>⬤ THREATS: 4</div>
        <div>NODES: 18</div>
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[9px] text-slate-500 pointer-events-none">
        DRAG TO ROTATE
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-[9px] text-emerald-500/60 pointer-events-none">
        ⬤ LIVE
      </div>
    </div>
  );
};
