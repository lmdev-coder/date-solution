/**
 * Screens of the app. `menu` is the hub shown right after login: from there
 * the person picks either the V2 mini-game or the V1 travel questionnaire.
 */
export type InvitationStep =
  | 'login'
  | 'menu'
  | 'story'
  | 'brest'
  | 'final-story'
  | 'question'
  | 'countries'
  | 'hotel'
  | 'dates'
  | 'final';

/** A selectable choice: `id` is what the server stores, `label` is what people see. */
export interface Option {
  id: string;
  label: string;
}

/** V1 payload: what the travel questionnaire produces. */
export interface TravelAnswerV1 {
  version: 1;
  countries: string[];
  hotel: string;
  dates: string;
}

/** V2 payload: the answer to the Brest trip question. */
export interface StoryAnswerV2 {
  version: 2;
  brestTrip: boolean;
}

/** Payload accepted by `POST /.netlify/functions/save-response`. */
export type InvitationAnswer = TravelAnswerV1 | StoryAnswerV2;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';