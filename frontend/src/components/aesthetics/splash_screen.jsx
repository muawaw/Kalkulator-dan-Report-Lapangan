// splash_screen.jsx
import React from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SplashScreen({ isFinished, onAnimationComplete }) {
  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }}
      animate={
        isFinished ? { scale: 2.5, opacity: 0 } : { scale: 1, opacity: 1 }
      }
      onAnimationComplete={onAnimationComplete}
      transition={{
        duration: 0.9,
        ease: [0.76, 0, 0.24, 1],
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pkk-cream overflow-hidden select-none"
    >
      {/* Background Cloth/Wave Effect */}
      <div className="absolute -inset-10 opacity-15 pointer-events-none animate-cloth-wave">
        <svg
          className="w-full h-full text-pkk-cream fill-current"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M0 0 C 30 20, 70 -10, 100 0 L 100 100 C 70 80, 30 110, 0 100 Z" />
        </svg>
      </div>

      {/* Main Logo & Lottie Container */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Logo Slow Zoom */}
        <img
          src="/logo_pkk.png"
          alt="PKK Logo"
          className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl animate-logo-zoom"
        />

        {/* Lottie Loading Animation */}
        <div className="w-24 h-24 flex items-center justify-center animate-pop-up">
          <DotLottieReact src="/loading.json" loop autoplay />
        </div>
      </div>
    </motion.div>
  );
}
