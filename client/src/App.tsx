import { Route, Switch } from "wouter";
import { Button } from "@/components/ui/button";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route>
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-serif">404</h1>
          <p className="text-sm text-muted-foreground">Resource not found</p>
          <Button variant="outline" onClick={() => window.location.replace("/")} className="rounded-none border-border">
            Return Home
          </Button>
        </div>
      </Route>
    </Switch>
  );
}
