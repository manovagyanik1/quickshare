import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DB_CONFIG = {
  path: process.env.NODE_ENV === 'production'
    ? '/tmp/data.db'
    : join(dirname(dirname(__dirname)), 'data.db')
}; 