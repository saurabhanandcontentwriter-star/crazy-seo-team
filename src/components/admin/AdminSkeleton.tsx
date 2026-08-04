import { Skeleton } from "@/components/ui/skeleton";

/** Shimmer placeholder shown while a lazy-loaded admin page is being fetched. */
export default function AdminSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-2xl" />
          <Skeleton className="h-9 w-28 rounded-2xl" />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-[24px]" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-[320px] rounded-[24px]" />
        <Skeleton className="h-[320px] rounded-[24px]" />
      </div>
    </div>
  );
}
