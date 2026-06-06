import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import SelfReflections from './SelfReflections';

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
});
