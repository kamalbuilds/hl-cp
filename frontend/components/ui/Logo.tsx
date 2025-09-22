import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Mirrored triangles forming an abstract H */}
      <div className="relative w-10 h-10">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Left mirror triangle */}
          <path
            d="M5 20 L15 10 L15 30 Z"
            fill="url(#gradient-left)"
            opacity="0.9"
          />
          {/* Right mirror triangle */}
          <path
            d="M35 20 L25 10 L25 30 Z"
            fill="url(#gradient-right)"
            opacity="0.9"
          />
          {/* Center connecting bar */}
          <rect
            x="15"
            y="18"
            width="10"
            height="4"
            fill="url(#gradient-center)"
            opacity="0.8"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="gradient-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="gradient-center" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            HyperMirror
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Mirror the Masters
          </span>
        </div>
      )}
    </div>
  );
};