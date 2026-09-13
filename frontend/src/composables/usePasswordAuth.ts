import { ref, type Ref } from 'vue';

import { AUTH_HASH_STORAGE_KEY } from '@/constants/invitation';
import { ApiError, validatePassword } from '@/services/api';
import { hashPassword } from '@/utils/password';

const INVALID_PASSWORD_MESSAGE = 'Неверный пароль, попробуй ещё раз 😿';
const CONNECTION_ERROR_MESSAGE = 'Ошибка соединения с сервером 🐾';

export interface PasswordAuth {
  /** Ready-to-use bearer token; `null` until a password has been accepted. */
  authHash: Ref<string | null>;
  errorMessage: Ref<string>;
  isSubmitting: Ref<boolean>;
  /** Returns `true` when the password was accepted. */
  submit: (password: string) => Promise<boolean>;
  /** Reuses a hash from an earlier visit in this tab. Returns `true` if found. */
  restore: () => boolean;
}

export function usePasswordAuth(): PasswordAuth {
  const authHash = ref<string | null>(null);
  const errorMessage = ref('');
  const isSubmitting = ref(false);

  async function submit(password: string): Promise<boolean> {
    if (!password) {
      errorMessage.value = 'Введи пароль 😾';
      return false;
    }

    isSubmitting.value = true;
    errorMessage.value = '';

    try {
      const hash = await hashPassword(password);
      await validatePassword(hash);

      authHash.value = hash;
      sessionStorage.setItem(AUTH_HASH_STORAGE_KEY, hash);
      return true;
    } catch (error) {
      errorMessage.value = describeLoginFailure(error);
      console.error(error);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  function restore(): boolean {
    const savedHash = sessionStorage.getItem(AUTH_HASH_STORAGE_KEY);
    if (!savedHash) {
      return false;
    }

    authHash.value = savedHash;
    return true;
  }

  return { authHash, errorMessage, isSubmitting, submit, restore };
}

function describeLoginFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return INVALID_PASSWORD_MESSAGE;
  }

  return CONNECTION_ERROR_MESSAGE;
}