import { Link } from "react-router-dom";
import { Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
        <Package className="w-8 h-8 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-8">Page not found</p>
      <Link to="/">
        <Button>
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
