import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, FileDown, AlertCircle, MapPin } from "lucide-react";
import { api } from "../../services/api";

export default function RedeemForm() {
  const navigate = useNavigate();
  const [reward, setReward] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
    mapLocation: "", // Now used dynamically for GPS coordinates
    vehicleType: "",
    vehicleNumber: "",
    vehicleModel: "",
    tagNumber: "", // In this system, this acts as the unique scratch card ID/code
  });

  useEffect(() => {
    const storedReward = localStorage.getItem("luminaira_reward");
    if (!storedReward) {
      navigate("/reward");
    } else {
      setReward(storedReward);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          mapLocation: `https://maps.google.com/?q=${latitude},${longitude}`,
        }));
        setIsLocating(false);
      },
      (geoError) => {
        setError("Unable to retrieve your location. Please check browser permissions.");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.post(
        "/reward-system",
        { ...formData, reward },
        { responseType: "blob" } // Ensure we get the PDF fully
      );

      // Trigger file download using blob URL
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `luminaira-coupon-${formData.tagNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsSuccess(true);
      // Remove reward so they can't redeem again immediately
      localStorage.removeItem("luminaira_reward");
    } catch (err) {
      // Because response is blob, parsing JSON error involves FileReader
      if (err.response && err.response.data instanceof Blob && err.response.data.type === 'application/json') {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          const errorMsg = json.message || "Failed to submit form.";
          setError(errorMsg);
          
          if (errorMsg.includes("successfully claimed") || errorMsg === "Tag already used") {
            localStorage.removeItem("luminaira_reward");
          }
        } catch (e) {
          setError("Failed to submit form.");
        }
      } else {
        const errorMsg = err.response?.data?.message || err.message || "An unexpected error occurred.";
        setError(errorMsg);
        
        if (errorMsg.includes("successfully claimed") || errorMsg === "Tag already used") {
          localStorage.removeItem("luminaira_reward");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-10 rounded-3xl text-center max-w-lg w-full mx-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle2 className="w-24 h-24 text-brand-green" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-slate-300 mb-6 font-medium">
            Your reward has been successfully claimed.
          </p>
          <div className="bg-brand-purple/10 border border-brand-purple/20 p-4 rounded-xl flex items-center justify-center gap-3 text-brand-purple mb-8">
            <FileDown className="w-6 h-6" />
            <span className="font-semibold">Your coupon PDF has been downloaded.</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-colors w-full"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const formatReward = (r) => {
    switch (r?.toLowerCase()) {
      case "polishing": return "Free car checkup + Polishing";
      case "interior": return "Free car checkup + Interior Detailing";
      case "carwash": return "Free car checkup + Car wash";
      default: return r?.toUpperCase() || "";
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-10 mx-4"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green mb-2">
            Claim Your Reward
          </h2>
          <p className="text-slate-300">
            You won <strong className="text-white uppercase">{formatReward(reward)}</strong>. Please fill out details below to get your coupon code.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-white/20 pb-2 text-white">1. Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <input
                  required
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
                  placeholder="+1 234 567 890"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Location</label>
                <input
                  required
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
                  placeholder="City, Area"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Current Map Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="mapLocation"
                    value={formData.mapLocation}
                    onChange={handleChange}
                    readOnly
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
                    placeholder="Click button to locate"
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple p-3 rounded-xl border border-brand-purple/30 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                    title="Get Current Location"
                  >
                    {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Vehicle Details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold border-b border-white/20 pb-2 text-white">2. Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Vehicle Type</label>
                <input
                  required
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
                  placeholder="e.g. Sedan, SUV, Bike"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Vehicle Model</label>
                <input
                  required
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
                  placeholder="e.g. Toyota Camry"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Vehicle Number Plate</label>
                <input
                  required
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full md:w-1/2 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow uppercase"
                  placeholder="ABC-1234"
                />
              </div>
            </div>
          </div>

          {/* Section: Submisison */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold border-b border-white/20 pb-2 text-white">3. Coupon Code</h3>
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tag Number (Your scratchcard ID)</label>
              <input
                required
                type="text"
                name="tagNumber"
                value={formData.tagNumber}
                onChange={handleChange}
                className="w-full md:w-1/2 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow font-mono"
                placeholder="Enter unique tag number"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl hover:shadow-[0_0_30px_rgba(176,38,255,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit & Get Coupon"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
