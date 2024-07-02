
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { useTheme } from '../theme-provider.jsx';

const ModeToggle = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
        >
            {theme === 'light' ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
        </Button>
    );
};

export default ModeToggle;
