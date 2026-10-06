import PropTypes from "prop-types";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { useTheme } from "../theme-provider.jsx";

const ModeToggle = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
    </Button>
  );
};

ModeToggle.propTypes = { className: PropTypes.string };

export default ModeToggle;
