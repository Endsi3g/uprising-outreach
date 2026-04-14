export async function speak(text: string, voiceId: string = "pNInz6obpgH7i7XbYedS") { // Default 'Mentor' voice
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate speech");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
    
    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve(true);
      };
    });
  } catch (error) {
    console.error("Eleven Labs Error:", error);
  }
}
