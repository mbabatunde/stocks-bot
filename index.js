// require the discord.js module
const { prefix, token, stonks } = require('./config.json');
const fetch = require("node-fetch");

const Discord = require('discord.js');
const Stocks = require("stocks.js");

// create a new Discord client
const client = new Discord.Client();
const stocks = new Stocks("EWN0BZPDNLMEXIEU");

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('ready!');
});


client.on('message', async(message) => {
	if (message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
	
	if (command === `stonks`) {
		message.channel.send('PLTR to the 🚀');
		let ticker = args[1];
		let result = await stocks.timeSeries({
			symbol: ticker,
			interval: '1min'
		});
		
		let history = result.forEach(item => {
			console.log(item.open);
			console.log(item.close);
			console.log(item.high);
		});

		let open = Number(result[0].open).toFixed(2);
		let close = Number(result[0].close).toFixed(2);
		let high = Number(result[0].high).toFixed(2);
		let low = Number(result[0].low).toFixed(2);

		console.log(typeof(open));

		message.reply(`$${ticker} Trading Info:\nOpening for $${ticker}: ${open}\nClosing for $${ticker}: ${close}\nCurrent High for $${ticker}: ${high}\nCurrent Low for $${ticker}: ${low}`);

		console.log(result[0]);
	} else if (command === 'memes') {
		let type = args[0];
		if (type === 'xkcd') {
			// Currently have 2391 XKCD comics, will need to figure out a way to update on it's own
			let random = Math.floor(Math.random() * 2391) + 1;
			let url = `https://xkcd.com/${random}/info.0.json`
			fetch(url)
			.then(res => res.json())
			.then(json => {
				const embed = new Discord.MessageEmbed()
				.setImage(json.img)
				.setDescription(`XKCD ${random}: ` + json.safe_title)
				message.channel.send(embed);
				// message.channel.send({ files: [json.img]});
			})
			.catch(err => { throw err });
			
		}
		// message.channel.send('WSB is the best!')
	}
});




// login to Discord with your app's token
client.login(token);