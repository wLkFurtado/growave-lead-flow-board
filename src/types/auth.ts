
export interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  userClients: string[];
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
