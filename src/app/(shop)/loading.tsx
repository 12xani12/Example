export default function Loading() {
  return (
    <div className="container-page flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="flex items-center gap-3 text-charcoal-soft">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose border-t-transparent" aria-hidden="true" />
        Loading…
      </span>
    </div>
  );
}
