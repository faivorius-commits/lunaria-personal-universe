import { createFileRoute } from "@tanstack/react-router";
import { LunariaProvider } from "@/components/lunaria/LunariaContext";
import LunariaApp from "@/components/lunaria/App";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <LunariaProvider>
      <LunariaApp />
    </LunariaProvider>
  );
}
