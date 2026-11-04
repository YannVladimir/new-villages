import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// We don't enable Vitest's `globals` mode (keeps test files' imports explicit),
// so Testing Library's automatic afterEach(cleanup) registration never fires —
// without this, each test's render() would leak into the next and later
// assertions would match duplicate elements across tests.
afterEach(() => {
  cleanup();
});
