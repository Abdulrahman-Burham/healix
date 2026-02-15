/**
 * ═══════════════════════════════════════════════════════════
 *  Healix 3D Hologram Effects Component Library
 *  Reusable holographic visual components for futuristic UI
 * ═══════════════════════════════════════════════════════════
 */
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';

/* ─── 3D Tilt Card ─── */
interface HoloCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  scanLine?: boolean;
  gridOverlay?: boolean;
  corners?: boolean;
}

export function HoloCard({
  children,
  className = '',
  glowColor = '#06b6d4',
  intensity = 'medium',
  scanLine = true,
  gridOverlay = false,
  corners = false,
}: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const maxTilt = intensity === 'low' ? 3 : intensity === 'medium' ? 6 : 10;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * maxTilt, y: x * maxTilt });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`holo-card ${scanLine ? 'holo-scan' : ''} ${gridOverlay ? 'holo-grid' : ''} ${corners ? 'holo-corners' : ''} ${className}`}
      style={{
        '--holo-color': glowColor,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      } as any}
    >
      {children}
    </motion.div>
  );
}

/* ─── 3D Hologram Orb / Sphere ─── */
interface HoloOrbProps {
  size?: number;
  value?: string | number;
  label?: string;
  color?: string;
  secondaryColor?: string;
  progress?: number;  // 0-100
  animated?: boolean;
  children?: ReactNode;
}

export function HoloOrb({
  size = 150,
  value,
  label,
  color = '#06b6d4',
  secondaryColor = '#10b981',
  progress = 75,
  animated = true,
  children,
}: HoloOrbProps) {
  const r = (size - 20) / 2;
  const circumference = 2 * Math.PI * r;
  const dashArray = (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer orbit ring */}
      <div
        className="holo-ring"
        style={{
          width: size + 20,
          height: size + 20,
          top: -10,
          left: -10,
          borderColor: `${color}20`,
        }}
      />
      {/* Inner orbit ring */}
      <div
        className="holo-ring-fast"
        style={{
          width: size + 8,
          height: size + 8,
          top: -4,
          left: -4,
          borderColor: `${secondaryColor}15`,
        }}
      />

      {/* SVG circle with holographic effect */}
      <svg
        className={`absolute -rotate-90 ${animated ? '' : ''}`}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
      >
        {/* Background glow circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`${color}08`}
          strokeWidth="8"
        />
        {/* Animated dashed ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r + 4}
          fill="none"
          stroke={`${color}15`}
          strokeWidth="1"
          strokeDasharray="4 4"
          style={{ animation: animated ? 'holo-circle-dash 2s linear infinite' : 'none' }}
        />
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Progress arc with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dashArray} ${circumference - dashArray}`}
          style={{
            filter: `drop-shadow(0 0 6px ${color}60)`,
            transition: 'stroke-dasharray 1.5s ease-out',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {children || (
          <>
            <span
              className="text-3xl font-black"
              style={{ color, textShadow: `0 0 20px ${color}40` }}
            >
              {value}
            </span>
            {label && (
              <span className="text-xs text-gray-500 mt-1">{label}</span>
            )}
          </>
        )}
      </div>

      {/* Holographic glow underneath */}
      <div
        className="absolute rounded-full blur-2xl opacity-15"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background: `radial-gradient(circle, ${color}, transparent)`,
          bottom: -10,
        }}
      />
    </div>
  );
}

/* ─── Hologram Floating Particles ─── */
interface HoloParticlesProps {
  count?: number;
  color?: string;
  className?: string;
}

