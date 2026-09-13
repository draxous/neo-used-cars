import { Link, useLocation } from "react-router-dom";
import { ArrowRight, SearchX } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <Layout>
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-lg mx-auto text-center">
          <SearchX className="h-14 w-14 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Page not found
          </h1>
          <p className="text-muted-foreground mb-2">
            We couldn't find anything at <span className="font-mono text-sm">{pathname}</span>.
          </p>
          <p className="text-muted-foreground mb-8">
            The vehicle may have sold, or the link may be out of date.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link to="/stock-cars">
                Browse Stock
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default NotFound;
