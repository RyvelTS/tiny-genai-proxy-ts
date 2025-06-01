import dotenv from 'dotenv';
import path from 'path';

// Determine the path to your .env.test file
const envPath = path.resolve(process.cwd(), '.env.test');

// Load the environment variables from .env.test
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.warn(`Warning: Could not load .env.test file from ${envPath}. Tests might not run correctly if they depend on these environment variables.`);
} else {
    console.log(`.env.test loaded successfully from ${envPath} for Jest setup.`);
}

// Can also set default values here if they are not found in .env.test,
if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY was not found in .env.test or environment. Setting a default placeholder.');
    process.env.GEMINI_API_KEY = 'default_placeholder_api_key_for_tests';
}
if (!process.env.LOG_LEVEL) {
    process.env.LOG_LEVEL = 'warn'; // Suppress verbose logging during tests
}
