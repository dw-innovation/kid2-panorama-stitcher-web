import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MongoClient, type Db } from 'mongodb';
import { MONGODB_URI, MONGODB_DBNAME } from '$env/static/private';

let cachedDb: Db;

// Function to connect to MongoDB, reusing a cached connection if available
async function connectToDatabase(): Promise<Db> {
	if (cachedDb) return cachedDb;

	const client = await MongoClient.connect(MONGODB_URI || '');
	const db = client.db(MONGODB_DBNAME);
	cachedDb = db;
	return db;
}

function generateShortId(): string {
	return Math.random().toString(36).substring(2, 8);
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse the request payload
		const payload = await request.json();

		// Generate a short ID for the feedback
		const id = generateShortId();

		// Construct the data object to be inserted into the database
		const data = {
			id: id,
			feedback: payload,
			date: new Date()
		};

		// Connect to MongoDB and get the 'feedback' collection
		const db = await connectToDatabase();
		const collection = db.collection('feedback');

		// Insert the new feedback data into the database
		await collection.insertOne(data);

		// Return a success response along with the generated ID
		return json(
			{
				status: 'success',
				message: 'feedbackSuccessfullySaved',
				id: id
			},
			{ status: 200 }
		);
	} catch (error: any) {
		// Handle any errors during the database operation
		return json(
			{
				status: 'error',
				message: 'errorSavingFeedback',
				error: error.message
			},
			{ status: 500 }
		);
	}
};
