/**
 * Practice session persistence.
 *
 * A "session" is the student's current question selection (subject + one or
 * more topics + page). It survives sign-out and app restarts so the Edge
 * Practice home page can offer "Continue previous practice".
 * Ending a session deliberately clears the selection.
 */

import { getCachedData, removeCachedData, setCachedData } from "./offline-cache";

const SESSION_KEY = "active_session";

export type PracticeSession = {
  subjectSlug: string;
  subjectName?: string | undefined;
  /** Single-topic slug, when the session is a single-topic run. */
  topicSlug?: string | undefined;
  /** Topic slugs, when the session is a mixed-topic run. */
  topicSlugs?: string[] | undefined;
  label: string;
  page: number;
  updatedAt: number;
};

export function savePracticeSession(session: Omit<PracticeSession, "updatedAt">): void {
  setCachedData<PracticeSession>(SESSION_KEY, { ...session, updatedAt: Date.now() });
}

export function loadPracticeSession(): PracticeSession | null {
  const session = getCachedData<PracticeSession>(SESSION_KEY);
  if (!session?.subjectSlug) return null;
  if (!session.topicSlug && !session.topicSlugs?.length) return null;
  return session;
}

export function clearPracticeSession(): void {
  removeCachedData(SESSION_KEY);
}

export function describeSessionAge(updatedAt: number): string {
  const minutes = Math.floor((Date.now() - updatedAt) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
