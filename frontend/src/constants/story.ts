/**
 * V2 mini-game copy: messages revealed one at a time, followed by the Brest
 * trip question. The message text is intentionally free of markup.
 */
export const STORY_MESSAGES: readonly string[] = [
  'Знаешь, давно хотел тебе сказать, ты самая прекрасная девушка, что я встречал',
  'Я тебя поздравляю от всего сердца с приобретением квартиры и что мы наконец-то выбрали наш отпуск',
  'Также спасибо за приглашение к твоему отцу на день рождения',
];

export const BREST_QUESTION =
  'Я бы очень хотел, чтобы после мы съездили в Брест на день. Надеюсь, ты поедешь со мной?';

/** Shown in place of the question each time "Нет" is clicked. */
export const BREST_RETRY_MESSAGE = 'Подумай, пожалуйста, ещё 🙏';

/**
 * How many times "Нет" is turned down before the answer is accepted:
 * the first `BREST_DECLINE_LIMIT - 1` clicks only show `BREST_RETRY_MESSAGE`,
 * the last one ends the game with `BREST_DECLINED_SUMMARY`.
 */
export const BREST_DECLINE_LIMIT = 5;

export const BREST_AGREED_SUMMARY = 'Ура! Значит, едем в Брест вдвоём 🚂';
export const BREST_DECLINED_SUMMARY = 'Честно, я очень расстроен, что ты выбрала не ехать 😢';