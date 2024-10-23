import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CourseSelector } from '../src/Startpage/CourseSelector';
import { useFirebase } from '../src/useFirebase';
import { getDoc } from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';

// Mock the custom hooks and Firebase functions
vi.mock('../src/useFirebase', () => ({
  useFirebase: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  getDownloadURL: vi.fn(),
}));

describe('CourseSelector Component', () => {
  const mockHandleChangeCourse = vi.fn();

  beforeEach(() => {
    useFirebase.mockReturnValue({
      auth: { currentUser: { uid: 'user1' } },
      firestore: {},
      storage: {},
    });
  });

  it('renders loading state initially', () => {
    getDoc.mockResolvedValue({ exists: () => false });

    render(<CourseSelector activeCourse={null} handleChangeCourse={mockHandleChangeCourse} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

});
