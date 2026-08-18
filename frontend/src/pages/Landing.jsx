import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb';
import PrimaryButton from '../components/PrimaryButton';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-aura p-6 md:p-12 overflow-hidden relative">
      {/* Top Branding Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center md:justify-start items-center gap-3 w-full"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#9B5DE5] to-[#C58AF2] shadow-sm animate-breath" />
        <span className="text-lg font-bold tracking-widest text-gradient-purple uppercase select-none">Sunshine</span>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center text-center my-8 md:my-12 max-w-4xl mx-auto w-full space-y-10 md:space-y-12">
        {/* Animated Voice Orb Visual Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative py-4"
        >
          <VoiceOrb state="idle" size="lg" />
        </motion.div>

        {/* Taglines */}
        <div className="space-y-4 md:space-y-6 max-w-2xl px-4">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-tight text-aura-text-primary leading-tight"
          >
            Meet <span className="font-normal text-aura-primary-purple">Sunshine.</span><br className="hidden md:inline" />
            Your voice companion for every thought.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm md:text-base text-aura-text-secondary leading-relaxed font-light"
          >
            Record your ideas anytime, anywhere. Let AI instantly turn your voice into beautifully organized notes, tasks, and summaries.
          </motion.p>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <PrimaryButton
            onClick={() => navigate('/login')}
            icon={<ArrowRight className="w-4 h-4" />}
            className="px-8 py-4 rounded-full font-medium text-base shadow-[0_15px_35px_rgba(155,93,229,0.25)] hover:shadow-[0_20px_45px_rgba(155,93,229,0.35)] duration-300"
          >
            Get Started
          </PrimaryButton>
        </motion.div>
      </main>

      {/* Footer Info */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="w-full text-center text-xs text-aura-text-muted select-none"
      >
        <p>© {new Date().getFullYear()} Sunshine. Designed for efficiency.</p>
      </motion.footer>
    </div>
  );
};

export default Landing;
