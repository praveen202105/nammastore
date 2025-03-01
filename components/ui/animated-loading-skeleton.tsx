"use client";
import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

// Interface for grid configuration
interface GridConfig {
  numCards: number;
  cols: number;
  xBase: number;
  yBase: number;
  xStep: number;
  yStep: number;
}

const AnimatedLoadingSkeleton = () => {
  const [windowWidth, setWindowWidth] = useState(0);
  const controls = useAnimation();

  // Dynamically calculates grid configuration based on window width
  const getGridConfig = (width: number): GridConfig => {
    const numCards = 6;
    const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1; // Adjust columns for responsiveness
    return {
      numCards,
      cols,
      xBase: 20, // Reduce xBase for better mobile alignment
      yBase: 40, // Reduce yBase to fit smaller screens
      xStep: width >= 640 ? 200 : 180, // Adjust spacing dynamically
      yStep: 200,
    };
  };

  // Handle window resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Update animation path on window size change
  useEffect(() => {
    const config = getGridConfig(windowWidth);
    controls.start(generateSearchPath(config));
  }, [windowWidth, controls]);

  // Generates random search icon animation paths
  const generateSearchPath = (config: GridConfig) => {
    const { numCards, cols, xBase, yBase, xStep, yStep } = config;
    const rows = Math.ceil(numCards / cols);
    let allPositions = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (row * cols + col < numCards) {
          allPositions.push({ x: xBase + col * xStep, y: yBase + row * yStep });
        }
      }
    }

    const numRandomCards = 4;
    const shuffledPositions = allPositions
      .sort(() => Math.random() - 0.5)
      .slice(0, numRandomCards);

    shuffledPositions.push(shuffledPositions[0]);

    return {
      x: shuffledPositions.map((pos) => pos.x),
      y: shuffledPositions.map((pos) => pos.y),
      scale: Array(shuffledPositions.length).fill(1.2),
      transition: {
        duration: shuffledPositions.length * 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
        times: shuffledPositions.map((_, i) => i / (shuffledPositions.length - 1)),
      },
    };
  };

  const config = getGridConfig(windowWidth);

  return (
    <motion.div
      className="w-full h-full mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
    >
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
        {/* Search icon animation */}
        <motion.div
          className="absolute z-10 pointer-events-none"
          animate={controls}
          style={{ left: windowWidth < 640 ? 10 : 24, top: 24 }}
        >
          <motion.div
            className="bg-blue-500/20 p-2 sm:p-3 rounded-full backdrop-blur-sm"
            animate={{
              boxShadow: ["0 0 20px rgba(59, 130, 246, 0.2)", "0 0 35px rgba(59, 130, 246, 0.4)", "0 0 20px rgba(59, 130, 246, 0.2)"],
              scale: [1, 1.1, 1],
              transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Animated grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(config.numCards)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: i * 0.1, duration: 0.4 } }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-4"
            >
              {/* Animated placeholder skeleton */}
              <motion.div
                className="h-32 bg-gray-200 rounded-md mb-3"
                animate={{ background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-3 w-3/4 bg-gray-200 rounded mb-2"
                animate={{ background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-3 w-1/2 bg-gray-200 rounded"
                animate={{ background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedLoadingSkeleton;
