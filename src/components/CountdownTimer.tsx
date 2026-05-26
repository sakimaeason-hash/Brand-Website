"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  const TimeUnit = ({
    value,
    label,
    showColon = true,
  }: {
    value: number;
    label: string;
    showColon?: boolean;
  }) => (
    <div className="flex items-center">
      <motion.div
        className="bg-[#2D2D2D] text-white px-3 py-2 rounded-lg min-w-[48px] text-center relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Background pulse effect */}
        <motion.div
          className="absolute inset-0 bg-[#F5A623]/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            className="text-lg font-bold relative z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {formatNumber(value)}
          </motion.span>
        </AnimatePresence>
        <motion.span
          className="text-xs block relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.span>
      </motion.div>
      {showColon && (
        <motion.span
          className="text-2xl font-bold mx-1"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
      )}
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <div className="bg-[#2D2D2D] text-white px-3 py-2 rounded-lg min-w-[48px] text-center">
              <span className="text-lg font-bold">{formatNumber(timeLeft.days)}</span>
              <span className="text-xs block">days</span>
            </div>
            <span className="text-2xl font-bold">:</span>
          </>
        )}
        <div className="bg-[#2D2D2D] text-white px-3 py-2 rounded-lg min-w-[48px] text-center">
          <span className="text-lg font-bold">{formatNumber(timeLeft.hours)}</span>
          <span className="text-xs block">hrs</span>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="bg-[#2D2D2D] text-white px-3 py-2 rounded-lg min-w-[48px] text-center">
          <span className="text-lg font-bold">{formatNumber(timeLeft.minutes)}</span>
          <span className="text-xs block">min</span>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="bg-[#2D2D2D] text-white px-3 py-2 rounded-lg min-w-[48px] text-center">
          <span className="text-lg font-bold">{formatNumber(timeLeft.seconds)}</span>
          <span className="text-xs block">sec</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {timeLeft.days > 0 && (
        <TimeUnit value={timeLeft.days} label="days" />
      )}
      <TimeUnit value={timeLeft.hours} label="hrs" />
      <TimeUnit value={timeLeft.minutes} label="min" />
      <TimeUnit value={timeLeft.seconds} label="sec" showColon={false} />
    </motion.div>
  );
}
