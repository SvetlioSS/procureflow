import {
  isRouteErrorResponse,
  useRouteError,
  useNavigate,
} from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const nav = useNavigate();

  let title = "Something went wrong";
  let details: string | null = null;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    try {
      details =
        typeof error.data === "string"
          ? error.data
          : JSON.stringify(error.data, null, 2);
    } catch {
      /* ignore */
    }
  } else if (error instanceof Error) {
    details = import.meta.env.DEV ? (error.stack ?? error.message) : null; // stack only in dev
  } else if (error != null) {
    details = import.meta.env.DEV ? String(error) : null;
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dev: show details/stack. Prod: show friendly message */}
          {details ? (
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {details}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try again or return to the
              dashboard.
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={() => nav(0)}>Reload</Button>
            <Button variant="secondary" onClick={() => nav("/")}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
