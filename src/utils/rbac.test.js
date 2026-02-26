import { describe, it, expect } from 'vitest';
import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getPermissions,
  isModerator,
  isAdminRole,
  normalizeRole,
} from '../utils/rbac';

describe('rbac.js', () => {
  describe('ROLES', () => {
    it('should have correct role values', () => {
      expect(ROLES.USER).toBe('user');
      expect(ROLES.MODERATOR).toBe('moderator');
      expect(ROLES.ADMIN).toBe('admin');
    });
  });

  describe('PERMISSIONS', () => {
    it('should have all required permissions', () => {
      expect(PERMISSIONS.VIEW_REPORTS).toBe('VIEW_REPORTS');
      expect(PERMISSIONS.CREATE_REPORT).toBe('CREATE_REPORT');
      expect(PERMISSIONS.MODERATE_REPORTS).toBe('MODERATE_REPORTS');
      expect(PERMISSIONS.MANAGE_USERS).toBe('MANAGE_USERS');
      expect(PERMISSIONS.VIEW_ANALYTICS).toBe('VIEW_ANALYTICS');
      expect(PERMISSIONS.MANAGE_SETTINGS).toBe('MANAGE_SETTINGS');
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should assign correct permissions to USER role', () => {
      expect(ROLE_PERMISSIONS[ROLES.USER]).toContain(PERMISSIONS.VIEW_REPORTS);
      expect(ROLE_PERMISSIONS[ROLES.USER]).toContain(PERMISSIONS.CREATE_REPORT);
      expect(ROLE_PERMISSIONS[ROLES.USER]).not.toContain(PERMISSIONS.MODERATE_REPORTS);
      expect(ROLE_PERMISSIONS[ROLES.USER]).not.toContain(PERMISSIONS.MANAGE_USERS);
    });

    it('should assign correct permissions to MODERATOR role', () => {
      expect(ROLE_PERMISSIONS[ROLES.MODERATOR]).toContain(PERMISSIONS.VIEW_REPORTS);
      expect(ROLE_PERMISSIONS[ROLES.MODERATOR]).toContain(PERMISSIONS.CREATE_REPORT);
      expect(ROLE_PERMISSIONS[ROLES.MODERATOR]).toContain(PERMISSIONS.MODERATE_REPORTS);
      expect(ROLE_PERMISSIONS[ROLES.MODERATOR]).toContain(PERMISSIONS.VIEW_ANALYTICS);
      expect(ROLE_PERMISSIONS[ROLES.MODERATOR]).not.toContain(PERMISSIONS.MANAGE_SETTINGS);
    });

    it('should assign correct permissions to ADMIN role', () => {
      expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toContain(PERMISSIONS.VIEW_REPORTS);
      expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toContain(PERMISSIONS.CREATE_REPORT);
      expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toContain(PERMISSIONS.MODERATE_REPORTS);
      expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toContain(PERMISSIONS.MANAGE_USERS);
      expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toContain(PERMISSIONS.VIEW_ANALYTICS);
      expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toContain(PERMISSIONS.MANAGE_SETTINGS);
    });
  });

  describe('hasPermission', () => {
    describe('with USER role', () => {
      it('should return true for VIEW_REPORTS', () => {
        expect(hasPermission(ROLES.USER, PERMISSIONS.VIEW_REPORTS)).toBe(true);
      });

      it('should return true for CREATE_REPORT', () => {
        expect(hasPermission(ROLES.USER, PERMISSIONS.CREATE_REPORT)).toBe(true);
      });

      it('should return false for MODERATE_REPORTS', () => {
        expect(hasPermission(ROLES.USER, PERMISSIONS.MODERATE_REPORTS)).toBe(false);
      });

      it('should return false for MANAGE_USERS', () => {
        expect(hasPermission(ROLES.USER, PERMISSIONS.MANAGE_USERS)).toBe(false);
      });
    });

    describe('with MODERATOR role', () => {
      it('should return true for MODERATE_REPORTS', () => {
        expect(hasPermission(ROLES.MODERATOR, PERMISSIONS.MODERATE_REPORTS)).toBe(true);
      });

      it('should return true for VIEW_ANALYTICS', () => {
        expect(hasPermission(ROLES.MODERATOR, PERMISSIONS.VIEW_ANALYTICS)).toBe(true);
      });

      it('should return false for MANAGE_SETTINGS', () => {
        expect(hasPermission(ROLES.MODERATOR, PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
      });
    });

    describe('with ADMIN role', () => {
      it('should return true for all permissions', () => {
        expect(hasPermission(ROLES.ADMIN, PERMISSIONS.VIEW_REPORTS)).toBe(true);
        expect(hasPermission(ROLES.ADMIN, PERMISSIONS.CREATE_REPORT)).toBe(true);
        expect(hasPermission(ROLES.ADMIN, PERMISSIONS.MODERATE_REPORTS)).toBe(true);
        expect(hasPermission(ROLES.ADMIN, PERMISSIONS.MANAGE_USERS)).toBe(true);
        expect(hasPermission(ROLES.ADMIN, PERMISSIONS.VIEW_ANALYTICS)).toBe(true);
        expect(hasPermission(ROLES.ADMIN, PERMISSIONS.MANAGE_SETTINGS)).toBe(true);
      });
    });

    describe('with legacy roles', () => {
      it('should handle citizen role as user', () => {
        expect(hasPermission('citizen', PERMISSIONS.VIEW_REPORTS)).toBe(true);
        expect(hasPermission('citizen', PERMISSIONS.MODERATE_REPORTS)).toBe(false);
      });

      it('should handle admin_* roles as moderator', () => {
        expect(hasPermission('admin_laoag', PERMISSIONS.VIEW_REPORTS)).toBe(true);
        expect(hasPermission('admin_laoag', PERMISSIONS.MODERATE_REPORTS)).toBe(true);
        expect(hasPermission('admin_laoag', PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
      });

      it('should handle superadmin_provincial as admin', () => {
        expect(hasPermission('superadmin_provincial', PERMISSIONS.VIEW_REPORTS)).toBe(true);
        expect(hasPermission('superadmin_provincial', PERMISSIONS.MODERATE_REPORTS)).toBe(true);
        expect(hasPermission('superadmin_provincial', PERMISSIONS.MANAGE_SETTINGS)).toBe(true);
      });
    });

    describe('with null/undefined inputs', () => {
      it('should return false for null role', () => {
        expect(hasPermission(null, PERMISSIONS.VIEW_REPORTS)).toBe(false);
      });

      it('should return false for undefined role', () => {
        expect(hasPermission(undefined, PERMISSIONS.VIEW_REPORTS)).toBe(false);
      });

      it('should return false for null permission', () => {
        expect(hasPermission(ROLES.USER, null)).toBe(false);
      });

      it('should return false for undefined permission', () => {
        expect(hasPermission(ROLES.USER, undefined)).toBe(false);
      });

      it('should return false for empty string role', () => {
        expect(hasPermission('', PERMISSIONS.VIEW_REPORTS)).toBe(false);
      });
    });

    describe('with unknown role', () => {
      it('should return false for unknown role', () => {
        expect(hasPermission('unknown_role', PERMISSIONS.VIEW_REPORTS)).toBe(false);
      });
    });
    it('should return permissions for USER role', () => {
      const perms = getPermissions(ROLES.USER);
      expect(perms).toEqual([PERMISSIONS.VIEW_REPORTS, PERMISSIONS.CREATE_REPORT]);
    });

    it('should return permissions for MODERATOR role', () => {
      const perms = getPermissions(ROLES.MODERATOR);
      expect(perms).toContain(PERMISSIONS.VIEW_REPORTS);
      expect(perms).toContain(PERMISSIONS.CREATE_REPORT);
      expect(perms).toContain(PERMISSIONS.MODERATE_REPORTS);
      expect(perms).toContain(PERMISSIONS.VIEW_ANALYTICS);
    });

    it('should return permissions for ADMIN role', () => {
      const perms = getPermissions(ROLES.ADMIN);
      expect(perms).toContain(PERMISSIONS.VIEW_REPORTS);
      expect(perms).toContain(PERMISSIONS.CREATE_REPORT);
      expect(perms).toContain(PERMISSIONS.MODERATE_REPORTS);
      expect(perms).toContain(PERMISSIONS.MANAGE_USERS);
      expect(perms).toContain(PERMISSIONS.VIEW_ANALYTICS);
      expect(perms).toContain(PERMISSIONS.MANAGE_SETTINGS);
    });

    it('should return empty array for null role', () => {
      expect(getPermissions(null)).toEqual([]);
    });

    it('should return empty array for undefined role', () => {
      expect(getPermissions(undefined)).toEqual([]);
    });

    it('should return empty array for unknown role', () => {
      expect(getPermissions('unknown_role')).toEqual([]);
    });

    it('should normalize legacy roles', () => {
      expect(getPermissions('citizen')).toEqual([
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.CREATE_REPORT,
      ]);
      const moderatorPerms = getPermissions('admin_laoag');
      expect(moderatorPerms).toContain(PERMISSIONS.MODERATE_REPORTS);
    });
  });

  describe('isModerator', () => {
    it('should return false for USER role', () => {
      expect(isModerator(ROLES.USER)).toBe(false);
    });

    it('should return true for MODERATOR role', () => {
      expect(isModerator(ROLES.MODERATOR)).toBe(true);
    });

    it('should return true for ADMIN role', () => {
      expect(isModerator(ROLES.ADMIN)).toBe(true);
    });

    it('should return true for legacy admin_* roles', () => {
      expect(isModerator('admin_laoag')).toBe(true);
    });

    it('should return false for null', () => {
      expect(isModerator(null)).toBe(false);
    });
  });

  describe('isAdminRole', () => {
    it('should return false for USER role', () => {
      expect(isAdminRole(ROLES.USER)).toBe(false);
    });

    it('should return false for MODERATOR role', () => {
      expect(isAdminRole(ROLES.MODERATOR)).toBe(false);
    });

    it('should return true for ADMIN role', () => {
      expect(isAdminRole(ROLES.ADMIN)).toBe(true);
    });

    it('should return true for superadmin roles', () => {
      expect(isAdminRole('superadmin_provincial')).toBe(true);
    });

    it('should return false for admin_* roles (moderator level)', () => {
      expect(isAdminRole('admin_laoag')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isAdminRole(null)).toBe(false);
    });
  });

  describe('normalizeRole', () => {
    it('should return USER for citizen', () => {
      expect(normalizeRole('citizen')).toBe(ROLES.USER);
    });

    it('should return USER for user', () => {
      expect(normalizeRole('user')).toBe(ROLES.USER);
    });

    it('should return MODERATOR for admin_laoag', () => {
      expect(normalizeRole('admin_laoag')).toBe(ROLES.MODERATOR);
    });

    it('should return ADMIN for superadmin_provincial', () => {
      expect(normalizeRole('superadmin_provincial')).toBe(ROLES.ADMIN);
    });

    it('should return null for null', () => {
      expect(normalizeRole(null)).toBe(null);
    });

    it('should return null for unknown roles', () => {
      expect(normalizeRole('unknown')).toBe(null);
    });
  });
});
