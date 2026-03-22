import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition, pageTransitionTiming } from "./lib/motion";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!socket) return;

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <motion.div
        className="flex items-center justify-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Loader className="size-10 animate-spin" />
      </motion.div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              authUser ? (
                <motion.div {...pageTransition} transition={pageTransitionTiming}>
                  <HomePage />
                </motion.div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !authUser ? (
                <motion.div {...pageTransition} transition={pageTransitionTiming}>
                  <SignUpPage />
                </motion.div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/login"
            element={
              !authUser ? (
                <motion.div {...pageTransition} transition={pageTransitionTiming}>
                  <LoginPage />
                </motion.div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/settings"
            element={
              <motion.div {...pageTransition} transition={pageTransitionTiming}>
                <SettingsPage />
              </motion.div>
            }
          />
          <Route
            path="/profile"
            element={
              authUser ? (
                <motion.div {...pageTransition} transition={pageTransitionTiming}>
                  <ProfilePage />
                </motion.div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </AnimatePresence>

      <Toaster />
    </div>
  );
};
export default App;
