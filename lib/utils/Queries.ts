import { PoolClient } from "pg";
import { pool } from "./DatabaseConfiguration";

export default class DatabaseQueries {
  async initProjectionStatus() {
    const client = await pool.connect();
    const feed = 'organisation';

    const PROJECTION_INIT = `
      INSERT INTO ldes.projection_status(feed, position)
          VALUES($1, 0);`;

    try {
      return await client.query(PROJECTION_INIT, [feed]);
    } finally {
      client.release();
    }
  }

  async getProjectionStatus() {
    const client = await pool.connect();
    const feed = 'organisation';

    const PROJECTION_STATUS = `
      SELECT position
        FROM ldes.projection_status
      WHERE feed = $1;`;

    try {
      return await client.query(PROJECTION_STATUS, [feed]);
    } finally {
      client.release();
    }
  }

  async setProjectionStatus(client: PoolClient, position: number) {
    const feed = 'organisation';

    const PROJECTION_STATUS_UPDATE = `
      UPDATE ldes.projection_status
        SET position = $1
      WHERE feed = $2`;

    return await client.query(PROJECTION_STATUS_UPDATE, [position, feed]);
  }

  async transaction(f: (client: PoolClient) => any) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await f(client);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

export const db = new DatabaseQueries();