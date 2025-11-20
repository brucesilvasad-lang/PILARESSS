import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Student,
  Instructor,
  Class,
  ActiveView,
  Expense,
  AttendanceStatus,
  Service,
  StudentLabel,
  Theme,
  ColorTheme,
  CurrentUser,
  UserRole,
  AdminUser,
  Enrollment,
  AppDataBackup
} from './types';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import Schedule from './components/Schedule';
import InstructorManagement from './components/InstructorManagement';
import Expenses from './components/Expenses';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import OnboardingGuide from './components/OnboardingGuide';

import { Menu, Loader2 } from 'lucide-react';
import { dataService } from './services/dataService';
import { isCloudEnabled } from './lib/supabaseClient';


// Paletas de cores
const colorPalettes: Record<ColorTheme, { primary: string; secondary: string; light: string; accent: string; bg: string }> = {
  nature: { primary: '#4A5C58', secondary: '#8AA39B', light: '#D4E0DC', accent: '#C2958F', bg: '#F7F9F8' },
  ocean: { primary: '#0f7
