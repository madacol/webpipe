(inputText) => { //   [aria-selected='true'] > [data-testid='cell-frame-container'] [data-testid='last-msg-status']
    let [sender, raw_message] = inputText.split(`
: 
`)
    // if (sender === "You") return

    let message, command;
    if (!raw_message) {
        sender = "Bob"
        message = sender
    } else {
        command = raw_message[0]
        message = raw_message.slice(1)
    }
    switch (command) {
        case '.':
            return {sender, bing: message}

        case ',':
            return {sender, chatgpt: message}

        default:
            return {sender, message: raw_message}
    }
    
}

/*
 chatgpt:
 textarea[tabindex='0']


 */