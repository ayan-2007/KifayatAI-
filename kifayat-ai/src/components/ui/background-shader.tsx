'use client';

import { motion } from 'framer-motion';
import { ShaderAnimation } from './shader-lines';

export function BackgroundShader() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 opacity-40">
          <ShaderAnimation />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/40 via-transparent to-surface-950" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 -z-10 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-700/10 rounded-full blur-[128px]" />
      </motion.div>
    </>
  );
}
