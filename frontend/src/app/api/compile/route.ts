import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Call the actual FastAPI backend compiler engine
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Backend Compiler Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Compilation error:", error);
    return NextResponse.json(
      { error: "Failed to connect to the backend compiler engine. Ensure the FastAPI server is running on port 8000." },
      { status: 500 }
    );
  }
}
