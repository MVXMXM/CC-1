import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { equation, solution } = await request.json();
    if (process.env.POSTGRES_URL) {
      const sql = neon(process.env.POSTGRES_URL);
      await sql`INSERT INTO equations (equation, solution) VALUES (${equation}, ${solution})`;
      return Response.json({ message: 'Equation saved successfully' });
    }
    return Response.json({ message: 'Equation processed (database save skipped)' });
  } catch (error) {
    return Response.json(
      { error: 'Failed to save equation', details: error.message },
      { status: 500 }
    );
  }
}
