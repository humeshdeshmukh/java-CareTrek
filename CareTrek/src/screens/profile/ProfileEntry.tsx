import React from 'react';
import SeniorProfileScreen from './SeniorProfileScreen';
import FamilyProfileScreen from './FamilyProfileScreen';
import { useAppSelector } from '../../store/hooks';

const ProfileEntry: React.FC = () => {
  const auth = useAppSelector((s) => s.auth);
  const role = auth.role || auth.user?.role || null;

  if (role === 'family') return <FamilyProfileScreen />;
  // default to senior profile for 'senior' or unknown
  return <SeniorProfileScreen />;
};

export default ProfileEntry;
