var mineflayer = require('mineflayer');
var path = require('path');
const fs = require('fs');
var fetch = require('node-fetch');


let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);


var bot = mineflayer.createBot({
    //session: session,
  host: "gommehd.net", // optional
  //username: "kirbyfan19@gmail.com",
  //password: "Roflwaffle1!",
  //username: "sortaodds@gmail.com", // email and password are required only for
  //password: "Snappleapple1",          // online-mode=true servers
  username: config.mcAcc.split(":")[0],
  password: config.mcAcc.split(":")[1],
  version: "1.8.9"               // false corresponds to auto version detection (that's the default), put for example "1.8.8" if you need a specific version
});
const moment = require('moment');
const Discord = require('discord.js');
const client = new Discord.Client();
client.login(config.token);

let assert = require('assert');
let pythonBridge = require('python-bridge');

let python = pythonBridge({python: 'python3'});

python.ex`import urllib.request`;
python.ex`from bs4 import BeautifulSoup`;
python.ex`import requests`;
python.ex`
    def getScore(name):
        url = 'https://www.gommehd.net/player/index?playerName='+name
        response = requests.get(url)

        soup = BeautifulSoup(response.text, "html.parser")
        gungame = soup.find("div", {"id": "gungame"})
        score = gungame.find('span', attrs={'class': 'score'})
        return score.text
`;

var spawn = require('child_process').spawn,
py = spawn('python3', ['sync-text.py']);
py.stdout.on('error', err => console.log(err));
py.stdout.on('data', function(data) {

    // Coerce Buffer object to Float
    let buff = Buffer.from(data.toString(), 'base64');
    let text = buff.toString('utf-8');
    console.log(text);
    bot.chat(text);
});

bot.once('login', () => {
	console.log("Bot is eingeloggt");
	console.log(bot.username);
	})
bot.once('spawn', () => {
		console.log("Bot befindet sich im auf Gommehd.net")
})



bot.on('message', function(jsonMsg, username) {
  if (username === bot.username) return;
  try {
  console.log(jsonMsg.extra[1].text);
  if (jsonMsg.extra[1].text === 'Clans'){
    message = jsonMsg.text;
    console.log((jsonMsg.extra[jsonMsg.extra.length - 1].text).split(" ")[1]);
    if (jsonMsg.extra[jsonMsg.extra.length - 1].text.includes(".nh")){
        var i = 0;
        var time;
        bot.chat("processing...");
        getUUID((jsonMsg.extra[jsonMsg.extra.length - 1].text).split(" ")[1])
        .then(uuid => getNameHistory(uuid))
        .then(names => (names).forEach(function(value){
            i++;
            bot.chat("/cc "+ i + ": "+value.name);
        }));

    }
    if (jsonMsg.extra[jsonMsg.extra.length - 1].text.includes(".kills")){
        var name = (jsonMsg.extra[jsonMsg.extra.length - 1].text).split(" ")[1]
        python`getScore(${name})`.then(x => bot.chat("/cc "+x));

    }
    if (jsonMsg.extra[3].text === "Carthartt") return;
    console.log(jsonMsg.extra);
    const channel = client.channels.get("name", "sync-text")
    const embed = new Discord.RichEmbed()
          .setTitle(jsonMsg.extra[jsonMsg.extra.length - 1].text)
          .setColor(0xFF0000);
       console.log(embed);
    getUUID(username)
            .then(uuid => client.channels.get(config.channelID).createWebhook(jsonMsg.extra[3].text, "https://mc-heads.net/avatar/"+ jsonMsg.extra[3].text)
                .then(h => {
                    if (jsonMsg.extra[4].text === ": "){
                        h.send(jsonMsg.extra[jsonMsg.extra.length - 1].text);
                    }
                    else{
                        if ( jsonMsg.extra[jsonMsg.extra.length - 1].text === "online"){
                            h.send({"embeds": [{"title": jsonMsg.extra[jsonMsg.extra.length - 1].text, "color": 3066993}]});
                        }
                        else if ( jsonMsg.extra[jsonMsg.extra.length - 1].text === "offline" ){
                            h.send({"embeds": [{"title": jsonMsg.extra[jsonMsg.extra.length - 1].text, "color": 15158332}]});
                        }
                        else{
                            h.send({
                                "embeds": [{
                                    "title": jsonMsg.extra[jsonMsg.extra.length - 1].text,
                                }]
                             });
                        }
                    }
                    return h;
                })
                .then(h => h.delete()));
    message = jsonMsg.extra[3].text + ":" + jsonMsg.extra[jsonMsg.extra.length - 1].text;
    console.log(message);

  }
  }
  catch(err) {
    //console.log(err);
  }
});

function getUUID(name) {
    return fetch("https://mc-heads.net/minecraft/profile/" + name, {
        method: "GET",
    }).then(response => response.json())
    .then(res => res.id);
}

function getNameHistory(uuid) {
    return fetch("https://mc-heads.net/minecraft/profile/" + uuid, {
        method: "GET",
    }).then(response => response.json())
    .then(res => res.name_history);
}

/*
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat("hi");
});
*/