import { useInternetIdentity } from './useInternetIdentity';

export function useAuth() {
  const { identity, login, clear, loginStatus, isLoggingIn } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal();

  return {
    isAuthenticated,
    currentPrincipal,
    login,
    logout: clear,
    loginStatus,
    isLoggingIn,
  };
}
