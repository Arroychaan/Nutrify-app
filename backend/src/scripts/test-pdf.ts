
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
console.log('pdf is:', pdf);
console.log('pdf.default is:', pdf.default);
