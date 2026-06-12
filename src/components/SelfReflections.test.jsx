import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import SelfReflections from './SelfReflections';
import { withReflectionResult } from './selfReflectionsModel';

describe('SelfReflections', () => {
  it('does not open the add reflection modal until the add button is used', () => {
    const html = renderToString(
      <SelfReflections reflections={[]} onChange={vi.fn()} />,
    );

    expect(html).toContain('Self reflections');
    expect(html).toContain('No reflections yet');
    expect(html).not.toContain('reflection-modal');
    expect(html).not.toContain('Add reflection</h2>');
  });

  it('renders the result column and saved result without opening the result modal', () => {
    const html = renderToString(
      <SelfReflections
        reflections={[
          {
            id: 'reflection-1',
            date: '2026-06-12',
            text: 'This might go badly.',
            result: 'It was manageable and not worth the worry.',
            createdAt: '2026-06-12T09:00:00.000Z',
            updatedAt: '2026-06-12T10:00:00.000Z',
          },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain('<th>Result</th>');
    expect(html).toContain('It was manageable and not worth the worry.');
    expect(html).toContain('aria-label="Edit result for reflection from 2026-06-12"');
    expect(html).not.toContain('result-modal');
    expect(html).not.toContain('Add result</h2>');
  });

  it('updates only the matching reflection when saving a result', () => {
    const next = withReflectionResult(
      [
        {
          id: 'reflection-1',
          date: '2026-06-12',
          text: 'First thought.',
          createdAt: '2026-06-12T09:00:00.000Z',
          updatedAt: '2026-06-12T09:00:00.000Z',
        },
        {
          id: 'reflection-2',
          date: '2026-06-11',
          text: 'Second thought.',
          result: 'Existing result.',
          createdAt: '2026-06-11T09:00:00.000Z',
          updatedAt: '2026-06-11T09:00:00.000Z',
        },
      ],
      'reflection-1',
      '  Not as bad as expected.  ',
      '2026-06-12T10:00:00.000Z',
    );

    expect(next).toEqual([
      {
        id: 'reflection-1',
        date: '2026-06-12',
        text: 'First thought.',
        result: 'Not as bad as expected.',
        createdAt: '2026-06-12T09:00:00.000Z',
        updatedAt: '2026-06-12T10:00:00.000Z',
      },
      {
        id: 'reflection-2',
        date: '2026-06-11',
        text: 'Second thought.',
        result: 'Existing result.',
        createdAt: '2026-06-11T09:00:00.000Z',
        updatedAt: '2026-06-11T09:00:00.000Z',
      },
    ]);
  });
});
