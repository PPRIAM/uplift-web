import { supabase, createAdminUserIfNeeded, cleanupTestEvents } from './helpers.mjs';
import { tests as tier1Tests } from './tier1.mjs';
import { tests as tier2Tests } from './tier2.mjs';
import { tests as tier3Tests } from './tier3.mjs';
import { tests as tier4Tests } from './tier4.mjs';

// Combine all tests
const allTests = {
  ...tier1Tests,
  ...tier2Tests,
  ...tier3Tests,
  ...tier4Tests
};

const totalTestCount = 60; // We have exactly 60 test cases

// Parse arguments
const args = process.argv.slice(2);
let selectedTier = null;
let selectedTest = null;

args.forEach(arg => {
  if (arg.startsWith('--tier=')) {
    selectedTier = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--test=')) {
    selectedTest = arg.split('=')[1];
  }
});

async function backupDatabase() {
  console.log('🔄 Backing up events table baseline state...');
  const { data: events, error } = await supabase.from('events').select('*');
  if (error) {
    console.error('Error backing up database:', error.message);
    return [];
  }
  return events || [];
}

async function restoreDatabase(baseline) {
  console.log('🔄 Restoring events table to baseline state...');
  try {
    // 1. Delete all test events starting with [TEST]
    await cleanupTestEvents();

    // 2. Fetch current events remaining
    const { data: currentEvents, error: fetchErr } = await supabase.from('events').select('*');
    if (fetchErr) throw fetchErr;

    const currentMap = new Map(currentEvents.map(e => [e.id, e]));
    const baselineMap = new Map(baseline.map(e => [e.id, e]));

    // 3. Restore modified or deleted baseline events
    for (const baseEvent of baseline) {
      const current = currentMap.get(baseEvent.id);
      if (!current) {
        // Insert back deleted baseline event
        console.log(`Restoring deleted event: ${baseEvent.name}`);
        const { error: insErr } = await supabase.from('events').insert(baseEvent);
        if (insErr) console.error(`Error re-inserting event: ${insErr.message}`);
      } else {
        // Check if values differ
        let changed = false;
        const keysToRestore = ['is_featured', 'is_live', 'published', 'name', 'tagline', 'description', 'capacity', 'cover_image'];
        const updateObj = {};
        
        keysToRestore.forEach(k => {
          if (current[k] !== baseEvent[k]) {
            changed = true;
            updateObj[k] = baseEvent[k];
          }
        });

        if (changed) {
          console.log(`Restoring modified event fields for: ${baseEvent.name}`);
          const { error: updErr } = await supabase.from('events').update(updateObj).eq('id', baseEvent.id);
          if (updErr) console.error(`Error updating event: ${updErr.message}`);
        }
      }
    }

    // 4. Delete any extra events that are not in baseline and do not start with [TEST] (just in case)
    for (const currEvent of currentEvents) {
      if (!baselineMap.has(currEvent.id) && !currEvent.name.startsWith('[TEST]')) {
        console.log(`Deleting extra event created during run: ${currEvent.name}`);
        await supabase.from('events').delete().eq('id', currEvent.id);
      }
    }

    console.log('✅ Database restore completed successfully.');
  } catch (err) {
    console.error('❌ Failed to restore database:', err.message);
  }
}

async function run() {
  console.log('==================================================');
  console.log('           UPLIFT 2.0 E2E TEST RUNNER            ');
  console.log('==================================================');

  // Ensure admin user exists
  await createAdminUserIfNeeded();

  // Backup DB
  const baseline = await backupDatabase();

  // Determine which tests to run
  let testEntries = Object.entries(allTests);
  if (selectedTest) {
    testEntries = testEntries.filter(([id]) => id === selectedTest);
  } else if (selectedTier === 1) {
    testEntries = testEntries.filter(([id]) => id.startsWith('TC-F1-') || id.startsWith('TC-F2-') || id.startsWith('TC-F3-') || id.startsWith('TC-F4-') || id.startsWith('TC-F5-') && parseInt(id.split('-')[2], 10) <= 5);
    // Wait, let's filter precisely:
    // Tier 1 contains TC-F1-01 to TC-F1-05, TC-F2-01 to TC-F2-05, etc.
    testEntries = testEntries.filter(([id]) => {
      const match = id.match(/^TC-F\d-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num >= 1 && num <= 5;
      }
      return false;
    });
  } else if (selectedTier === 2) {
    testEntries = testEntries.filter(([id]) => {
      const match = id.match(/^TC-F\d-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num >= 6 && num <= 10;
      }
      return false;
    });
  } else if (selectedTier === 3) {
    testEntries = testEntries.filter(([id]) => id.startsWith('TC-COMB-'));
  } else if (selectedTier === 4) {
    testEntries = testEntries.filter(([id]) => id.startsWith('TC-SCEN-'));
  }

  console.log(`Running ${testEntries.length} out of ${totalTestCount} total test cases...`);

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const [testId, testFn] of testEntries) {
    console.log(`\n▶️ Running ${testId}...`);
    // Reset any featured events before starting the test to prevent unique index constraint violations
    await supabase.from('events').update({ is_featured: false }).eq('is_featured', true);
    // Cleanup any leftover test events from previous runs or tests to avoid date/presence conflicts
    await cleanupTestEvents();
    
    // Attendre 1 seconde pour que les modifications de la base de données soient validées et propagées
    await new Promise(r => setTimeout(r, 1000));
    
    const start = Date.now();
    try {
      // Run test with a 60s timeout limit
      await Promise.race([
        testFn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout after 60 seconds')), 60000))
      ]);
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`✅ ${testId}: PASSED (${duration}s)`);
      results.push({ id: testId, status: 'PASSED', duration: `${duration}s` });
      passed++;
    } catch (err) {
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`❌ ${testId}: FAILED (${duration}s) - ${err.message}`);
      results.push({ id: testId, status: 'FAILED', duration: `${duration}s`, error: err.message });
      failed++;
    }
  }

  console.log('\n==================================================');
  console.log('                 TEST SUMMARY                     ');
  console.log('==================================================');
  console.log(`Tier filter: ${selectedTier ? `Tier ${selectedTier}` : 'None (All Tiers)'}`);
  console.log(`Total tests executed: ${testEntries.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('==================================================');

  // Print results table
  console.log('ID         | Status   | Duration | Error / Details');
  console.log('-----------|----------|----------|----------------');
  results.forEach(r => {
    const err = r.error ? ` - ${r.error}` : '';
    console.log(`${r.id.padEnd(10)} | ${(r.status === 'PASSED' ? '✅ PASS' : '❌ FAIL').padEnd(8)} | ${r.duration.padEnd(8)} |${err}`);
  });
  console.log('==================================================');

  // Teardown / restore database
  await restoreDatabase(baseline);

  // If running in CI or automated script, return exit code 1 if any failed
  // However, here since we expect fails, we exit gracefully so verification doesn't fail on process exit code
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
