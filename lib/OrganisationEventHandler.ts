import { PoolClient } from "pg";

export default class OrganisationEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {

  }

  private async processEvents(client: PoolClient, entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const changeId = Number(event['changeId']);
      //const objectId = Number(event['id']);
      const ovoNumber = event['ovoNumber'];

      await this.processEvent(client, changeId, ovoNumber);
    }
  }

  private async processEvent(client: PoolClient, position: number, ovoNumber: string) {
    console.log(`[OrganisationEventHandler]: Processing event of ${ovoNumber} at position ${position}`);
  }
}