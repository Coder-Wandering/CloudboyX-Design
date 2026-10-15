import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  logOutUser as fbLogOutUser,
} from '../firebase';
import {
  GranularRole,
  RolePermission,
  ROLE_PERMISSIONS,
  AgencyBranding,
  DEFAULT_AGENCY_BRANDING,
} from '../types';

export type UserRole = GranularRole | 'member';

interface AuthContextType {
  user: User | null;
  role: GranularRole;
  activeRole: GranularRole;
  permissions: RolePermission;
  isAdmin: boolean;
  isAgencyTeam: boolean;
  isClient: boolean;
  simulatedRole: GranularRole | null;
  setSimulatedRole: (role: GranularRole | null) => void;
  loading: boolean;
  isDemoUnlocked: boolean;
  agencyBranding: AgencyBranding;
  updateAgencyBranding: (branding: Partial<AgencyBranding>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logOut: () => Promise<void>;
  unlockDemoAccess: (asRole?: GranularRole) => void;
  relockDemoAccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'david@cloudboyx.io';
const BRANDING_STORAGE_KEY = 'agency_whitelabel_branding';
const LOCAL_USERS_STORAGE_KEY = 'cloudboyx_local_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<GranularRole>('client_editor');
  const [simulatedRole, setSimulatedRole] = useState<GranularRole | null>(() => {
    const saved = sessionStorage.getItem('agency_simulated_role');
    return (saved as GranularRole) || null;
  });
  const [loading, setLoading] = useState(true);
  const [isDemoUnlocked, setIsDemoUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('builder_demo_access') === 'true';
  });
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('builder_demo_admin') === 'true';
  });

  const [agencyBranding, setAgencyBranding] = useState<AgencyBranding>(() => {
    try {
      const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
      if (saved) return { ...DEFAULT_AGENCY_BRANDING, ...JSON.parse(saved) };
    } catch (e) {
      // ignore
    }
    return DEFAULT_AGENCY_BRANDING;
  });

  const updateAgencyBranding = async (patch: Partial<AgencyBranding>) => {
    const updated = { ...agencyBranding, ...patch };
    setAgencyBranding(updated);
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save branding to localStorage:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        let userRole: GranularRole =
          currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
            ? 'admin'
            : 'client_editor';

        try {
          const rawUsers = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
          const usersMap: Record<string, { email: string; displayName: string; role: GranularRole; createdAt: string; lastLogin: string }> =
            rawUsers ? JSON.parse(rawUsers) : {};
          const existing = usersMap[currentUser.uid];

          if (existing?.role) {
            if (existing.role === 'admin' || currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
              userRole = 'admin';
            } else if (existing.role === 'agency_team') {
              userRole = 'agency_team';
            } else if (existing.role === 'client_readonly') {
              userRole = 'client_readonly';
            } else {
              userRole = 'client_editor';
            }
          }

          usersMap[currentUser.uid] = {
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            role: userRole,
            createdAt: existing?.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(usersMap));
        } catch (e) {
          console.warn('Could not save user profile in localStorage:', e);
        }

        setRole(userRole);
      } else {
        setRole(isDemoAdmin ? 'admin' : 'client_editor');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoAdmin]);

  const handleSetSimulatedRole = (newRole: GranularRole | null) => {
    setSimulatedRole(newRole);
    if (newRole) {
      sessionStorage.setItem('agency_simulated_role', newRole);
    } else {
      sessionStorage.removeItem('agency_simulated_role');
    }
  };

  const signInWithGoogle = async () => {
    await fbSignInWithGoogle();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await fbSignInWithEmail(email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    await fbSignUpWithEmail(email, pass, name);
  };

  const logOut = async () => {
    localStorage.removeItem('builder_demo_access');
    localStorage.removeItem('builder_demo_admin');
    sessionStorage.removeItem('agency_simulated_role');
    setIsDemoUnlocked(false);
    setIsDemoAdmin(false);
    setSimulatedRole(null);
    setRole('client_editor');
    await fbLogOutUser();
  };

  const unlockDemoAccess = (asRole: GranularRole = 'admin') => {
    localStorage.setItem('builder_demo_access', 'true');
    setIsDemoUnlocked(true);
    if (asRole === 'admin') {
      localStorage.setItem('builder_demo_admin', 'true');
      setIsDemoAdmin(true);
      setRole('admin');
    } else {
      localStorage.removeItem('builder_demo_admin');
      setIsDemoAdmin(false);
      setRole(asRole);
    }
  };

  const relockDemoAccess = () => {
    localStorage.removeItem('builder_demo_access');
    localStorage.removeItem('builder_demo_admin');
    sessionStorage.removeItem('agency_simulated_role');
    setIsDemoUnlocked(false);
    setIsDemoAdmin(false);
    setSimulatedRole(null);
    setRole('client_editor');
  };

  const realIsAdmin =
    role === 'admin' ||
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    isDemoAdmin;

  // Active role can be simulated by the admin for testing client experience
  const activeRole: GranularRole = simulatedRole || (realIsAdmin ? 'admin' : role);
  const permissions = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.client_editor;
  const isAdmin = activeRole === 'admin';
  const isAgencyTeam = activeRole === 'admin' || activeRole === 'agency_team';
  const isClient = activeRole === 'client_editor' || activeRole === 'client_readonly';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: realIsAdmin ? 'admin' : role,
        activeRole,
        permissions,
        isAdmin,
        isAgencyTeam,
        isClient,
        simulatedRole,
        setSimulatedRole: handleSetSimulatedRole,
        loading,
        isDemoUnlocked,
        agencyBranding,
        updateAgencyBranding,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logOut,
        unlockDemoAccess,
        relockDemoAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

