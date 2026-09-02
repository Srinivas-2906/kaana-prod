import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { needsOnboarding, formatUserForApi } from './authService.js';

/**
 * Manual regression checklist (landing & onboarding):
 * - Unauthenticated / → landing page
 * - Protected /projects → login redirect
 * - New signup → /onboarding wizard
 * - Invite signup → project, not onboarding
 * - Existing user (backfilled) → Hub, no onboarding
 * - Wizard refresh after project create → no duplicate project
 * - Finance rate in onboarding matches project finance + calculator
 */

describe('needsOnboarding', () => {
  it('returns true when onboarding_completed_at is null', () => {
    assert.equal(needsOnboarding({ onboarding_completed_at: null }), true);
  });

  it('returns false when onboarding_completed_at is set', () => {
    assert.equal(needsOnboarding({ onboarding_completed_at: new Date() }), false);
  });

  it('returns false for null user', () => {
    assert.equal(needsOnboarding(null), false);
  });
});

describe('formatUserForApi', () => {
  it('includes onboarding fields and needsOnboarding flag', () => {
    const formatted = formatUserForApi({
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      onboarding_completed_at: null,
      onboarding_project_id: 42,
    });

    assert.equal(formatted.id, 1);
    assert.equal(formatted.needsOnboarding, true);
    assert.equal(formatted.onboardingProjectId, 42);
    assert.equal(formatted.onboardingCompletedAt, null);
  });

  it('marks completed users as not needing onboarding', () => {
    const completedAt = new Date('2026-01-15T12:00:00Z');
    const formatted = formatUserForApi({
      id: 2,
      name: 'Done',
      email: 'done@example.com',
      onboarding_completed_at: completedAt,
      onboarding_project_id: null,
    });

    assert.equal(formatted.needsOnboarding, false);
    assert.equal(formatted.onboardingCompletedAt, completedAt.toISOString());
    assert.equal(formatted.onboardingProjectId, null);
  });
});
