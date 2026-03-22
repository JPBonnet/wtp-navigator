/**
 * User Email Store
 *
 * Simple registry mapping user IDs to email addresses.
 * Used by the email service to resolve recipient addresses.
 */

const userEmailStore = new Map<string, string>();

export function registerUserEmail(userId: string, email: string): void {
  userEmailStore.set(userId, email);
}

export function getUserEmail(userId: string): string {
  return userEmailStore.get(userId) ?? userId;
}
