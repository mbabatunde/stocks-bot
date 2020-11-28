// require the discord.js module
const { prefix, token, stonks, finnhubAPI } = require('./config.json');
const fs = require('fs');
const fetch = require('node-fetch');

const Discord = require('discord.js');
const finnhub = require('finnhub');
const Stocks = require('stocks.js');

// create a new Discord client
const client = new Discord.Client();
const stocks = new Stocks(stonks);

// Finnhub API
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = finnhubAPI;
const finnhubClient = new finnhub.DefaultApi();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('ready!');
});


client.on('message', async (message) => {
	if (message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
	// eslint-disable-next-line quotes
	if (command === `stonks`) {
		if (!args.length || args[0] === '-h') {
			const embed = new Discord.MessageEmbed()
				.setTitle('Welcome to the Stonks Bot!')
				.setDescription('This bot will give you some information about a stock, some memes, and more!')
				.attachFiles(['./stonks.jpg'])
				.setThumbnail('attachment://stonks.jpg')
				.addFields(
					{ name: 'List of commands', value: '`-s <STOCK>`\n`!xkcd`\n`-h`', inline: true },
					{ name: 'Description', value: 'Shows stock information (opening, closing, high, and low of the underlying security)\nShows a random xkcd comic\nShows this embed', inline: true },
				);
			message.channel.send(embed);
		}
		else {
			// TODO: handle various arguments
			// for basic stocks information
			const ticker = args[1];

			const result = await stocks.timeSeries({
				symbol: ticker,
				interval: '1min',
			});

			// eslint-disable-next-line no-unused-vars
			const history = result.forEach(item => {
				console.log(item.open);
				console.log(item.close);
				console.log(item.high);
			});

			const open = Number(result[0].open).toFixed(2);
			const close = Number(result[0].close).toFixed(2);
			const high = Number(result[0].high).toFixed(2);
			const low = Number(result[0].low).toFixed(2);

			console.log(typeof (open));

			message.reply(`$${ticker} Trading Info:\nOpening for $${ticker}: \`$${open}\`\nClosing for $${ticker}: \`$${close}\`\nHigh for $${ticker}: \`$${high}\`\nLow for $${ticker}:\`$${low}\``);

			// TODO: Investigate this API further
			finnhubClient.quote(ticker, (error, data) => {
				console.log(data);
				// const open = Number(data.o).toFixed(2);
				// const high = Number(data.h).toFixed(2);
				// const low = Number(data.l).toFixed(2);
				// const current = Number(data.c).toFixed(2);
				// message.reply(`\n\`$${ticker}\` Trading Info:\nCurrent: \`$${current}\`\nOpening: \`$${open}\`\nHigh: \`$${high}\`\nLow:\`$${low}\``);
			});
		}
	}
	else if (command === 'xkcd') {
		// Currently have 2391 XKCD comics, will need to figure out a way to update on it's own
		const random = Math.floor(Math.random() * 2391) + 1;
		const url = `https://xkcd.com/${random}/info.0.json`;
		fetch(url)
			.then(res => res.json())
			.then(json => {
				console.log(json);
				const embed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setImage(json.img)
					.setTitle(`XKCD #${random}: ` + json.safe_title)
					.setURL(`https://xkcd.com/${random}`)
					.setDescription(json.alt)
					.setFooter(`Source: https://xkcd.com/${random}`);
				message.channel.send(embed);
			})
			.catch(err => { throw err; });
	}
	else if (command === 'smbc') {
		console.log('hi');
		// eslint-disable-next-line no-octal
		const date = getDate(new Date(2002, 09, 05), new Date(2015, 03, 03));
		const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
		const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
		const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
		console.log(`${ye}-${mo}-${da}`);
		const url = `https://www.smbc-comics.com/comics/${ye}${mo}${da}.gif`;
		// fetch(url)
		// 	.then(res => res.blob())
		// 	.then(image => {
		// 		// const test = URL.createObjectURL(image);
		// 		console.log(image);
		// 	});
		console.log(url);
		const response = await fetch(url);
		const buffer = await response.buffer();
		fs.writeFile('./image.gif', buffer, () => {
			console.log('finished downloading!');
		});

		const embed = new Discord.MessageEmbed()
			.setColor('#D3D3D3')
			.attachFiles(['./image.gif'])
			.setImage('attachment://image.gif')
			.setTitle('SMBC Comic')
			.setFooter(`Source: https://www.smbc-comics.com/comic/${ye}-${mo}-${da}`);
		message.channel.send(embed);
	}
});

function getDate(start, end) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// login to Discord with your app's token
client.login(token);