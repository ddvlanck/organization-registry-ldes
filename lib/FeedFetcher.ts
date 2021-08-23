import { URL, URLSearchParams } from "url";
import { configuration } from "./utils/Configuration";
import { db } from "./utils/Queries";
const fetch = require('node-fetch');
import { Response } from "node-fetch";
//import sleep from 'sleep-promise';
const sleep = require('sleep');
import OrganisationEventHandler from "./OrganisationEventHandler";

export default class FeedFetcher {
  feed: string;

  constructor() {
    this.feed = configuration.feed;
  }

  async fetchFeed() {
    const self = this;
    const lastPosition = await this.getLatestEventId();
    const handler = new OrganisationEventHandler();

    const rateLimitDelay = 100;
    const eventsPerPage = 500;

    let nextLink = new URL(`${this.feed}?q=*&sort=changeId&offset=${lastPosition}&limit=${eventsPerPage}`) || null;
    let fetchNext = true;

    while (fetchNext) {
      console.log(`[Fetcher]: Fetching ${nextLink}`);

      await fetch(nextLink)
        .then((res: Response) => {
          if (res.status === 500) {
            fetchNext = false;
            throw Error(`[Fetcher]: Error while fetching page ${nextLink}. It's possible that there is no data to fetch anymore.`);
          }

          return res.json();
        })
        .then(async (entries: any) => {
          nextLink = self.getNextLink(nextLink, eventsPerPage);

          console.log(`[Fetcher]: Next link is ${nextLink}`);
          await db.transaction(async client => {
            await handler.processPage(client, entries);
            const nextOffset = self.getOffset(nextLink);

            console.log(`Saving position ${nextOffset} for projection 'organisation'.`);
            await db.setProjectionStatus(client, nextOffset);
          });
        })
        .catch((err: Error) => {
          console.error(err);
        });

      console.log(`Waiting ${rateLimitDelay}ms to not trigger rate limit.`);
      await sleep.msleep(rateLimitDelay);
    }
  }

  async getLatestEventId() {
    const lastPosition = await db.getProjectionStatus();

    if (lastPosition.rows.length === 0) {
      await db.initProjectionStatus();
      return 0;
    } else {
      return lastPosition.rows[0].position;
    }
  }

  getNextLink(currentLink: URL, eventsPerPage: number): URL {
    const offset = this.getOffset(currentLink);
    const nextOffset = offset + 500;
    return new URL(`${this.feed}?q=*&sort=changeId&offset=${nextOffset}&limit=${eventsPerPage}`);
  }

  getOffset(url: URL): number {
    const searchParams = new URLSearchParams(url.toString());
    return Number(searchParams.get('offset'));
  }
}