import { MongoClient } from 'mongodb';

// Replace the uri string with your connection string.
const uri = "mongodb://mongo";
const client = new MongoClient(uri);

const database = client.db('dapsboardCache');
export const collection = database.collection('cache');