// ProspectOS Sidepanel Logic
// Connects to the main ProspectOS Backend for Intelligence

const API_BASE_URL = "http://localhost:8000/api/v1";

const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const analyzeButton = document.getElementById('analyze-button');

let messages = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addMessage("assistant", "Bonjour ! Je suis l'assistant ProspectOS. Je peux analyser cette page ou répondre à vos questions sur vos leads.");
});

async function callProspectOS(input) {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/secretary`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_input: input
            })
        });

        if (!response.ok) {
            throw new Error("Impossible de contacter le serveur ProspectOS. Assurez-vous que l'application est lancée.");
        }

        const data = await response.json();
        return data.response_prefix;
    } catch (error) {
        console.error("Backend Error:", error);
        return "Erreur: Connexion au serveur ProspectOS échouée. Veuillez vérifier que le backend est actif.";
    }
}

function addMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    // Smooth fade in
    msgDiv.style.opacity = "0";
    msgDiv.style.transform = "translateY(10px)";
    msgDiv.style.transition = "all 0.3s ease";

    const inner = document.createElement('div');
    inner.className = 'message-inner';
    inner.textContent = content;
    
    msgDiv.appendChild(inner);
    chatHistory.appendChild(msgDiv);
    
    // Trigger animation
    setTimeout(() => {
        msgDiv.style.opacity = "1";
        msgDiv.style.transform = "translateY(0)";
    }, 10);

    chatHistory.scrollTop = chatHistory.scrollHeight;
    messages.push({ role, content });
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = "";
    userInput.style.height = "40px";
    addMessage("user", text);

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant loading';
    loadingDiv.innerHTML = '<div class="message-inner">Réflexion...</div>';
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const response = await callProspectOS(text);
    
    chatHistory.removeChild(loadingDiv);
    addMessage("assistant", response);
}

async function analyzePage() {
    addMessage("assistant", "Analyse des signaux de la page en cours...");
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                return {
                    title: document.title,
                    url: window.location.href,
                    text: document.body.innerText.substring(0, 3000)
                };
            }
        });

        const pageContent = results[0].result;
        const prompt = `Analyse cette page pour la prospection :
URL: ${pageContent.url}
Titre: ${pageContent.title}
Contenu: ${pageContent.text}

Donne moi 3 insights clés pour approcher ce prospect.`;

        const response = await callProspectOS(prompt);
        addMessage("assistant", response);

    } catch (error) {
        console.error("Analysis Error:", error);
        addMessage("assistant", "Erreur lors de la capture de la page. Vérifiez les permissions de l'extension.");
    }
}

sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
    // Auto-resize
    setTimeout(() => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }, 0);
});

if (analyzeButton) {
    analyzeButton.addEventListener('click', analyzePage);
}
