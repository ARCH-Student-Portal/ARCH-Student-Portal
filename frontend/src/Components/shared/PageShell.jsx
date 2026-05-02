import { motion } from "framer-motion";

export default function PageShell({ children }) {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{ height: "100vh", width: "100vw", overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}