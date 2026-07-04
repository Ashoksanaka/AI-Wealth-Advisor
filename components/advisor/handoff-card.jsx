export function HandoffCard({ ticketId, summary }) {
  return (
    <div className="mt-2 p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm">
      <p className="font-medium text-primary mb-1">Connecting to human advisor</p>
      <p className="text-muted-foreground text-xs mb-2">
        Ticket: <span className="font-data">{ticketId}</span>
      </p>
      {summary && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          Context shared: {summary}
        </p>
      )}
    </div>
  );
}
