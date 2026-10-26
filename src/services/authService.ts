import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Organization, UserProfile } from '../types/farm';
import {
  addFarmToFirestore,
  fetchOrganization,
  fetchUserProfile,
  saveOrganization,
  saveUserProfile,
} from './firestoreService';

export async function signUpUser(
  email: string,
  pass: string,
  name: string,
  farmName: string,
  state: string
): Promise<{ user: FirebaseUser; profile: UserProfile; org: Organization }> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = credential.user;

  // Update profile display name
  await updateProfile(user, { displayName: name });

  // Send verification email
  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.warn('Email verification send issue:', err);
  }

  // Create organization
  const orgId = `org-${user.uid.substring(0, 8)}`;
  const now = new Date().toISOString();
  const organization: Organization = {
    id: orgId,
    name: farmName || 'Commercial Farm Estate',
    ownerId: user.uid,
    state: state || 'Oyo State',
    createdAt: now,
  };
  await saveOrganization(organization);

  // Create user profile
  const profile: UserProfile = {
    id: user.uid,
    email: user.email || email,
    displayName: name || 'Farm Manager',
    organizationId: orgId,
    role: 'owner',
    createdAt: now,
  };
  await saveUserProfile(profile);

  // Initialize first farm document
  const farmId = `farm-${Date.now()}`;
  await addFarmToFirestore(orgId, {
    id: farmId,
    organizationId: orgId,
    name: farmName || 'Commercial Farm Estate',
    state: state || 'Oyo State',
    lga: 'Central Agricultural Zone',
    locationDetails: `${state || 'Oyo State'}, Nigeria`,
    totalArea: 25,
    unit: 'hectares',
    soilProfile: 'Fertile loamy sand with good drainage',
    ownership: 'Owned',
    createdAt: now.split('T')[0],
  });

  return { user, profile, org: organization };
}

export async function signInUser(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; profile: UserProfile | null; org: Organization | null }> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const user = credential.user;
  const profile = await fetchUserProfile(user.uid);
  const org = profile ? await fetchOrganization(profile.organizationId) : null;
  return { user, profile, org };
}

export async function signInWithGooglePopup(): Promise<{
  user: FirebaseUser;
  profile: UserProfile;
  org: Organization;
}> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;
  let profile = await fetchUserProfile(user.uid);

  const now = new Date().toISOString();

  if (!profile) {
    const orgId = `org-${user.uid.substring(0, 8)}`;
    const organization: Organization = {
      id: orgId,
      name: `${user.displayName || 'Commercial'}'s Farm Estate`,
      ownerId: user.uid,
      state: 'Oyo State',
      createdAt: now,
    };
    await saveOrganization(organization);

    profile = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Farm Manager',
      organizationId: orgId,
      role: 'owner',
      photoURL: user.photoURL || undefined,
      createdAt: now,
    };
    await saveUserProfile(profile);

    // Initial farm
    await addFarmToFirestore(orgId, {
      id: `farm-${Date.now()}`,
      organizationId: orgId,
      name: organization.name,
      state: 'Oyo State',
      lga: 'Central',
      locationDetails: 'Nigeria',
      totalArea: 25,
      unit: 'hectares',
      soilProfile: 'Loamy sand',
      ownership: 'Owned',
      createdAt: now.split('T')[0],
    });

    return { user, profile, org: organization };
  } else {
    const org = (await fetchOrganization(profile.organizationId)) || {
      id: profile.organizationId,
      name: 'Farm Estate',
      ownerId: user.uid,
      state: 'Oyo State',
      createdAt: now,
    };
    return { user, profile, org };
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function resendEmailVerificationEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
