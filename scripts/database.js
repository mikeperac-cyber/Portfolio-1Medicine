const fs = require('node:fs/promises');
const path = require('node:path');
const { createStore } = require('../lib/store');

async function main() {
  const [command, filename, confirmation] = process.argv.slice(2);
  const store = createStore();
  try {
    await store.initialize();
    if (command === 'migrate') console.log('Database schema and initial data are ready.');
    else if (command === 'backup') {
      const target = path.resolve(filename || `backups/healthbridge-${Date.now()}.json`);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, JSON.stringify({ version: 1, createdAt: new Date().toISOString(), metrics: await store.read() }, null, 2), { flag: 'wx', mode: 0o600 });
      console.log(`Backup written to ${target}`);
    } else if (command === 'restore') {
      if (!filename || confirmation !== '--replace') throw new Error('Usage: npm run db:restore -- backup.json --replace (replaces all metrics)');
      const backup = JSON.parse(await fs.readFile(filename, 'utf8'));
      const metrics = backup.metrics;
      if (backup.version !== 1 || !metrics || !Array.isArray(metrics.anonymousFeedback) || !Array.isArray(metrics.topicViews) ||
        !Array.isArray(metrics.quizDeltas) || !['totalUsersServed', 'topicsViewedTotal', 'totalGuidesPrinted'].every((key) => Number.isSafeInteger(metrics[key]) && metrics[key] >= 0)) throw new Error('Invalid backup');
      await store.mutate((current) => { for (const key of Object.keys(current)) delete current[key]; Object.assign(current, metrics); });
      console.log('Metrics restored.');
    } else throw new Error('Expected migrate, backup, or restore');
  } finally { await store.close(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
