import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Starfield from "../Background/Starfield";
import { Sparkles } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  
  return (
    <div className="relative min-h-screen flex flex-col items-center">
      <Starfield />
      
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-purple w-8 h-8" />
          <span className="text-2xl font-bold tracking-wider text-gradient">LUMINAIRA</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 z-10 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
