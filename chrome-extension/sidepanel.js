const CLAUDE_API_KEY = "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";
const CLAUDE_VERSION = "2023-06-01";
const CLAUDE_MODEL = "claude-3-haiku-20240307";

const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const analyzeButton = document.getElementById('analyze-button');

let messages = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addMessage("assistant", "Bonjour ! Je suis ProspectOS. Comment puis-je vous aider à prospecter sur cette page ?");
});

async function callClaude(messages) {
    try {
        const response = await fetch("https://api.anthropic.com/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": CLAUDE_VERSION,
                "dangerously-allow-browser": "true" // Note: Chrome extensions are generally safer but Anthropic SDK usually requires this
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 1024,
                messages: messages
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Erreur API");
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error("Claude API Error:", error);
        return "Désolé, j'ai rencontré une erreur lors de la connexion à l'intelligence ProspectOS.";
    }
}

function addMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    const inner = document.createElement('div');
    inner.className = 'message-inner';
    inner.textContent = content;
    
    msgDiv.appendChild(inner);
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    messages.push({ role, content });
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = "";
    addMessage("user", text);

    // Filter to role: user/assistant only for API
    const apiMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

    const response = await callClaude(apiMessages);
    addMessage("assistant", response);
}

async function analyzePage() {
    addMessage("assistant", "Analyse de la page en cours...");
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                return {
                    title: document.title,
                    text: document.body.innerText.substring(0, 5000) // Truncate to avoid token limits
                };
            }
        });

        const pageContent = results[0].result;
        const prompt = `Voici le contenu de la page web actuelle :
Titre: ${pageContent.title}
Contenu: ${pageContent.text}

Analyse brièvement cette page et propose 3 angles d'approche pour la prospection commerciale.`;

        const response = await callClaude([{ role: "user", content: prompt }]);
        addMessage("assistant", response);

    } catch (error) {
        console.error("Analysis Error:", error);
        addMessage("assistant", "Impossible de lire le contenu de la page. Assurez-vous d'être sur une page web valide.");
    }
}

sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

if (analyzeButton) {
    analyzeButton.addEventListener('click', analyzePage);
}
