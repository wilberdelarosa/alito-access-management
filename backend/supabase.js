const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const syncEnabled = process.env.ENABLE_SUPABASE_SYNC === 'true';

let supabase = null;

if (syncEnabled && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase sync enabled');
} else {
    console.log('ℹ️  Supabase sync disabled - using local SQLite only');
}

// ========== SYNC FUNCTIONS ==========

async function syncEmployeesToSupabase(employees) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('employees')
            .upsert(employees, { onConflict: 'id' });

        if (error) throw error;
        console.log(`✅ Synced ${employees.length} employees to Supabase`);
    } catch (err) {
        console.error('❌ Supabase sync error (employees):', err.message);
    }
}

async function syncStatesToSupabase(states) {
    if (!supabase) return;

    try {
        const statesArray = Object.entries(states).map(([id, state]) => ({
            id,
            state: typeof state === 'string' ? state : JSON.stringify(state)
        }));

        const { error } = await supabase
            .from('states')
            .upsert(statesArray, { onConflict: 'id' });

        if (error) throw error;
        console.log(`✅ Synced ${statesArray.length} states to Supabase`);
    } catch (err) {
        console.error('❌ Supabase sync error (states):', err.message);
    }
}

async function syncRequestsToSupabase(requests) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('requests')
            .upsert(requests, { onConflict: 'id' });

        if (error) throw error;
        console.log(`✅ Synced ${requests.length} requests to Supabase`);
    } catch (err) {
        console.error('❌ Supabase sync error (requests):', err.message);
    }
}

async function syncSingleEmployee(emp) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('employees')
            .upsert(emp, { onConflict: 'id' });

        if (error) throw error;
    } catch (err) {
        console.error('❌ Supabase sync error (employee):', err.message);
    }
}

async function syncSingleState(id, state) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('states')
            .upsert({ id, state: typeof state === 'string' ? state : JSON.stringify(state) }, { onConflict: 'id' });

        if (error) throw error;
    } catch (err) {
        console.error('❌ Supabase sync error (state):', err.message);
    }
}

async function syncSingleRequest(req) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('requests')
            .upsert(req, { onConflict: 'id' });

        if (error) throw error;
    } catch (err) {
        console.error('❌ Supabase sync error (request):', err.message);
    }
}

async function deleteEmployeeFromSupabase(id) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (err) {
        console.error('❌ Supabase delete error (employee):', err.message);
    }
}

async function deleteRequestFromSupabase(id) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (err) {
        console.error('❌ Supabase delete error (request):', err.message);
    }
}

// ========== INITIALIZATION ==========

async function initSupabaseTables() {
    if (!supabase) return;

    console.log('📊 Checking Supabase tables...');

    // Note: Tables should be created via Supabase dashboard or migrations
    // This function is just for verification

    try {
        // Test connection
        const { data, error } = await supabase.from('employees').select('count');
        if (error && error.code === '42P01') {
            console.log('⚠️  Tables not found in Supabase. Please create them using the SQL in setup.sql');
        } else {
            console.log('✅ Supabase tables verified');
        }
    } catch (err) {
        console.log('ℹ️  Supabase tables may need to be created');
    }
}

module.exports = {
    supabase,
    syncEnabled,
    syncEmployeesToSupabase,
    syncStatesToSupabase,
    syncRequestsToSupabase,
    syncSingleEmployee,
    syncSingleState,
    syncSingleRequest,
    deleteEmployeeFromSupabase,
    deleteRequestFromSupabase,
    initSupabaseTables
};
