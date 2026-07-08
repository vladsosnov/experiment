import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import GoalSetup from './GoalSetup';

describe('GoalSetup', () => {
  it('offers JSON goal import from the setup page', () => {
    const html = renderToString(
      <GoalSetup
        onSave={vi.fn()}
        onImportFile={vi.fn()}
        onShowCompletedGoals={vi.fn()}
      />,
    );

    expect(html).toContain('Import goal');
    expect(html).toContain('accept=".json"');
    expect(html).toContain('aria-label="Import goal backup"');
  });
});
