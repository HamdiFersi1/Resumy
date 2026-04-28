import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex flex-col md:flex-row h-screen items-center justify-center bg-background px-8 gap-y-12 md:gap-x-16">
      <div className="md:w-1/2 text-[12rem] font-extrabold text-red-900 leading-none text-center md:text-right">
        403
      </div>
      <div className="md:w-1/2 text-center md:text-left space-y-6">
        <h1 className="text-4xl md:text-7xl font-bold text-foreground">
          Unauthorized Access 
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          You don’t have permission to view this page.
        </p>
        <Link to="/">
          <Button
            size="lg"
            className="bg-red-900 text-white hover:bg-green-700 px-8 py-6 text-lg rounded-b-md shadow-md transition"
          >
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
