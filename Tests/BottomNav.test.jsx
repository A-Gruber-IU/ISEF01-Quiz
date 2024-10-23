import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { test, expect } from 'vitest';
import BottomNav from '../src/Layout/BottomNav.jsx';

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

test('renders BottomNav component', () => {
  renderWithRouter(<BottomNav />);
  
  const impressumLink = screen.getByText('Impressum');
  const datenschutzLink = screen.getByText('Datenschutz');
  const faqLink = screen.getByText('FAQ');
  const iuLink = screen.getByText('iu.de');
  
  expect(impressumLink).toBeDefined();
  expect(datenschutzLink).toBeDefined();
  expect(faqLink).toBeDefined();
  expect(iuLink).toBeDefined();
});


test('bottom nav items have correct icons', () => {
  renderWithRouter(<BottomNav />);
  
  const impressumIcon = screen.getByLabelText('Impressum');
  const datenschutzIcon = screen.getByLabelText('Datenschutz');
  const faqIcon = screen.getByLabelText('FAQ');
  const iuIcon = screen.getByLabelText('iu.de');
  
  expect(impressumIcon).toBeDefined();
  expect(datenschutzIcon).toBeDefined();
  expect(faqIcon).toBeDefined();
  expect(iuIcon).toBeDefined();
});