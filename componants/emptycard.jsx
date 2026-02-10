"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function Emptycard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <div className="flex items-center justify-center mb-5">
          <div className="bg-blue-100 p-4 rounded-full">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Welcome to Chat App
        </h1>

        <p className="text-gray-600 leading-relaxed mb-6">
          Connect with friends, share your thoughts, and make every
          conversation meaningful. Start chatting in real-time and stay
          connected with the people who matter most.
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

        <p className="text-sm text-gray-500">
          Select a conversation from the left to begin chatting.
        </p>
      </motion.div>
    </div>
  );
}
