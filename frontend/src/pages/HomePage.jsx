import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { AnimatePresence, motion } from "framer-motion";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <motion.div className="h-screen bg-base-200" initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-center pt-20 px-4">
        <motion.div
          className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            <AnimatePresence mode="wait" initial={false}>
              {!selectedUser ? (
                <motion.div
                  key="no-chat"
                  className="flex-1 flex h-full"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.24 }}
                >
                  <NoChatSelected />
                </motion.div>
              ) : (
                <motion.div
                  key={selectedUser._id}
                  className="flex-1 flex h-full"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.24 }}
                >
                  <ChatContainer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
export default HomePage;
