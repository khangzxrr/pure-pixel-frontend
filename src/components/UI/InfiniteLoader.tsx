import { cn } from "../../utils/cn";
import Button from "./Button";
import Spinner from "./Spinner";

type InfiniteLoaderProps = {
  /** a fetch is in flight for the next page */
  isFetching?: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error?: unknown;
  onRetry?: () => void;
  /** shown when there are no more pages */
  endLabel?: string;
  className?: string;
};

/**
 * Footer for infinite lists: append spinner, manual "Tải thêm", retry without discarding the
 * photos already on screen, and the terminal message.
 */
export default function InfiniteLoader({
  isFetching = false,
  hasMore,
  onLoadMore,
  error,
  onRetry,
  endLabel = "Bạn đã xem hết ảnh",
  className,
}: InfiniteLoaderProps) {
  return (
    <div
      className={cn(
        "mt-6 flex min-h-12 items-center justify-center gap-2",
        className,
      )}
    >
      {error ? (
        <>
          <span className="text-body text-danger">Không tải được thêm.</span>
          <Button size="sm" variant="ghost" onClick={onRetry}>
            Thử lại
          </Button>
        </>
      ) : isFetching ? (
        <span className="flex items-center gap-2 text-body text-ink-muted">
          <Spinner /> Đang tải thêm…
        </span>
      ) : hasMore ? (
        <Button size="sm" variant="secondary" onClick={onLoadMore}>
          Tải thêm
        </Button>
      ) : (
        <span className="text-body text-ink-muted">{endLabel}</span>
      )}
    </div>
  );
}
