import { Command } from 'commander';
import { pool } from '../lib/utils/DatabaseConfiguration';
import FeedFetcher from '../lib/FeedFetcher';
const program = new Command();

program
  .usage('starts fetching the configured event stream from the organization registry in Flanders.');

const run = async () => {

  pool.connect(async (err, client, release) => {
    if (err) {
      return console.error(`[Server]: Error trying to connect to database. Printing error:`, err.stack);
    }

    const fetcher = new FeedFetcher();
    await fetcher.fetchFeed();

    console.log(`Done traversing the event stream of the organisation registr.y`);
    process.exit();
  });
}

run().catch(err => console.error(err));

