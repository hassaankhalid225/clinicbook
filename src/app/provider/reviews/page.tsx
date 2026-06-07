import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { ReviewReply } from "@/components/marketplace/review-reply";

export default async function ProviderReviewsPage() {
  const [doctor, reviews] = await Promise.all([
    repositories.doctors.getById(MOCK_CURRENT.doctorId),
    repositories.reviews.listByDoctor(MOCK_CURRENT.doctorId),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
          <RatingStars rating={doctor?.rating ?? 0} showValue />
          <span>· {reviews.length} reviews</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        )}
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.clientName}</p>
                <RatingStars rating={r.rating} />
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
              {r.reply ? (
                <div className="rounded-md bg-muted/50 p-2 text-sm">
                  <span className="font-medium">You: </span>{r.reply}
                </div>
              ) : (
                <ReviewReply id={r.id} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
