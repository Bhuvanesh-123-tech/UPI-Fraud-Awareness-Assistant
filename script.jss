* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}

body {
    background: #f1f5f9;
    min-height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;

    padding: 20px;
}

.chat-container {
    width: 100%;
    max-width: 700px;
    height: 700px;

    background: white;

    border-radius: 20px;

    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);

    overflow: hidden;

    display: flex;
    flex-direction: column;
}

/* HEADER */

.chat-header {
    background: #111827;
    color: white;

    padding: 22px;
}

.chat-header h1 {
    font-size: 24px;
}

.chat-header p {
    margin-top: 5px;
    color: #cbd5e1;
}

/* CHAT */

.chat-box {
    flex: 1;

    padding: 20px;

    overflow-y: auto;

    display: flex;
    flex-direction: column;
    gap: 14px;

    background: #f8fafc;
}

.message {
    max-width: 80%;

    padding: 13px 16px;

    border-radius: 15px;

    line-height: 1.5;

    font-size: 15px;
}

.bot {
    align-self: flex-start;

    background: #e2e8f0;

    color: #0f172a;

    border-bottom-left-radius: 4px;
}

.user {
    align-self: flex-end;

    background: #2563eb;

    color: white;

    border-bottom-right-radius: 4px;
}

/* INPUT */

.input-area {
    display: flex;

    padding: 15px;

    border-top: 1px solid #e2e8f0;

    gap: 10px;
}

#user-input {
    flex: 1;

    padding: 13px;

    border: 1px solid #cbd5e1;

    border-radius: 10px;

    outline: none;

    font-size: 15px;
}

#user-input:focus {
    border-color: #2563eb;
}

#send-button {
    padding: 13px 20px;

    border: none;

    border-radius: 10px;

    background: #2563eb;

    color: white;

    font-weight: bold;

    cursor: pointer;
}

#send-button:hover {
    background: #1d4ed8;
}

/* MOBILE */

@media (max-width: 600px) {

    body {
        padding: 0;
    }

    .chat-container {
        height: 100vh;

        border-radius: 0;
    }

    .chat-header h1 {
        font-size: 20px;
    }

    .message {
        max-width: 90%;
    }
}
