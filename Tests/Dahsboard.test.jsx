import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../src/Dashboard';
import { useActiveCourse } from '../src/User/useActiveCourse';
import { useFirebase } from '../src/useFirebase';
import { getDoc } from 'firebase/firestore';

// Mock the custom hooks and Firebase functions
vi.mock('../src/User/useActiveCourse', () => ({
    useActiveCourse: vi.fn(),
  }));
  vi.mock('../src/useFirebase', () => ({
    useFirebase: vi.fn(),
  }));
  vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
  }));
  
  describe('Dashboard Component', () => {
  
    it('renders active course data', async () => {
      const mockActiveCourse = { id: 'course1', name: 'Course 1' };
      const mockUser = { uid: 'user1' };
      const mockGameStats = {
        competition: {
          game1: { end_time: { toDate: () => new Date() }, score: 10, time: 1000, outcome: 'won' },
        },
      };
  
      useActiveCourse.mockReturnValue({ activeCourse: mockActiveCourse, loading: false });
      useFirebase.mockReturnValue({ firestore: {}, auth: { currentUser: mockUser } });
      getDoc.mockResolvedValue({ exists: () => true, data: () => mockGameStats });
  
      render(<Dashboard />);
  
      await waitFor(() => expect(screen.getByText('COMPETITION-MODUS')).toBeInTheDocument());
      expect(screen.getByText('Punkte-Ø:')).toBeInTheDocument();
      expect(screen.getByText('Highscore:')).toBeInTheDocument();
    });
  
  });