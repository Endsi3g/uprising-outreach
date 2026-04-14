// ProspectOS Sidepanel Logic
// Connects to the main ProspectOS Backend for Intelligence

let API_BASE_URL = "http://localhost:8000/api/v1";

// Load API URL from settings
chrome.storage.sync.get(['apiUrl'], (result) => {
    if (result.apiUrl) {
        API_BASE_URL = result.apiUrl;
    }
});

const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const analyzeButton = document.getElementById('analyze-button');
const settingsButton = document.getElementById('settings-btn');

if (settingsButton) {
    settingsButton.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
}

let messages = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addMessage("assistant", "Bonjour ! Je suis l'assistant ProspectOS. Je peux analyser cette page ou répondre à vos questions sur vos leads.");
});

function parseMarkdown(text) {
    if (!text) return "";
    let html = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\n*<ul>/gim, ''); // merge adjacent ul tags

    // Newlines to <br> for text outside of block elements
    html = html.split('\n').map(line => {
        if (line.match(/^(<h|<ul|<li)/)) return line;
        return line ? line + '<br>' : '';
    }).join('\n');

    return html;
}

async function callProspectOS(input) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const response = await fetch(`${API_BASE_URL}/ai/secretary`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_input: input
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response_prefix || data.response || "Réponse reçue, mais vide.";
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Backend Error:", error);
        if (error.name === 'AbortError') {
            return "Erreur: Le serveur met trop de temps à répondre (Timeout de 15s).";
        }
        return "Erreur: Connexion au serveur ProspectOS échouée. Veuillez vérifier que l'URL dans les paramètres est correcte et que le serveur tourne.";
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
    
    if (role === 'assistant') {
        inner.innerHTML = parseMarkdown(content);
        
        // Add basic styling for markdown elements
        const styles = document.createElement('style');
        styles.textContent = `
            .message-inner ul { margin: 8px 0; padding-left: 20px; }
            .message-inner li { margin-bottom: 4px; }
            .message-inner h1, .message-inner h2, .message-inner h3 { margin: 12px 0 8px 0; }
            .message-inner a { color: var(--color-focus); text-decoration: underline; }
        `;
        if(!document.head.querySelector('#markdown-styles')) {
            styles.id = 'markdown-styles';
            document.head.appendChild(styles);
        }
    } else {
        inner.textContent = content; // escape user input automatically
    }
    
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
    addMessage("user", "Analyse des signaux de cette page...");
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant loading';
    loadingDiv.innerHTML = '<div class="message-inner">Extraction du contenu (via Backend Playwright)...</div>';
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url) {
            throw new Error("Impossible d'obtenir l'URL de l'onglet actif.");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout pour scraping + analyse

        const response = await fetch(`${API_BASE_URL}/ai/analyze-page`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: tab.url
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        chatHistory.removeChild(loadingDiv);
        addMessage("assistant", data.response_prefix || data.response || "Analyse terminée.");

    } catch (error) {
        console.error("Analysis Error:", error);
        chatHistory.removeChild(loadingDiv);
        if (error.name === 'AbortError') {
            addMessage("assistant", "Erreur: Le serveur met trop de temps à analyser la page (Timeout).");
        } else {
            addMessage("assistant", "Erreur lors de l'analyse de la page. Vérifiez que l'URL est correcte et accessible par le serveur.");
        }
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