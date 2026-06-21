import { getTenantById } from '../tenantContext.js';
import { SELF_SERVE_ENABLED } from '../platformConfig.js';

export function requireLiveTenant(req, res, next) {
  if (!req.user?.tenantId) return next();
  const tenant = getTenantById(req.user.tenantId);
  if (!SELF_SERVE_ENABLED && tenant?.status === 'pending_onboarding') {
    return res.status(403).json({
      error: 'Your workspace is being set up by our team. We will email you when it is live.',
      code: 'ONBOARDING_PENDING',
    });
  }
  next();
}
