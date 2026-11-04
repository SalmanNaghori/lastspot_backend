export type ModerationAction = 'suspend' | 'ban' | 'soft_delete' | 'reactivate' | 'restore';

export interface ModerationCapabilities {
  canSuspend: boolean;
  canBan: boolean;
  canSoftDelete: boolean;
  canReactivate: boolean;
  canRestore: boolean;
  isSuperAdmin: boolean;
}

export interface ModerationParams {
  targetUserId: string;
  action: ModerationAction;
  reason: string;
  message?: string | null;
  expiresAt?: string | null;
  expectedStatus?: string;
  expectedDeletedAt?: string | null;
}

export interface ModerationResult {
  id: string;
  status: string;
  status_reason: string | null;
  status_message: string | null;
  status_expires_at: string | null;
  deleted_at: string | null;
  updated_at: string;
}
