"use server";

import ImageGenerator from "./components/imageGenerator";
import { generateImage } from "./actions/generateImage";

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-between h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 animate-gradient">
      <div className="max-w-4xl mx-auto w-3/4">
        <h1 className="text-4xl font-bold text-white text-center mb-8 animate-fade-in">
          AI Image Generator
        </h1>
        <div className="flex flex-end bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-14 shadow-xl h-[80vh]
          hover:shadow-2xl transition-all duration-300 ease-in-out
          animate-slide-up">
          <ImageGenerator generateImage={generateImage} />
        </div>
      </div>
    </main>
  );
}