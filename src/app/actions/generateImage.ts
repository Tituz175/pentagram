"use server";

const url = "https://pentagram-sandy.vercel.app/"

export async function generateImage(text: string) {
  try {
    const response = await fetch(`${url}/api/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CLIENT-API-Key": process.env.API_CLIENT_KEY || "",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating image:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate image" };
  }
}
