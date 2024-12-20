"use client";

import { useState } from "react";

interface Window {
  showSaveFilePicker(options: {
    suggestedName: string;
    types: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }): Promise<FileSystemFileHandle>;
}

interface ImageGeneratorProps {
  generateImage: (text: string) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
}

export default function ImageGeneratorProps({ generateImage }: ImageGeneratorProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const data = await generateImage(inputText);
      setImageName(inputText);

      if (!data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.imageUrl) {
        const image = new Image();
        const imageUrl = data.imageUrl;
        image.onload = () => {
          setGeneratedImage(imageUrl); 
        }
        image.src = imageUrl;
      } else {
        throw new Error("No image URL returned from the API");
      }
      setInputText("");
    } catch {
      console.error("Error:", error);
      setError("Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 m-5">
      <main className="flex-1 flex flex-col items-center max-h-screen overflow-y-auto">
        {generatedImage && (
          <div className="w-full max-w-2xl rounded-lg overflow-hidden shadow-lg relative group">
            <img src={generatedImage} alt="Generated Image" className="object-cover w-full" />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={async () => {
                  try {
                    // Sanitize the text for filename
                    const sanitizedText = imageName
                      .toLowerCase()
                      .replace(/\+/g, ' ');
                    const suggestedName = `${sanitizedText}-${Date.now()}.png`;
                     // Try to use the modern File System Access API
                    if ('showSaveFilePicker' in window) {
                      // Convert base64 to blob
                      const response = await fetch(generatedImage);
                      const blob = await response.blob();
                      
                      try {
                        const handle = await (window as Window & typeof globalThis).showSaveFilePicker({
                          suggestedName,
                          types: [{
                            description: 'PNG Image',
                            accept: {'image/png': ['.png']},
                          }],
                        });
                        
                        const writable = await handle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                      } catch (err: unknown) {
                        // User cancelled the save dialog
                        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                          // User cancelled, do nothing
                          return;
                        }
                        throw err;
                      }
                    } else {
                      // Fallback for browsers that don't support File System Access API
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = suggestedName;
                      link.click();
                    }
                  } catch (error) {
                    console.error('Error saving image:', error);
                    setError("Failed to save image");
                    // You might want to show an error message to the user here
                  }
                }}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
               
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="white" 
                  className="w-6 h-6"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
