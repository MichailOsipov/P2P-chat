const initialChatConfig = '1:2,3;2:1,6;3:1,4,5,6;4:3;5:3;6:2,3';

chatInitTextarea.value = initialChatConfig;

class User {
    constructor(userName, neighboors, sendMessage) {
        this.userName = userName;
        this.neighboors = neighboors;
    }

    receiveMessage(author, receiver) {
        console.log('!');
    }
}

class ChatSystem {
    constructor() {
        this.initializeChat = this.initializeChat.bind(this);
        this.sendMessageByInnerClass = this.sendMessageByInnerClass.bind(this);
        this.sendMessageByUser = this.sendMessageByUser.bind(this);
    }

    initializeChat() {
        const chatConfig = chatInitTextarea.value;
        const usersConfig = chatConfig.split(';');
        this.users = [];
        usersConfig.forEach(userConfig => {
            const [userName, neighboors] = userConfig.split(':');
            this.users.push(new User(userName, neighboors, this.sendMessageByInnerClass));
        });
    }

    sendMessageByInnerClass(author, receiver) {

    }

    sendMessageByUser() {
        console.log(this.users[0].userName);
        const message = currentCommandTextarea.value;
        const [author, receiver] = message.split(':');
        const authorUser = this.users.find(({userName}) => author === userName);
        const receiverUser = this.users.find(({userName}) => receiver === userName);
        // sendMessage
    }
}

const chatSystem = new ChatSystem();
initializeChatButton.addEventListener('click', chatSystem.initializeChat);
performCommandButton.addEventListener('click', chatSystem.sendMessageByUser);
