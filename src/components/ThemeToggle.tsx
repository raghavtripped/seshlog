
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Theme is fixed to light"
      className="bg-white/10 hover:bg-white/20 cursor-default"
      disabled
    >
      <Sun className="w-4 h-4" />
    </Button>
  );
};
