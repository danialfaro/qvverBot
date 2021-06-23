const config = require("./config.json");
const Discord = require("discord.js");


// Initialize Firebase
var admin = require("firebase-admin");
var serviceAccount = require("./todolist-7a68a-firebase-adminsdk-c3yw8-a0b878bd8f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://todolist-7a68a.firebaseio.com"
});

const db = admin.firestore();

/*db.collection('todos').add({
    author: "131577805681983488",
    task: 'tirar la basura',
    priority: 2,
    createdAt: Date.now()
})*/

// Initialize Discord Client
const client = new Discord.Client();
const prefix = "!";

const qvverDiscordID = "131577805681983488";

client.on('ready', () => {
    client.user.setActivity('bot en heroku', {type: 'WATCHING'});
    console.log('Listo!');
});

client.on("message", (message) => {

    // If the message is another Bot, do nothing
    if (message.author.bot) return;
    // If the message don't start with the Bot Command prefix, do nothing
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    // Command to check the ping with the bot
    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }

    else if (command === "me") {
        if (message.author.id === qvverDiscordID) {
            message.reply(`Nice ego bro. ${message.author.avatarURL()}`);
        }
    }

    else if (command === "send") {
        message.channel.send(args[0])
    }

    else if (command === "todos") {
        message.reply('aqui tienes tus tareas:').then(m => {
            getTodoData(message.author).then(data => {
                let embedMessage = generateEmbedTodos(message.author, data);
                //m.delete();
                message.channel.send(embedMessage);
            })            
        });
    }

})

client.login(config.BOT_TOKEN);

function getTodoData(author) {

    return new Promise((resolve, reject) => {

        const todosRef = db.collection('todos');
        todosRef.where('author', '==', author.id).orderBy('priority', 'desc').limit(25).get().then(docs => {

            if (docs.empty) {
                console.log('No matching documents.');
                return;
            }

            let todos = {};

            docs.forEach(doc => {
                todos[doc.id] = doc.data();
            });

            resolve(todos)

        })
            .catch(err => {
                reject(err);
            });

    });

}

function generateEmbedTodos(author, todos) {

    const embedTodos = new Discord.MessageEmbed()
        .setColor('#000')
        .setAuthor(author.username, author.avatarURL())

    for (const key in todos) {
        if (Object.hasOwnProperty.call(todos, key)) {
            const todo = todos[key];
            embedTodos.addField(
                todo.task,
                new Date(todo.createdAt).toLocaleString()
            )
        }
    }
    
    //embedTodos.addField('\u200B','\u200B') //space

    embedTodos.setTimestamp()
    embedTodos.setFooter('Gracias por utilizar qvverBot!', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw9xcHDzRTTeW6nYZRLqj4zjGf1fANmuikBIOczD3OvNi9ST2rj1bAsKxKNSa2tmYZ6g4&usqp=CAU');

    return embedTodos;
}