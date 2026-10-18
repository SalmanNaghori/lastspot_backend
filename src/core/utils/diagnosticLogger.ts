/**
 * Structured diagnostic logger for admin data operations.
 * Safely logs request telemetry, status codes, query counts, and latency.
 * STRICT SECURITY: NEVER logs FCM tokens, session tokens, passwords, or secrets.
 */

export interface DiagnosticLogPayload {
  requestId: string;
  selectedUserId: string;
  endpoint: string;
  httpStatus?: number | string;
  queryResultCount?: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  durationMs: number;
  environment: string;
}

export const generateRequestId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const logDiagnostic = (payload: DiagnosticLogPayload): void => {
  const isDev = import.meta.env.DEV;
  const timestamp = new Date().toISOString();

  const formattedLog = {
    timestamp,
    ...payload,
  };

  if (payload.errorCode || (payload.httpStatus && Number(payload.httpStatus) >= 400)) {
    console.warn(`[DIAGNOSTIC][WARN] [${payload.requestId}] ${payload.endpoint}:`, formattedLog);
  } else if (isDev) {
    console.info(`[DIAGNOSTIC][INFO] [${payload.requestId}] ${payload.endpoint}:`, formattedLog);
  }
};
