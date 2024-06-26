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

let prefix = "!";
let botToken = config.BOT_TOKEN;

// Haroku variables
if(process.env.TOKEN || process.env.PREFIX) {
    prefix = process.env.PREFIX;
    botToken = process.env.TOKEN;
}

client.on('ready', () => {
    client.user.setActivity('BOT League', { type: 'COMPETING' });
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

    else if (command === "send") {
        message.channel.send(args[0])
    }

    else if (command === "todos" && args.length === 0) {    
        message.reply('cargando tareas...').then(m => {
            getTodoData(message.author).then(data => {
                
                m.delete();
                
                if(Object.keys(data).length === 0) {
                    message.reply('no hay tareas.');
                    return;
                }

                let embedMessage = generateEmbedTodos(message.author, data);
                
                message.channel.send(embedMessage);
            })
        });
    }

    else if (command === "todos" && args.length > 0) {

        if (args[0] === 'new') {
            let task = args.slice(1, args.length).join(" ");
            db.collection('todos').add({
                author: message.author.id,
                task: task,
                priority: 1,
                createdAt: Date.now()
            }).then(() => {
                message.reply(`${task} se ha añadido correctamente.`);
            })
        }
        else if (args[0] === 'clear') {
            const todosRef = db.collection('todos');
            todosRef.where('author', '==', message.author.id).get().then(docs => {

                const batch = db.batch();
                docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                batch.commit();

                message.reply(`tus tareas se han limpiado correctamente.`);

            })
        }

    }

})

client.login(botToken);

function getTodoData(author) {

    return new Promise((resolve, reject) => {

        const todosRef = db.collection('todos');
        todosRef.where('author', '==', author.id).orderBy('priority', 'desc').limit(25).get().then(docs => {

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