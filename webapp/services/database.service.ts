import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import Job from "../orm/models/Job";
import getSettings from "../utils/settings";

export type DatabaseCollections = {
    jobs?: mongoDB.Collection;
}

export interface Transaction<T> {
    transact(collections: DatabaseCollections): Promise<T>;
}

export class FindJobTransaction implements Transaction<Job> {
    constructor(public key: string) { }
    async transact(collections: DatabaseCollections): Promise<Job> {
        const result = await collections.jobs?.findOne<Job>({ key: this.key });
        if (result) return result;
        else throw Error("Failed to find the Job!");
    }
}

export class FindJobByOutputKeyTransaction implements Transaction<Job> {
    constructor(public output_key: string) { }
    async transact(collections: DatabaseCollections): Promise<Job> {
        const result = await collections.jobs?.findOne<Job>({ output_key: this.output_key });
        if (result) return result;
        else throw Error("Failed to find the Job!");
    }
}

export class InsertJobTransaction implements Transaction<string> {
    constructor(public job: Job) { }
    async transact(collections: DatabaseCollections): Promise<string> {
        const result = await collections.jobs?.insertOne(this.job);
        if (result) return result.insertedId.toString();
        else throw Error("Failed to insert!");
    }
}

export async function transact<T>(transaction: Transaction<T>): Promise<T> {
    const settings = getSettings();

    const collections: DatabaseCollections = {}

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(settings.mongo.connectionString);

    await client.connect();

    const db: mongoDB.Db = client.db(settings.mongo.clientdb);
    const jobsCollection: mongoDB.Collection = db.collection(settings.mongo.jobsCollectionString);
    collections.jobs = jobsCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${jobsCollection.collectionName}`);

    let e: any = undefined;
    let outcome: T | undefined = undefined;

    try {
        outcome = await transaction.transact(collections);
    }
    catch (err) {
        e = err;
    }
    finally {
        await client.close();
    }

    if (outcome)
        return outcome;
    else
        throw e;
}