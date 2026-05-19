'use client'

import Image from 'next/image'

interface FloatingElementProps {
  src: string
  alt: string
  className?: string
  speed?: number
  rotate?: number
  float?: boolean
}

export default function FloatingElement({
  src,
  alt,
  className = '',
  speed = 1,
  rotate = 0,
  float = true,
}: FloatingElementProps) {
  return (
    <div
      data-speed={speed}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`absolute pointer-events-none select-none ${float ? 'animate-float' : ''} ${className}`}
      aria-hidden
    >
      <Image src={src} alt={alt} width={500} height={500} className="w-full h-auto" />
    </div>
  )
}
