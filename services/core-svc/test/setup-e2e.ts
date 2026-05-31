// Грузим .env.test ДО любых импортов приложения (config читает env при старте).
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '..', '.env.test') });
