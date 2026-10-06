import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

// Fades content up the first time it scrolls into view.
// Skipped entirely for people who prefer reduced motion.
const Reveal = ({ as: Tag = "div", delay = 0, className, children, ...props }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

Reveal.propTypes = {
  as: PropTypes.elementType,
  delay: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Reveal;
