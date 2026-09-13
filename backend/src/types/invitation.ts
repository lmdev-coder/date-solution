/**
 * Domain types shared across schemas, services and HTTP handlers.
 * Presentation concerns (HTTP status codes, headers) live in `lib/http.ts`.
 */

/** V1: the travel questionnaire — countries, hotel and dates. */
export interface TravelAnswerV1 {
  /** Answer version; folded into the storage object name as `v1`. */
  version: 1;
  countries: string[];
  hotel: string;
  dates: string;
}

/** V2: the mini-game that ends with the Brest trip question. */
export interface StoryAnswerV2 {
  /** Answer version; folded into the storage object name as `v2`. */
  version: 2;
  brestTrip: boolean;
}

export type InvitationAnswer = TravelAnswerV1 | StoryAnswerV2;

/** Persisted shape written to object storage: the answer plus submission metadata. */
export type InvitationRecord = InvitationAnswer & {
  clientIp: string;
  submittedAt: string;
};

/** Result of a successful persistence operation. */
export interface StoredInvitation {
  objectKey: string;
  savedAt: string;
}