import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { saveInvitation } from '@/services/api';
import type { InvitationAnswer, SaveStatus } from '@/types/invitation';

const SAVED_MESSAGE = 'Ответ успешно сохранён! 💾';
const CONSOLATION = 'Но это не важно, главное — ты согласилась(ся)! 😽';

export interface InvitationSaver {
  status: Ref<SaveStatus>;
  statusMessage: ComputedRef<string>;
  save: (authHash: string, answer: InvitationAnswer) => Promise<void>;
}

export function useInvitationSaver(): InvitationSaver {
  const status = ref<SaveStatus>('idle');
  const failureReason = ref('');

  const statusMessage = computed(() => {
    switch (status.value) {
      case 'saving':
        return 'Сохраняю ответ...';
      case 'saved':
        return SAVED_MESSAGE;
      case 'failed':
        return `Не удалось сохранить ответ (${failureReason.value}). ${CONSOLATION}`;
      default:
        return '';
    }
  });

  async function save(authHash: string, answer: InvitationAnswer): Promise<void> {
    status.value = 'saving';

    try {
      await saveInvitation(authHash, answer);
      status.value = 'saved';
    } catch (error) {
      console.error(error);
      failureReason.value = error instanceof Error ? error.message : 'неизвестная ошибка';
      status.value = 'failed';
    }
  }

  return { status, statusMessage, save };
}