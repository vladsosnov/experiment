import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import TwentyFortyEightSolver from './TwentyFortyEightSolver';

describe('TwentyFortyEightSolver', () => {
  it('renders a 4 by 4 editable board and search strength controls', () => {
    const html = renderToString(<TwentyFortyEightSolver onBack={vi.fn()} />);

    expect(html).toContain('Move Solver');
    expect(html).toContain('Board');
    expect(html).toContain('Suggestion');
    expect(html.match(/aria-label="Row [1-4] column [1-4]"/g)).toHaveLength(16);
    expect(html).toContain('Fast');
    expect(html).toContain('Strong');
    expect(html).toContain('Deep');
  });
});
