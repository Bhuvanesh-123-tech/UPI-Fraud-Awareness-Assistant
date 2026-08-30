const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");


function addMessage(text, sender) {

    const message = document.createElement("div");

    message.classList.add("message", sender);

    message.innerHTML = text;

    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;
}


function sendMessage() {

    const text = userInput.value.trim();

    if (text === "") {
        return;
    }

    // Add user's message
    addMessage(text, "user");

    // Clear input
    userInput.value = "";

    // Temporary chatbot response
    setTimeout(() => {

        addMessage(
            "Thanks for telling me. I'm analyzing the situation...",
            "bot"
        );

    }, 500);
}


// Send when button is clicked
sendButton.addEventListener("click", sendMessage);


// Send when Enter is pressed
userInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});