export function HoloParticles({ count = 12, color = '#06b6d4', className = '' }: HoloParticlesProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}40`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 30, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Hologram Data Ring ─── */
interface HoloRingProps {
  size?: number;
  color?: string;
  thickness?: number;
  dashed?: boolean;
  speed?: number;
  reverse?: boolean;
  className?: string;
}

export function HoloRing({
  size = 200,
  color = '#06b6d4',
  thickness = 1,
  dashed = false,
  speed = 12,
  reverse = false,
  className = '',
}: HoloRingProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        border: `${thickness}px ${dashed ? 'dashed' : 'solid'} ${color}`,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ─── Hologram Scan Line ─── */
interface HoloScanLineProps {
  color?: string;
  speed?: number;
  className?: string;
}

export function HoloScanLine({ color = '#06b6d4', speed = 4, className = '' }: HoloScanLineProps) {
  return (
    <motion.div
      className={`absolute left-0 right-0 h-[1px] pointer-events-none z-20 ${className}`}
      style={{
        background: `linear-gradient(90deg, transparent, ${color}80, ${color}, ${color}80, transparent)`,
        boxShadow: `0 0 8px ${color}40`,
      }}
      animate={{ top: ['-2%', '102%'] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ─── 3D Hologram DNA Helix ─── */
interface HoloDNAHelixProps {
  height?: number;
  color1?: string;
  color2?: string;
  className?: string;
}

export function HoloDNAHelix({
  height = 200,
  color1 = '#06b6d4',
  color2 = '#10b981',
  className = '',
}: HoloDNAHelixProps) {
  const dots = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className={`relative ${className}`} style={{ height, width: 60 }}>
      {dots.map((i) => {
        const delay = i * 0.25;
        return (
          <div key={i} className="absolute left-0 right-0" style={{ top: `${(i / 12) * 100}%` }}>
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                background: color1,
                boxShadow: `0 0 8px ${color1}60`,
              }}
              animate={{
                left: ['15%', '75%', '15%'],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                background: color2,
                boxShadow: `0 0 8px ${color2}60`,
              }}
              animate={{
                left: ['75%', '15%', '75%'],
                scale: [1.2, 0.8, 1.2],
              }}
              transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
            />
            {/* Connecting line */}
            <motion.div
              className="absolute top-[2px] h-[2px] rounded-full"
              style={{ background: `linear-gradient(90deg, ${color1}30, ${color2}30)` }}
              animate={{
                left: ['18%', '42%', '18%'],
                right: ['18%', '42%', '18%'],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ─── 3D Hologram Heartbeat Line ─── */
interface HoloHeartbeatProps {
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function HoloHeartbeat({ color = '#f43f5e', width = 200, height = 60, className = '' }: HoloHeartbeatProps) {
  const pathD = 'M0,30 L30,30 L40,30 L48,10 L55,50 L62,5 L69,45 L76,25 L80,30 L130,30 L140,30 L148,12 L155,48 L162,8 L169,42 L176,28 L180,30 L200,30';

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <svg viewBox="0 0 200 60" width={width} height={height} className="absolute inset-0">
        {/* Glow shadow path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Main crisp path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.9 }}
          animate={{ pathLength: 1, opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}

/* ─── Hologram Data Value Display ─── */
interface HoloValueProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  color?: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function HoloValue({
  value,
  label,
  icon,
  color = '#06b6d4',
  unit = '',
  trend,
  trendUp,
  className = '',
}: HoloValueProps) {
  return (
    <motion.div
      className={`holo-stat holo-datastream ${className}`}
      style={{ '--holo-color': color } as any}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Icon */}
      {icon && (
        <div
          className="p-2.5 rounded-xl w-fit mb-3"
          style={{
            background: `${color}12`,
            border: `1px solid ${color}20`,
          }}
        >
          {icon}
        </div>
      )}

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl font-black tracking-tight"
          style={{ color: 'white', textShadow: `0 0 30px ${color}20` }}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>

      {/* Label & trend */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        {trend && (
          <span
            className="text-xs font-medium"
            style={{ color: trendUp ? '#10b981' : color }}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        }}
      />
    </motion.div>
  );
}

/* ─── Hologram Section Header ─── */
interface HoloHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export function HoloHeader({ icon, title, subtitle, badge, className = '' }: HoloHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`}
    >
      <div>
        <h1 className="section-title flex items-center gap-2.5">
          {icon}
          <span className="holo-text">{title}</span>
        </h1>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {badge && (
        <div className="holo-badge">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {badge}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Hologram Background Mesh ─── */
export function HoloBgMesh({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Radial glows */}
      <div className="absolute top-0 left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />
      <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/[0.02] blur-[140px]" />

      {/* Grid mesh */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

/* ─── Hologram 3D Rotating Cube Background ─── */
export function HoloCube({ size = 80, color = '#06b6d4', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ width: size, height: size, perspective: 200 }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1, 2, 3, 4, 5].map((face) => {
          const transforms = [
            `rotateY(0deg) translateZ(${size / 2}px)`,
            `rotateY(90deg) translateZ(${size / 2}px)`,
            `rotateY(180deg) translateZ(${size / 2}px)`,
            `rotateY(-90deg) translateZ(${size / 2}px)`,
            `rotateX(90deg) translateZ(${size / 2}px)`,
            `rotateX(-90deg) translateZ(${size / 2}px)`,
          ];
          return (
            <div
              key={face}
              className="absolute inset-0 rounded-lg"
              style={{
                transform: transforms[face],
                border: `1px solid ${color}15`,
                background: `${color}04`,
                backfaceVisibility: 'visible',
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
