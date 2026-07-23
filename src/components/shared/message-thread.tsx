import { cn } from "@/lib/utils";
import { sendMessage } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";

export interface MessageItem {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
}

export function MessageThread({
  applicationId,
  messages,
  currentUserId,
}: {
  applicationId: string;
  messages: MessageItem[];
  currentUserId: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-[var(--radius-md)] px-4 py-2.5 text-sm",
                  isMine ? "bg-accent text-white" : "bg-black/[0.04] text-ink"
                )}
              >
                <p>{m.body}</p>
                <p
                  className={cn(
                    "mt-1 font-mono-data text-[10px]",
                    isMine ? "text-white/70" : "text-muted"
                  )}
                >
                  {new Date(m.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        {!messages.length && (
          <p className="py-10 text-center text-sm text-muted">
            No messages yet — send the first one.
          </p>
        )}
      </div>

      <form action={sendMessage} className="mt-4 flex gap-2 border-t border-line pt-4">
        <input type="hidden" name="application_id" value={applicationId} />
        <textarea
          name="body"
          rows={1}
          required
          placeholder="Write a message…"
          className="flex-1 resize-none rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
        />
        <Button type="submit" variant="accent" size="md">
          Send
        </Button>
      </form>
    </div>
  );
}
