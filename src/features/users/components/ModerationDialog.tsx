import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { AdminFormField } from '@/components/brand';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { AppStrings } from '@/core/constants/app_strings';
import type { ModerationAction } from '@/features/users/types/moderation';

export interface ModerationValues {
  reason: string;
  message: string | null;
  expiresAt: string | null;
}

interface ModerationDialogProps {
  action: ModerationAction;
  userName: string | null;
  supportsExpiry: boolean;
  onClose: () => void;
  onConfirm: (values: ModerationValues) => Promise<void>;
}

const fieldClass = 'w-full rounded-xl border border-[var(--kb-border)] bg-[var(--kb-surface-subtle)] px-3 py-2.5 text-sm text-[var(--kb-text)] outline-none focus-visible:ring-2 focus-visible:ring-[#F46A35] disabled:opacity-60';

export function ModerationDialog({ action, userName, supportsExpiry, onClose, onConfirm }: ModerationDialogProps) {
  const strings = AppStrings.Users.moderation;
  const copy = strings.actions[action];
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [expiry, setExpiry] = useState('');
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ reason?: string; message?: string; expiry?: string }>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;

    const errors: typeof fieldErrors = {};
    const normalizedReason = reason.trim();
    const normalizedMessage = message.trim();
    const expiryDate = supportsExpiry && expiry ? new Date(expiry) : null;
    if (!normalizedReason || normalizedReason.length > 1000) errors.reason = strings.reasonError;
    if (normalizedMessage.length > 2000) errors.message = strings.messageError;
    if (action === 'suspend' && expiryDate &&
      (!Number.isFinite(expiryDate.getTime()) || expiryDate.getTime() <= Date.now())) {
      errors.expiry = strings.expiryError;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    inFlight.current = true;
    setPending(true);
    setBackendError(null);
    try {
      await onConfirm({
        reason: normalizedReason,
        message: action === 'suspend' || action === 'ban' ? normalizedMessage || null : null,
        expiresAt: action === 'suspend' && expiryDate ? expiryDate.toISOString() : null,
      });
      if (mounted.current) onClose();
    } catch (error: unknown) {
      if (mounted.current) {
        const failure = error && typeof error === 'object'
          ? error as { message?: unknown; code?: unknown }
          : null;
        const description = typeof failure?.message === 'string' && failure.message.trim()
          ? failure.message
          : strings.failed;
        const code = typeof failure?.code === 'string' && failure.code.trim() ? failure.code : null;
        setBackendError(code ? `${description} (${code})` : description);
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setPending(false);
    }
  };

  const destructive = action === 'ban' || action === 'soft_delete';

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !inFlight.current) onClose(); }}>
      <DialogContent
        className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border-[var(--kb-border)] bg-[var(--kb-surface)] text-[var(--kb-text)] sm:rounded-2xl"
        onEscapeKeyDown={(event) => { if (inFlight.current) event.preventDefault(); }}
        onInteractOutside={(event) => { if (inFlight.current) event.preventDefault(); }}
      >
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F46A35]/10 text-[#DC5425]">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle className="pr-6 font-black">
            {copy.title}: {userName || strings.userFallback}
          </DialogTitle>
          <DialogDescription className="pt-2 text-[var(--kb-muted)]">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" aria-busy={pending} noValidate>
          <AdminFormField label={strings.reasonLabel} htmlFor="moderation-reason" required helperText={strings.reasonHelp}>
            <textarea
              id="moderation-reason"
              autoFocus
              required
              rows={3}
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={strings.reasonPlaceholder}
              className={fieldClass}
              disabled={pending}
              aria-invalid={Boolean(fieldErrors.reason)}
              aria-describedby={fieldErrors.reason ? 'moderation-reason-error' : undefined}
            />
            {fieldErrors.reason && <p id="moderation-reason-error" role="alert" className="mt-1 text-xs text-rose-500">{fieldErrors.reason}</p>}
          </AdminFormField>

          {(action === 'suspend' || action === 'ban') && (
            <AdminFormField label={strings.messageLabel} htmlFor="moderation-message" helperText={strings.messageHelp}>
              <textarea
                id="moderation-message"
                rows={2}
                maxLength={2000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={strings.messagePlaceholder}
                className={fieldClass}
                disabled={pending}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'moderation-message-error' : undefined}
              />
              {fieldErrors.message && <p id="moderation-message-error" role="alert" className="mt-1 text-xs text-rose-500">{fieldErrors.message}</p>}
            </AdminFormField>
          )}

          {action === 'suspend' && supportsExpiry && (
            <AdminFormField label={strings.expiryLabel} htmlFor="moderation-expiry" helperText={strings.expiryHelp}>
              <input
                id="moderation-expiry"
                type="datetime-local"
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
                className={fieldClass}
                disabled={pending}
                aria-invalid={Boolean(fieldErrors.expiry)}
                aria-describedby={fieldErrors.expiry ? 'moderation-expiry-error' : undefined}
              />
              {fieldErrors.expiry && <p id="moderation-expiry-error" role="alert" className="mt-1 text-xs text-rose-500">{fieldErrors.expiry}</p>}
            </AdminFormField>
          )}

          {action === 'suspend' && !supportsExpiry && (
            <p className="text-xs text-[var(--kb-muted)]">{strings.expiryUnavailable}</p>
          )}

          {backendError && (
            <p role="alert" className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400 break-words">
              {backendError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-[var(--kb-border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-xl border border-[var(--kb-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {AppStrings.Common.cancel}
            </button>
            <button
              type="submit"
              disabled={pending}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50 ${destructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#DC5425] hover:bg-[#C94A20]'}`}
            >
              {pending && <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {pending ? strings.pending : copy.label}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
