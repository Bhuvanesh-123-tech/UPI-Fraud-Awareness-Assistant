const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const sendButton = document.getElementById("send-button");

let conversation = [];


function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `message ${sender}`;

    const lines = text.split("\n");

    lines.forEach((line, index) => {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

        if (headingMatch) {
            const heading = document.createElement(`h${headingMatch[1].length}`);
            heading.textContent = headingMatch[2];
            message.appendChild(heading);
        } else {
            const formattedLine = document.createElement("span");
            formattedLine.innerHTML = line
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            message.appendChild(formattedLine);
        }

        if (index < lines.length - 1) {
            message.appendChild(document.createElement("br"));
        }
    });

    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}


function addLoadingMessage() {
    const message = document.createElement("div");
    message.className = "message bot loading";
    message.id = "loading-message";
    message.textContent = "Thinking...";
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLoadingMessage() {
    const message = document.getElementById("loading-message");

    if (message) {
        message.remove();
    }
}

async function sendMessage() {
    const text = userInput.value.trim();

    if (!text) {
        return;
    }

    addMessage(text, "user");

    conversation.push({
        role: "user",
        content: text
    });

    userInput.value = "";
    sendButton.disabled = true;

    addLoadingMessage();

    try {
        const response = await fetch("https://upi-fraud-awareness-assistant.onrender.com/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                history: conversation
            })
        });

        const data = await response.json();

        removeLoadingMessage();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        addMessage(data.reply, "bot");

        conversation.push({
            role: "assistant",
            content: data.reply
        });

    } catch (error) {

        removeLoadingMessage();

      addMessage(
    "Sorry, the assistant encountered an error. Please check the connection and try again.",
    "bot"
);

console.error("Chatbot request failed:", error);
    }

    sendButton.disabled = false;
    userInput.focus();
}

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendMessage();
});
