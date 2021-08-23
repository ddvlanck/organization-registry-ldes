const fs = require('fs');

export default class Configuration {
  database: { username: string, password: string, host: string, port: number, database: string };
  feed: string;
  domainName: string;

  constructor() {
    const rawdata = fs.readFileSync('config.json', 'utf8');
    const configuration = JSON.parse(rawdata.trim());

    this.database = configuration.database;
    this.feed = configuration.feed;

    this.domainName = process.env.DOMAIN_NAME || configuration.domainName;
  }
}

export const configuration = new Configuration();