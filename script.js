const promptInput = document.querySelector('#prompt');
const chatContainer = document.querySelector('.chat-container');
const imageBtn = document.querySelector('#image');
const imageInput = document.querySelector('#image input');

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY';

let user = {
  data: null,
};

async function generateResponse(userMessage, isImage = false) {
  appendMessage(userMessage, 'user');
  showLoading();

  try {
    const contents = [{ parts: [] }];

    if (isImage && user.data) {
      contents[0].parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: user.data.split(',')[1],
        },
      });
    }

    contents[0].parts.push({ text: userMessage });

    const body = { contents };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();

    const botReply =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, no meaningful response was returned.';

    removeLoading();
    appendMessage(botReply, 'ai');
    scrollToBottom();
  } catch (error) {
    removeLoading();
    console.error('API call failed:', error);
    appendMessage('❌ Error: Unable to reach the server or process your request.', 'ai');
    scrollToBottom();
  }
}

function appendMessage(text, sender) {
  const messageEl = document.createElement('div');
  messageEl.className = sender === 'user' ? 'user-chat-box' : 'ai-chat-box';

  const textEl = document.createElement('div');
  textEl.className = sender === 'user' ? 'user-chat-area' : 'ai-chat-area';
  textEl.innerText = text;

  const timestampEl = document.createElement('div');
  timestampEl.className = 'timestamp';
  timestampEl.innerText = getTime();

  textEl.appendChild(timestampEl);
  messageEl.appendChild(textEl);
  chatContainer.appendChild(messageEl);
}

function showLoading() {
  const loader = document.createElement('div');
  loader.className = 'ai-chat-box loading';
  loader.id = 'loading';
  loader.innerHTML = `<div class="ai-chat-area">Typing...</div>`;
  chatContainer.appendChild(loader);
  scrollToBottom();
}

function removeLoading() {
  const loader = document.getElementById('loading');
  if (loader) chatContainer.removeChild(loader);
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

promptInput.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;
  promptInput.value = '';
  generateResponse(text);
});

imageBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    user.data = reader.result;
    generateResponse('Analyze this image, please', true);
  };
  reader.readAsDataURL(file);
});