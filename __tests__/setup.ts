import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers'; // Utilisez l'importation par défaut

expect.extend(matchers);

// Nettoie après chaque test
afterEach(() => {
    cleanup();
});
