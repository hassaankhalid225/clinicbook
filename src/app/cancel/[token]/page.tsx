import { Card, CardContent } from "@/components/ui/card";
import { CancelFlow } from "@/components/booking/cancel-flow";

export default async function CancelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <CancelFlow token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
