import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Sparkles, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import ScratchCard from "../../components/ScratchCard/ScratchCard";
import { api } from "../../services/api";

export default function Scratch() {
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  
  const navigate = useNavigate();
  const fetchRef = useRef(false);

  useEffect(() => {
    if (fetchRef.current) return;
    fetchRef.current = true;

    // Check if we already have a reward in local storage that hasn't been redeemed
    const existingReward = localStorage.getItem("luminaira_reward");
    if (existingReward) {
      setReward(existingReward);
      setLoading(false);
      return;
    }

    const fetchReward = async () => {
      try {
        const response = await api.get(`/reward-system?_t=${Date.now()}`);
        if (response.data.success) {
          setReward(response.data.reward);
        } else {
          setError("Failed to fetch reward.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while fetching the reward.");
      } finally {
        setLoading(false);
      }
    };

    fetchReward();

    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const handleScratchComplete = () => {
    setIsRevealed(true);
    localStorage.setItem("luminaira_reward", reward);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
        <p className="mt-4 text-slate-300 font-medium animate-pulse">Assigning your mystery reward...</p>
      </div>
    );
  }

  if (error && !reward) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="glass-panel p-8 rounded-3xl text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-slate-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 w-full max-w-2xl mx-auto">
      {isRevealed && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti 
            width={windowDimensions.width || window.innerWidth} 
            height={windowDimensions.height || window.innerHeight} 
            recycle={false}
            numberOfPieces={600}
            gravity={0.12}
            colors={['#b026ff', '#0073ff', '#1aff00', '#ffffff']}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full flex flex-col items-center gap-8"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Scratch to Reveal
          </h1>
          <p className="text-slate-300">
            Use your mouse or finger to scratch off the card below and discover your reward.
          </p>
        </div>

        <ScratchCard rewardText={reward} onComplete={handleScratchComplete} />

        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-4"
            >
              <Link
                to="/redeem"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-green to-brand-blue rounded-full hover:shadow-[0_0_30px_rgba(41,255,41,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
              >
                <Sparkles className="w-5 h-5 mr-2 text-white" />
                <span>Claim Reward Now</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
