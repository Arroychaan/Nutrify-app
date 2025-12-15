
import fetch from 'node-fetch';

async function run() {
    console.log('Fetching RAG validation...');
    try {
        const res = await fetch('http://localhost:3001/api/v1/test/validation/rag');
        if (!res.ok) {
            console.log('Status:', res.status, res.statusText);
            console.log(await res.text());
            return;
        }
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err);
    }
}
run();
