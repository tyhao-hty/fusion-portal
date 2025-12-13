import type { PayloadRequest } from 'payload'

export const getUserId = (req: PayloadRequest): string | null => {
  const value = (req.user as any)?.id
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null
}

export const hasRole = (req: PayloadRequest, role: string): boolean => {
  const roles = (req.user as any)?.roles
  return Array.isArray(roles) && roles.includes(role)
}

export const hasAnyRole = (req: PayloadRequest, target: string[]): boolean =>
  target.some((role) => hasRole(req, role))

export const isAdmin = (req: PayloadRequest): boolean => hasRole(req, 'admin')

export const rolePolicy = {
  admin: { canPublish: true, canEditOthers: true, canEditDraftOnly: false },
  publisher: { canPublish: true, canEditOthers: true, canEditDraftOnly: false },
  editor: { canPublish: false, canEditOthers: true, canEditDraftOnly: true },
  author: { canPublish: false, canEditOthers: false, canEditDraftOnly: true },
}
