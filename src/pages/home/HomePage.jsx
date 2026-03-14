import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center h-full min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel rounded-3xl p-8 md:p-14 text-center max-w-2xl w-full mx-4 flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="bg-brand-purple/20 p-4 rounded-full"
        >
          <Sparkles className="w-12 h-12 text-brand-green" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mt-4">
          <span className="text-white">LUMINAIRA</span><br/>
          <span className="text-gradient">IS LAUNCHING SOON</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 mt-2 max-w-lg leading-relaxed">
          Experience the chemistry of automotive hygiene with our premium service. Claim your exclusive launch reward today!
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8"
        >
          <Link
            to="/reward"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-blue to-brand-purple rounded-full hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
          >
            <span>Reveal My Reward</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
