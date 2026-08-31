import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import VoiceOrb from "../components/VoiceOrb";
import GlassCard from "../components/GlassCard";
import PrimaryButton from "../components/PrimaryButton";
import Toast from "../components/Toast";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);

    setLoading(false);

    if (result.success) {
      showToast("Account created successfully!", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } else {
      showToast(result.error, "error");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-aura p-4 overflow-hidden relative">
      {/* Background Subtle Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-aura-soft-purple/10 rounded-full blur-3xl" />

      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-aura-primary-purple/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <GlassCard className="p-8 border border-white/80 shadow-glass-card">
          {/* Branding Orb Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="scale-75 -my-4">
              <VoiceOrb state="idle" size="sm" />
            </div>

            <h1 className="text-2xl font-light tracking-tight text-aura-text-primary text-center">
              Create{" "}
              <span className="font-semibold text-gradient-purple uppercase tracking-wider">
                Sunshine
              </span>{" "}
              Account
            </h1>

            <p className="text-xs text-aura-text-muted mt-1 text-center font-light">
              Start capturing your voice summaries
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-aura-text-secondary tracking-wide uppercase px-1">
                Full Name
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-aura-text-muted pointer-events-none">
                  <User className="w-4 h-4" />
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sunshine"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none glass-input text-sm text-aura-text-primary placeholder-aura-text-muted focus:border-aura-soft-purple focus:ring-1 focus:ring-aura-soft-purple/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-aura-text-secondary tracking-wide uppercase px-1">
                Email
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-aura-text-muted pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none glass-input text-sm text-aura-text-primary placeholder-aura-text-muted focus:border-aura-soft-purple focus:ring-1 focus:ring-aura-soft-purple/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-aura-text-secondary tracking-wide uppercase px-1">
                Password
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-aura-text-muted pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl outline-none glass-input text-sm text-aura-text-primary placeholder-aura-text-muted focus:border-aura-soft-purple focus:ring-1 focus:ring-aura-soft-purple/30 transition-all"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-aura-text-muted hover:text-aura-primary-purple transition-colors"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <PrimaryButton
                type="submit"
                disabled={loading}
                icon={<UserPlus className="w-4 h-4" />}
                className="w-full py-4 text-sm font-semibold shadow-md hover:shadow-lg"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </PrimaryButton>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs">
            <span className="text-aura-text-muted">
              Already have an account?{" "}
            </span>

            <Link
              to="/login"
              className="font-semibold text-aura-primary-purple hover:text-aura-deep-purple hover:underline transition-all"
            >
              Sign In
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      {/* Toast Alert */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
};

export default Register;