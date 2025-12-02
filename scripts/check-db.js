const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
            process.env[key] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking Supabase connection...');
    console.log('URL:', supabaseUrl);

    // 1. Test a non-existent table to verify we can catch the error
    console.log('\nTest 1: Querying non-existent table "should_not_exist"...');
    const { error: error1 } = await supabase.from('should_not_exist').select('*').limit(1);
    if (error1) {
        console.log('Expected error received:', error1.code, error1.message);
    } else {
        console.log('WARNING: No error received for non-existent table!');
    }

    // 2. Test the "books" table
    console.log('\nTest 2: Querying "books" table...');
    const { data, error } = await supabase.from('books').select('*').limit(1);

    if (error) {
        console.error('Error querying "books" table:');
        console.error(JSON.stringify(error, null, 2));
        if (error.code === 'PGRST205' || error.message.includes('does not exist')) {
            console.log('\n✅ DIAGNOSIS: The "books" table does not exist.');
            console.log('You need to run the SQL in schema.sql in your Supabase SQL Editor.');
        } else {
            console.log('\n⚠️ DIAGNOSIS: Connection successful, but another error occurred.');
        }
    } else {
        console.log('\n✅ Success! Connected to Supabase and found "books" table.');
        console.log(`Query returned ${data.length} rows.`);
        if (data.length > 0) {
            console.log('First book:', data[0].title);
            console.log('Text length:', data[0].text_content ? data[0].text_content.length : 'NULL');
            console.log('Last position:', data[0].last_position);
        }
    }
}

check();
