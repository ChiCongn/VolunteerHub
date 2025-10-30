import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Home } from "lucide-react";

interface ErrorPageProps {
  onGoHome: () => void;
}

export function ErrorPage({ onGoHome }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="text-[120px] leading-none font-semibold text-[#43A047]">
            404
          </div>
          <h1>Oops! Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for seems to have gone on a volunteer
            mission. Let's help you find your way back!
          </p>
        </div>

        <div className="relative max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for events or pages..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={onGoHome}
            className="gap-2 bg-[#43A047] hover:bg-[#388E3C]"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <Button variant="outline">Browse Events</Button>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </div>
  );
}
