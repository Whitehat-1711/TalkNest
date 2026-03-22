import { motion } from "framer-motion";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <motion.div
      className="hidden lg:flex items-center justify-center bg-base-200 p-12"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md text-center">
        <motion.div
          className="grid grid-cols-3 gap-3 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
        >
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="aspect-square rounded-2xl bg-primary/10"
              variants={{
                hidden: { opacity: 0, y: 8, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              animate={{ opacity: i % 2 === 0 ? [0.35, 0.8, 0.35] : 0.55 }}
              transition={{
                duration: 2.2,
                repeat: i % 2 === 0 ? Infinity : 0,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            />
          ))}
        </motion.div>
        <motion.h2
          className="text-2xl font-bold mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="text-base-content/60"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AuthImagePattern;
