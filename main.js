const initialChatConfig = '1:2,3;2:1,6;3:1,4,5,6;4:3;5:3;6:2,3';
const initialChatCommand = 'send:1-3:hello';
const INTERVAL = 1000;

let messageId = 0;
chatInitTextarea.value = initialChatConfig;
currentCommandTextarea.value = initialChatCommand;

class User {
    constructor({userName, neighboors, sendMessage, disabled, showSystemMessage}) {
        this.userName = userName;
        this.neighboors = neighboors || [];
        this.disabled = disabled;
        this.sendMessage = sendMessage;
        this.showSystemMessage = showSystemMessage;

        this.broadCast = this.broadCast.bind(this);
        this.getMessage = this.getMessage.bind(this);
        this.initSending = this.initSending.bind(this);
        this.messageDescriptors = [];
    }

    initSending(from, to, messageStr) {
        const message = {
            type: 'needToSend',
            message: messageStr,
            from,
            to,
            messageId
        };
        this.messageDescriptors[messageId] = {};
        this.messageDescriptors[messageId].alreadyBroadcasting = true;
        messageId++;
        this.broadCast(message);
    }

    broadCast(message) {
        let usersToSend = [...this.neighboors];
        this.messageDescriptors[message.messageId].id = setInterval(() => {
            if (usersToSend === []) {
                clearInterval(this.messageDescriptors[message.messageId].id);
            }

            usersToSend = usersToSend.filter(userName => !this.sendMessage(this.userName, userName, message));
        }, INTERVAL);
    }

    getMessage(message) {
        if (message.type === 'needToSend') {
            if (message.to === this.userName) {
                this.showSystemMessage(`from: ${this.userName}: i got message`);
                const newMessage = {
                    type: 'stopSending',
                    messageId: message.messageId
                };
                this.messageDescriptors[message.messageId] = {};
                this.messageDescriptors[message.messageId].alreadyStopping = true;
                this.broadCast(newMessage);
            } else if (!(this.messageDescriptors[message.messageId] && this.messageDescriptors[message.messageId].alreadyBroadcasting)) {
                this.messageDescriptors[message.messageId] = {};
                this.messageDescriptors[message.messageId].alreadyBroadcasting = true;
                this.broadCast(message);
            }
        } else if (message.type === 'stopSending') {
            if (! (this.messageDescriptors[message.messageId] && this.messageDescriptors[message.messageId].alreadyStopping)) {
                if (this.messageDescriptors[message.messageId]) {
                    clearInterval(this.messageDescriptors[message.messageId].id);
                    this.messageDescriptors[message.messageId].alreadyStopping = true;
                    this.broadCast(message);
                }
            }
        }
    }
}

class ChatSystem {
    constructor() {
        this.initializeChat = this.initializeChat.bind(this);
        this.performCommand = this.performCommand.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.startBroadCasting = this.startBroadCasting.bind(this);
        this.showSystemMessage = this.showSystemMessage.bind(this);
        this.findUserByName = this.findUserByName.bind(this);
    }

    initializeChat() {
        const chatConfig = chatInitTextarea.value;
        const usersConfig = chatConfig.split(';');
        this.users = [];
        usersConfig.forEach(userConfig => {
            const [userName, neighboors] = userConfig.split(':');
            this.users.push(new User({
                userName,
                neighboors: neighboors && neighboors.split(','),
                sendMessage: this.sendMessage,
                showSystemMessage: this.showSystemMessage,
                disabled: false
            }));
        });
    }

    sendMessage(from, receiver, message) {
        const receiverUser = this.findUserByName(receiver);
        if (!receiverUser.disabled) {
            this.showSystemMessage(`from: ${from} to: ${receiver} <type: ${message.type} from: ${message.from} to: ${message.to} message: ${message.message}>`);
            receiverUser.getMessage(message);
            return true;
        }

        this.showSystemMessage(`trying to send from: ${from} to: ${receiver} <type: ${message.type} from: ${message.from} to: ${message.to} message: ${message.message}>`);
        return false;
    }

    startBroadCasting(from, to, message) {
        const userFrom = this.findUserByName(from);
        // const userTo = this.findUserByName(to);

        if (!userFrom.disabled) {
            userFrom.initSending(from, to, message);
        }
    }

    findUserByName(name) {
        return this.users.find(({userName}) => name === userName);
    }

    performCommand() {
        const commandStr = currentCommandTextarea.value;
        const [commandType, option, message] = commandStr.split(':');
        if (commandType === "disable") {
            const userToDisable = this.findUserByName(option);
            userToDisable.disabled = true;

        } else if (commandType === "send") {
            const [author, receiver] = option.split('-');
            this.startBroadCasting(author, receiver, message);
        }
    }

    showSystemMessage(message) {
        outputTextarea.value = `${outputTextarea.value}${message}\n`;
    }
}

const chatSystem = new ChatSystem();
initializeChatButton.addEventListener('click', chatSystem.initializeChat);
performCommandButton.addEventListener('click', chatSystem.performCommand);
