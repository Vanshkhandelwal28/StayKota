// @vitest-environment happy-dom
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useApp } from '../src/context/AppContext';
import { localDate } from '../src/lib/discovery';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function AppStateProbe() {
  const app = useApp();
  const [error, setError] = useState('');
  const run = (action: () => void) => {
    try {
      action();
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  return (
    <main>
      <output data-testid="role">{app.user?.role ?? 'guest'}</output>
      <output data-testid="visits">{JSON.stringify(app.visits)}</output>
      <output data-testid="favourites">{JSON.stringify(app.favourites)}</output>
      <output data-testid="hostel-statuses">
        {JSON.stringify(Object.fromEntries(app.hostels.map((hostel) => [hostel.id, hostel.status])))}
      </output>
      <output role="alert">{error}</output>

      <button onClick={() => app.login('  STUDENT@example.com ', 'student')}>Sign in student</button>
      <button onClick={() => app.login('priya@owner.com', 'owner')}>Sign in seed owner</button>
      <button onClick={() => app.login('other@owner.com', 'owner')}>Sign in other owner</button>
      <button onClick={() => app.login('admin@staykota.com', 'admin')}>Sign in admin</button>
      <button onClick={app.logout}>Sign out</button>
      <button
        onClick={() => run(() => app.scheduleVisit({
          hostelId: 'h1', hostelName: 'Untrusted client value', roomTypeId: 'rt1',
          visitDate: localDate(), consentAt: new Date().toISOString(),
        }))}
      >Request valid visit</button>
      <button
        onClick={() => run(() => app.scheduleVisit({
          hostelId: 'h1', hostelName: 'Comfort Stay Hostel', roomTypeId: 'rt1',
          visitDate: localDate(),
        }))}
      >Request without consent</button>
      <button
        onClick={() => run(() => app.scheduleVisit({
          hostelId: 'h1', hostelName: 'Comfort Stay Hostel', roomTypeId: 'rt1',
          visitDate: '2000-01-01', consentAt: new Date().toISOString(),
        }))}
      >Request past visit</button>
      <button
        onClick={() => run(() => app.scheduleVisit({
          hostelId: 'h4', hostelName: 'Kota Living PG', roomTypeId: 'rt9',
          visitDate: localDate(), consentAt: new Date().toISOString(),
        }))}
      >Request unavailable room</button>
      <button
        onClick={() => run(() => app.scheduleVisit({
          hostelId: 'h5', hostelName: 'Focus Nest Hostel', roomTypeId: 'rt10',
          visitDate: localDate(), consentAt: new Date().toISOString(),
        }))}
      >Request from pending listing</button>
      <button onClick={() => app.toggleFavourite('h1')}>Toggle approved favourite</button>
      <button onClick={() => app.toggleFavourite('h5')}>Toggle pending favourite</button>
      <button onClick={() => run(() => app.updateHostelStatus('h1', 'pending'))}>Moderate h1</button>
    </main>
  );
}

describe('AppContext prototype business rules', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'visit-test-id') });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<AppProvider><AppStateProbe /></AppProvider>));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function click(label: string) {
    const button = [...container.querySelectorAll('button')].find((item) => item.textContent === label);
    if (!button) throw new Error(`Missing test action: ${label}`);
    act(() => button.click());
  }

  function output(testId: string) {
    return container.querySelector(`[data-testid="${testId}"]`)?.textContent ?? '';
  }

  function errorMessage() {
    return container.querySelector('[role="alert"]')?.textContent ?? '';
  }

  it('allows only signed-in students to request visits and keeps enquiries pending', () => {
    click('Request valid visit');
    expect(errorMessage()).toContain('Sign in as a student');
    expect(JSON.parse(output('visits'))).toHaveLength(0);

    click('Sign in seed owner');
    click('Request valid visit');
    expect(errorMessage()).toContain('Sign in as a student');
    expect(JSON.parse(output('visits'))).toHaveLength(0);

    click('Sign in student');
    click('Request valid visit');
    const visits = JSON.parse(output('visits'));
    expect(visits).toHaveLength(1);
    expect(visits[0]).toMatchObject({
      id: 'v-visit-test-id',
      studentId: 'demo-student-student%40example.com',
      hostelId: 'h1',
      hostelName: 'Comfort Stay Hostel',
      roomTypeId: 'rt1',
      status: 'requested',
    });
  });

  it('requires consent, a valid non-past date, and an available room in an approved hostel', () => {
    click('Sign in student');

    click('Request without consent');
    expect(errorMessage()).toContain('Consent is required');
    expect(JSON.parse(output('visits'))).toHaveLength(0);

    click('Request past visit');
    expect(errorMessage()).toContain('today or a future date');
    expect(JSON.parse(output('visits'))).toHaveLength(0);

    click('Request unavailable room');
    expect(errorMessage()).toContain('available room in a published hostel');
    expect(JSON.parse(output('visits'))).toHaveLength(0);

    click('Request from pending listing');
    expect(errorMessage()).toContain('available room in a published hostel');
    expect(JSON.parse(output('visits'))).toHaveLength(0);
  });

  it('treats repeated requests for the same room and date as idempotent', () => {
    click('Sign in student');
    click('Request valid visit');
    click('Request valid visit');

    expect(JSON.parse(output('visits'))).toHaveLength(1);
  });

  it('restricts favourites to students and published listings', () => {
    click('Toggle approved favourite');
    expect(JSON.parse(output('favourites'))).toHaveLength(0);

    click('Sign in student');
    click('Toggle pending favourite');
    expect(JSON.parse(output('favourites'))).toHaveLength(0);

    click('Toggle approved favourite');
    expect(JSON.parse(output('favourites'))).toHaveLength(1);
    expect(JSON.parse(output('favourites'))[0].hostelId).toBe('h1');

    click('Toggle approved favourite');
    expect(JSON.parse(output('favourites'))).toHaveLength(0);
  });

  it('allows only an admin to change listing moderation status', () => {
    click('Moderate h1');
    expect(errorMessage()).toContain('Only the demo administrator');
    expect(JSON.parse(output('hostel-statuses')).h1).toBe('approved');

    click('Sign in other owner');
    click('Moderate h1');
    expect(errorMessage()).toContain('Only the demo administrator');
    expect(JSON.parse(output('hostel-statuses')).h1).toBe('approved');

    click('Sign in admin');
    click('Moderate h1');
    expect(JSON.parse(output('hostel-statuses')).h1).toBe('pending');
  });
});
