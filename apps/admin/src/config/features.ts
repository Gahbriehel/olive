/**
 * Feature Flags Configuration
 *
 * NEXT_PUBLIC_STRICT_RBAC_RESTRICTIONS:
 * Controls temporary RBAC restrictions for Users view (hiding table from standard admins)
 * and Attendance view (restricting check-in execution).
 *
 * - Enabled (`true`, default):
 *   - Only Super Admins see the full User Directory table and RBAC Matrix on /users.
 *   - Only Super Admins can execute manual/scanned check-ins on /attendance.
 *
 * - Disabled (`false`):
 *   - Standard Admins regain full access to the User Directory table on /users.
 *   - All authorized attendance staff can execute check-ins on /attendance.
 *
 * To revert in production: set NEXT_PUBLIC_STRICT_RBAC_RESTRICTIONS=false in env vars
 * or update the default value below.
 */
export const IS_STRICT_RBAC_RESTRICTED: boolean =
  process.env.NEXT_PUBLIC_STRICT_RBAC_RESTRICTIONS !== "false";
