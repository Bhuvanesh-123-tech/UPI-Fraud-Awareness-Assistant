const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const sendButton = document.getElementById("send-button");

let conversation = [];

function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `message ${sender}`;

    function escapeHTML(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatInline(value) {
        let result = escapeHTML(value);
        const codeBlocks = [];

        result = result.replace(/`([^`]+)`/g, (_, code) => {
            const placeholder = `%%CODE${codeBlocks.length}%%`;
            codeBlocks.push(`<code>${code}</code>`);
            return placeholder;
        });

        result = result
            .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
            .replace(/~~(.+?)~~/g, "<del>$1</del>")
            .replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");

        result = result.replace(/%%CODE(\d+)%%/g, (_, index) => {
            return codeBlocks[Number(index)] || "";
        });

        return result;
    }

    const lines = String(text ?? "").split("\n");
    let activeList = null;
    let activeQuote = null;

    function closeContainers() {
        activeList = null;
        activeQuote = null;
    }

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
            closeContainers();
            message.appendChild(document.createElement("br"));
            return;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

        if (headingMatch) {
            closeContainers();

            const heading = document.createElement(
                `h${headingMatch[1].length}`
            );

            heading.innerHTML = formatInline(headingMatch[2]);
            message.appendChild(heading);
            return;
        }

        const quoteMatch = trimmed.match(/^>\s?(.*)$/);

        if (quoteMatch) {
            activeList = null;

            if (!activeQuote) {
                activeQuote = document.createElement("blockquote");
                message.appendChild(activeQuote);
            }

            const quoteLine = document.createElement("div");
            quoteLine.innerHTML = formatInline(quoteMatch[1]);
            activeQuote.appendChild(quoteLine);
            return;
        }

        const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
        const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

        if (unorderedMatch || orderedMatch) {
            activeQuote = null;

            const listType = unorderedMatch ? "ul" : "ol";

            if (!activeList || activeList.tagName.toLowerCase() !== listType) {
                activeList = document.createElement(listType);
                message.appendChild(activeList);
            }

            const item = document.createElement("li");
            item.innerHTML = formatInline(
                unorderedMatch ? unorderedMatch[1] : orderedMatch[1]
            );

            activeList.appendChild(item);
            return;
        }

        closeContainers();

        const paragraph = document.createElement("div");
        paragraph.innerHTML = formatInline(trimmed);
        message.appendChild(paragraph);
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
