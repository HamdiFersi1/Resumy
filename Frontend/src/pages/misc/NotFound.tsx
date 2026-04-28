import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col md:flex-row h-screen items-center justify-center bg-background px-8 gap-y-12 md:gap-x-16">
      <div className="md:w-1/2 text-[12rem] font-extrabold text-blue-950 leading-none text-center md:text-right">
        404
      </div>
      <div className="md:w-1/2 text-center md:text-left space-y-6">
        <h1 className="text-6xl md:text-7xl font-bold text-foreground">
          Page Not Found
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          The page you're looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button
            size="lg"
            className="bg-blue-900 text-black hover:bg-green-700 px-8 py-6 text-lg rounded-b-md shadow-md transition"
          >
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
