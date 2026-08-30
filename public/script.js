const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const sendButton = document.getElementById("send-button");

let conversation = [];

function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `message ${sender}`;
   message.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
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
        const response = await fetch("/chat", {
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
            "Sorry, I couldn't connect to the safety assistant right now. Please try again.",
            "bot"
        );

        console.error(error);
    }

    sendButton.disabled = false;
    userInput.focus();
}

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendMessage();
});
