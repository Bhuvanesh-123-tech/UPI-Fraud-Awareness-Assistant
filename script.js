const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Conversation memory
let conversation = {
    messages: [],
    clues: new Set(),
    scenario: null
};


// -----------------------------
// ADD MESSAGE TO CHAT
// -----------------------------

function addMessage(text, sender) {
    const message = document.createElement("div");

    message.className = "message " + sender;

    // Allow our <strong>, <br>, etc.
    message.innerHTML = text;

    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;
}


// -----------------------------
// NORMALIZE USER TEXT
// -----------------------------

function cleanText(text) {

    return text
        .toLowerCase()
        .replace(/[^\w\s₹]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// -----------------------------
// SIMPLE TYPO HANDLING
// -----------------------------

const typoMap = {
    "scn": "scan",
    "scann": "scan",
    "qr": "qr",
    "mony": "money",
    "mney": "money",
    "refnd": "refund",
    "refundd": "refund",
    "pinn": "pin",
    "pasword": "password",
    "passwrd": "password",
    "otpp": "otp",
    "receve": "receive",
    "recieve": "receive",
    "giv": "give",
    "gve": "give",
    "askd": "asked",
    "askin": "asking",
    "bankk": "bank",
    "callin": "calling",
    "calld": "called",
    "somethin": "something",
    "nothin": "nothing",
    "happnd": "happened",
    "paymnt": "payment",
    "pymnt": "payment",
    "instal": "install",
    "instll": "install",
    "app": "app",
    "job": "job",
    "prize": "prize"
};


function fixTypos(text) {

    const words = text.split(" ");

    return words.map(word => {

        if (typoMap[word]) {
            return typoMap[word];
        }

        return word;

    }).join(" ");
}


// -----------------------------
// DETECT CLUES
// -----------------------------

function detectClues(text) {

    const clues = [];

    const keywordGroups = {

        qr: [
            "qr",
            "scan",
            "scanning"
        ],

        refund: [
            "refund",
            "return money",
            "money back"
        ],

        pin: [
            "pin",
            "upi pin"
        ],

        otp: [
            "otp",
            "one time password"
        ],

        bank: [
            "bank",
            "bank employee",
            "bank worker",
            "customer care"
        ],

        paymentRequest: [
            "payment request",
            "collect request",
            "request money",
            "pay request"
        ],

        job: [
            "job",
            "work from home",
            "employment"
        ],

        prize: [
            "prize",
            "reward",
            "winner",
            "lottery"
        ],

        fee: [
            "fee",
            "processing fee",
            "registration fee",
            "pay first",
            "pay upfront"
        ],

        remoteAccess: [
            "remote access",
            "screen share",
            "control my phone",
            "control my screen",
            "install an app",
            "download an app",
            "anydesk",
            "teamviewer"
        ],

        call: [
            "called",
            "calling",
            "phone",
            "call"
        ],

        receive: [
            "receive",
            "get money",
            "getting money"
        ],

        sendMoney: [
            "send money",
            "transfer money",
            "pay money",
            "send ₹",
            "send rs"
        ]
    };


    for (const [clue, words] of Object.entries(keywordGroups)) {

        for (const word of words) {

            if (text.includes(word)) {

                clues.push(clue);
                break;

            }

        }

    }

    return clues;
}


// -----------------------------
// FIND SCAM TYPE
// -----------------------------

function analyzeSituation(text) {

    const clues = detectClues(text);

    clues.forEach(clue => conversation.clues.add(clue));

    const allClues = conversation.clues;

    if (
        allClues.has("qr") &&
        (
            allClues.has("refund") ||
            allClues.has("receive")
        )
    ) {
        conversation.scenario = "qr_refund";

        return {
            type: "qr_refund",
            risk: "HIGH",
            title: "Possible QR / Refund Scam"
        };
    }


    if (
        allClues.has("bank") &&
        (
            allClues.has("pin") ||
            allClues.has("otp")
        )
    ) {
        conversation.scenario = "fake_bank";

        return {
            type: "fake_bank",
            risk: "HIGH",
            title: "Possible Bank Impersonation Scam"
        };
    }

    if (
        (
            allClues.has("job") ||
            allClues.has("prize")
        ) &&
        allClues.has("fee")
    ) {
        conversation.scenario = "fake_job_prize";

        return {
            type: "fake_job_prize",
            risk: "HIGH",
            title: "Possible Fake Job / Prize Scam"
        };
    }


    if (allClues.has("remoteAccess")) {

        conversation.scenario = "remote_access";

        return {
            type: "remote_access",
            risk: "HIGH",
            title: "Possible Remote Access Scam"
        };
    }


    if (
        allClues.has("paymentRequest") ||
        (
            allClues.has("sendMoney") &&
            allClues.has("receive")
        )
    ) {

        conversation.scenario = "payment_request";

        return {
            type: "payment_request",
            risk: "HIGH",
            title: "Suspicious UPI Payment Request"
        };
    }


    return null;
}

function getResponse(analysis) {

    if (!analysis) {

        return `
            🤔 I need a little more information.

            <br><br>

            What did the person ask you to do?

            <br><br>

            <strong>1.</strong> Send money<br>
            <strong>2.</strong> Scan a QR code<br>
            <strong>3.</strong> Share an OTP or UPI PIN<br>
            <strong>4.</strong> Install an app<br>
            <strong>5.</strong> Something else
        `;
    }


    if (analysis.type === "qr_refund") {

        return `
            🔴 <strong>HIGH RISK — Possible QR / Refund Scam</strong>

            <br><br>

            Someone asking you to scan a QR code to receive a refund or money is a major warning sign.

            <br><br>

            <strong>🚫 Don't:</strong><br>
            • Scan the QR code<br>
            • Enter your UPI PIN because someone tells you to<br>
            • Share OTPs or banking credentials

            <br><br>

            <strong>✅ Do:</strong><br>
            Verify the refund through the company's official app or website.

            <br><br>

            Did they actually send you a QR code?
        `;
    }


    if (analysis.type === "fake_bank") {

        return `
            🔴 <strong>HIGH RISK — Possible Bank Impersonation Scam</strong>

            <br><br>

            Someone claiming to be from a bank or customer-care service should not ask you to reveal your UPI PIN or OTP.

            <br><br>

            <strong>🚫 Never share:</strong><br>
            • UPI PIN<br>
            • OTP<br>
            • Passwords<br>
            • Banking credentials

            <br><br>

            End the conversation and contact the bank through an official channel.

            <br><br>

            Did they contact you unexpectedly?
        `;
    }


    if (analysis.type === "fake_job_prize") {

        return `
            🔴 <strong>HIGH RISK — Possible Fake Job / Prize Scam</strong>

            <br><br>

            Being asked to pay a fee before receiving a job, prize, or reward is a major warning sign.

            <br><br>

            <strong>🚫 Don't send the requested fee.</strong>

            <br><br>

            Verify the offer independently using the organization's official website or contact details.

            <br><br>

            Did they promise you something valuable if you paid first?
        `;
    }


    if (analysis.type === "remote_access") {

        return `
            🔴 <strong>HIGH RISK — Possible Remote Access Scam</strong>

            <br><br>

            Be very careful if someone you don't know asks you to install an app or give them access to your phone or screen.

            <br><br>

            <strong>🚫 Don't:</strong><br>
            • Install unknown apps<br>
            • Share your screen with strangers<br>
            • Give someone control of your device

            <br><br>

            End the interaction and verify the issue through an official channel.

            <br><br>

            Did they ask you to install an app?
        `;
    }


    if (analysis.type === "payment_request") {

        return `
            🔴 <strong>HIGH RISK — Suspicious UPI Payment Request</strong>

            <br><br>

            Be careful with unexpected UPI payment or collect requests.

            <br><br>

            <strong>🚫 Don't approve a payment just because someone says it will send money to you.</strong>

            <br><br>

            Check exactly what the UPI app says before approving anything.

            <br><br>

            Do you personally know the person who sent the request?
        `;
    }
}

function sendMessage() {

    const originalText = userInput.value.trim();

    if (originalText === "") {
        return;
    }


    addMessage(originalText, "user");

    conversation.messages.push(originalText);


    // Clean + fix common typos
    let text = cleanText(originalText);

    text = fixTypos(text);


    const analysis = analyzeSituation(text);


    setTimeout(() => {

        addMessage(
            getResponse(analysis),
            "bot"
        );

    }, 400);

    userInput.value = "";

    userInput.focus();
}

sendButton.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        sendMessage();

    }

});
