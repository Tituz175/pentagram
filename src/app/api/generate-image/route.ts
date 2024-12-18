import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    const apiKey = request.headers.get("CLIENT-API-Key");

    if (apiKey !== process.env.API_CLIENT_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("Received prompt text:", text);

    const url = new URL(process.env.MODAL_URL || "");
    url.searchParams.set("prompt", text);


    console.log("Requesting external API with URL:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "SERVER-API-Key": process.env.API_SERVER_KEY || "",
        Accept: "image/jpeg"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from external API:", errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }


    const imageBuffer = await response.arrayBuffer();

    const fileName = `${crypto.randomUUID()}.jpg`;

    const blob = await put(fileName, imageBuffer, {
      access: "public",
      contentType: "image/jpeg"
    })
    
    return NextResponse.json({
      success: true,
      imageUrl: blob.url
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
