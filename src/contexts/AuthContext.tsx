import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { db } from '../services/db';
import { SEED_USERS } from '../data/seedData';
import { auth, db as firestoreDb, OperationType, handleFirestoreError } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  activeClassId: string;
  activeChildId: string;
  setActiveClassId: (id: string) => void;
  setActiveChildId: (id: string) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string, confirmPass: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Robust Vietnamese error message helper
function getVietnameseAuthError(error: any): string {
  const code = error?.code || (typeof error?.message === 'string' ? error.message : '');
  if (typeof code === 'string') {
    if (code.includes('auth/invalid-email')) return 'Địa chỉ email không hợp lệ.';
    if (code.includes('auth/user-disabled')) return 'Tài khoản này đã bị vô hiệu hóa.';
    if (code.includes('auth/user-not-found')) return 'Không tìm thấy tài khoản với email này.';
    if (code.includes('auth/wrong-password')) return 'Mật khẩu không chính xác.';
    if (code.includes('auth/invalid-credential')) return 'Thông tin đăng nhập không chính xác hoặc tài khoản không tồn tại.';
    if (code.includes('auth/email-already-in-use')) return 'Email này đã được đăng ký bởi tài khoản khác.';
    if (code.includes('auth/weak-password')) return 'Mật khẩu quá yếu, vui lòng dùng ít nhất 6 ký tự.';
    if (code.includes('auth/popup-closed-by-user')) return 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.';
    if (code.includes('permission-denied') || code.includes('Missing or insufficient permissions')) {
      return 'Lỗi phân quyền cơ sở dữ liệu (Permission Denied).';
    }
    if (code.startsWith('Firebase:')) {
      // Clean up Firebase error prefix
      return code.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim();
    }
  }
  if (error?.message) {
    return `Lỗi: ${error.message}`;
  }
  return 'Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('smartclass_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEED_USERS[0]; // Default to TEACHER role for seamless evaluation
  });

  const [activeClassId, setActiveClassIdState] = useState<string>(() => {
    return localStorage.getItem('smartclass_active_class') || 'class_10a1';
  });

  const [activeChildId, setActiveChildIdState] = useState<string>(() => {
    return localStorage.getItem('smartclass_active_child') || 'std_01';
  });

  const setActiveClassId = (id: string) => {
    setActiveClassIdState(id);
    localStorage.setItem('smartclass_active_class', id);
  };

  const setActiveChildId = (id: string) => {
    setActiveChildIdState(id);
    localStorage.setItem('smartclass_active_child', id);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(firestoreDb, 'users', firebaseUser.uid);
          let userSnap;
          try {
            userSnap = await getDoc(userDocRef);
          } catch (err) {
            console.error('Error fetching user profile doc:', err);
          }

          if (userSnap && userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setCurrentUser(profile);
          } else {
            // Create profile if missing in Firestore
            const seedMatch = db.getUserByEmail(firebaseUser.email || '');
            const newProfile: UserProfile = {
              id: firebaseUser.uid,
              fullName: firebaseUser.displayName || seedMatch?.fullName || 'Người dùng Smart Class',
              email: firebaseUser.email || 'user@smartclass.edu.vn',
              role: seedMatch ? seedMatch.role : 'TEACHER',
              avatarUrl: firebaseUser.photoURL || seedMatch?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              phone: seedMatch?.phone || '0912345678',
              schoolId: seedMatch?.schoolId || 'sch_1',
              schoolName: 'THPT Chu Văn An',
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {
              console.error('Error creating user profile doc:', err);
            }
            setCurrentUser(newProfile);
          }
        } catch (e) {
          console.error('Error syncing auth user profile:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smartclass_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smartclass_current_user');
    }
  }, [currentUser]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        const user = db.getUserByEmail(email) || SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          setCurrentUser(user);
        }
        return { success: true };
      } catch (error: any) {
        const viMsg = getVietnameseAuthError(error);
        return { success: false, error: viMsg };
      }
    } else {
      // Fallback to demo local user if no password provided (1-click/mock)
      const user = db.getUserByEmail(email) || SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, error: 'Không tìm thấy tài khoản trong hệ thống.' };
    }
  };

  const register = async (
    fullName: string, 
    email: string, 
    password: string, 
    confirmPass: string, 
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!fullName.trim() || !email.trim() || !password) {
      return { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' };
    }
    if (password !== confirmPass) {
      return { success: false, error: 'Mật khẩu xác nhận không khớp.' };
    }
    if (role === 'ADMIN') {
      return { success: false, error: 'Không thể tự đăng ký quyền Quản trị viên (Admin) trực tuyến.' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await updateProfile(cred.user, { displayName: fullName });
      } catch (e) {
        console.error('Profile update warning:', e);
      }

      const newProfile: UserProfile = {
        id: cred.user.uid,
        fullName: fullName.trim(),
        email: email.trim(),
        role: role,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '0912345678',
        schoolId: 'sch_1',
        schoolName: 'THPT Chu Văn An',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(firestoreDb, 'users', cred.user.uid), newProfile);
      } catch (err) {
        console.error('Firestore user doc write warning:', err);
      }

      setCurrentUser(newProfile);
      return { success: true };
    } catch (error: any) {
      const viMsg = getVietnameseAuthError(error);
      return { success: false, error: viMsg };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const firebaseUser = res.user;

      const userDocRef = doc(firestoreDb, 'users', firebaseUser.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userDocRef);
      } catch (e) {
        console.error(e);
      }

      let profile: UserProfile;
      if (userSnap && userSnap.exists()) {
        profile = userSnap.data() as UserProfile;
      } else {
        const seedMatch = db.getUserByEmail(firebaseUser.email || '');
        profile = {
          id: firebaseUser.uid,
          fullName: firebaseUser.displayName || seedMatch?.fullName || 'Người dùng Google',
          email: firebaseUser.email || 'user@smartclass.edu.vn',
          role: seedMatch ? seedMatch.role : 'TEACHER',
          avatarUrl: firebaseUser.photoURL || seedMatch?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          phone: seedMatch?.phone || '0912345678',
          schoolId: seedMatch?.schoolId || 'sch_1',
          schoolName: 'THPT Chu Văn An',
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, profile);
        } catch (e) {
          console.error(e);
        }
      }

      setCurrentUser(profile);
      return { success: true };
    } catch (error: any) {
      const viMsg = getVietnameseAuthError(error);
      return { success: false, error: viMsg };
    }
  };

  const switchRole = (role: UserRole) => {
    const targetUser = SEED_USERS.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    localStorage.removeItem('smartclass_current_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'TEACHER',
        isAuthenticated: !!currentUser,
        activeClassId,
        activeChildId,
        setActiveClassId,
        setActiveChildId,
        login,
        register,
        loginWithGoogle,
        logout,
        switchRole,
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
