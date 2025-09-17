import algoliasearch from 'algoliasearch';
import { sync, DocumentRecord } from '../node_modules/fumadocs-core/dist/search/algolia.js';
import * as fs from 'node:fs';

const filePath = {
  next: '.next/server/app/static.json.body',
  'tanstack-start': '.output/public/static.json',
  'react-router': 'build/client/static.json',
  waku: 'dist/public/static.json',
}['next'];

const content = fs.readFileSync(filePath);
const records = JSON.parse(content.toString()) as DocumentRecord[];
const client = algoliasearch('0T4ZBDJ3AF', process.env.ALGOLIA_WRITE_KEY || "");

void sync(client, {
  documents: records,
  document: 'builder-hub',
});