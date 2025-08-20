import { useCurrentUserContext } from '@/contexts/CurrentUserContext';

export const useCurrentUser = () => {
  return useCurrentUserContext();
};