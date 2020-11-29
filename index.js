// require the discord.js module
const { prefix, token, stonks, finnhubAPI, iex } = require('./config.json');
const fs = require('fs');
const fetch = require('node-fetch');

const Discord = require('discord.js');
const finnhub = require('finnhub');
const Stocks = require('stocks.js');
const algotrader = require('algotrader');

// create a new Discord client
const client = new Discord.Client();
const stocks = new Stocks(stonks);
const Data = algotrader.Data;
const Algorithm = algotrader.Algorithm;

const IEX = Data.IEX;

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
		if (!args.length || args[0] === '-h' || args[0] === '-help') {
			const embed = new Discord.MessageEmbed()
				.setTitle('Welcome to the Stonks Bot!')
				.setDescription('This bot will give you some information about a stock, some memes, and more!')
				.attachFiles(['./stonks.jpg'])
				.setThumbnail('attachment://stonks.jpg')
				.addFields(
					{ name: '`!stonks <STOCKS>`', value: 'Shows stock information (opening, closing, high, and low of an underlying security)' },
					{ name: '`!stonks -h | -help`', value: 'Brings you this embed' },
					{ name: '`!xkcd`', value: 'Shows a random xkcd comic' },
					{ name: '`!smbc`', value: 'Shows a random SMBC comic' },
				);
			message.channel.send(embed);
		}
		else {
			// TODO: handle various arguments
			// for basic stocks information
			const ticker = args[0];

			// const result = await stocks.timeSeries({
			// 	symbol: ticker,
			// 	interval: '1min',
			// 	amount: 1,
			// });

			// // eslint-disable-next-line no-unused-vars
			// const history = result.forEach(item => {
			// 	// console.log(item.open);
			// 	// console.log(item.close);
			// 	// console.log(item.high);
			// });

			// const open = Number(result[0].open).toFixed(2);
			// const close = Number(result[0].close).toFixed(2);
			// const high = Number(result[0].high).toFixed(2);
			// const low = Number(result[0].low).toFixed(2);

			// console.log(typeof (open));

			// message.reply(`$${ticker} Trading Info:\nOpening for $${ticker}: \`$${open}\`\nClosing for $${ticker}: \`$${close}\`\nHigh for $${ticker}: \`$${high}\`\nLow for $${ticker}:\`$${low}\``);

			// TODO: Investigate this API further
			finnhubClient.quote(ticker, (error, data) => {
				console.log(data);
				const open = thousands_separators(Number(data.o).toFixed(2));
				const high = thousands_separators(Number(data.h).toFixed(2));
				const low = thousands_separators(Number(data.l).toFixed(2));
				const current = thousands_separators(Number(data.c).toFixed(2));
				const url = `https://cloud.iexapis.com/v1/stock/${ticker}/logo?token=${iex}`;
				fetch(url, {
					headers: {
						method: 'GET',
						'Content-Type': 'application/json',
					},
				}).then(resp => {
					if (resp.ok) {
						resp.json().then(json => {
							const imageURL = json.url;
							const embed = new Discord.MessageEmbed()
								.setColor('#D3D3D3')
								.setTitle(`$${ticker} Info`)
							// .attachFiles(['./stonks.jpg'])
								.setThumbnail(imageURL)
								.addFields(
								// { name: 'Price Info', value: '**Current:**\nOpened:\nHigh:\nLow:\n', inline: true },
								// { name: 'Description', value: `\`$${current}\`\n\`$${open}\`\n\`$${high}\`\n\`$${low}\``, inline: true },
									{ name: 'Company Name', value: '**TODO**' },
									{ name: 'Current', value: `**$${current}**`, inline: true },
									{ name: 'Opening', value: `**$${open}**`, inline: true },
									{ name: 'High', value: `**$${high}**`, inline: true },
									{ name: 'Low', value: `**$${low}**`, inline: true },
								);
							message.reply(embed);
						});
					}
				});
			});

			// IEX.getQuote(ticker).then(quote => {
			// console.log('IEX');
			// console.log(quote.price);
			// const res = quote.price;

			// const open = thousands_separators(Number(res.open).toFixed(2));
			// const high = thousands_separators(Number(res.high).toFixed(2));
			// const low = thousands_separators(Number(res.low).toFixed(2));
			// const current = thousands_separators(Number(res.last).toFixed(2));

			// const url = `https://cloud.iexapis.com/v1/stock/${ticker}/logo?token=${iex}`;
			// fetch(url, {
			// 	headers: {
			// 		method: 'GET',
			// 		'Content-Type': 'application/json',
			// 	},
			// }).then(resp => {
			// 	if (resp.ok) {
			// 		resp.json().then(json => {
			// 			const imageURL = json.url;
			// 			const embed = new Discord.MessageEmbed()
			// 				.setColor('#D3D3D3')
			// 				.setTitle(`$${ticker} Info`)
			// 				// .attachFiles(['./stonks.jpg'])
			// 				.setThumbnail(imageURL)
			// 				.addFields(
			// 					// { name: 'Price Info', value: '**Current:**\nOpened:\nHigh:\nLow:\n', inline: true },
			// 					// { name: 'Description', value: `\`$${current}\`\n\`$${open}\`\n\`$${high}\`\n\`$${low}\``, inline: true },
			// 					{ name: 'Company Name', value: '**TODO**' },
			// 					{ name: 'Current', value: `**$${close}**`, inline: true },
			// 					{ name: 'Opening', value: `**$${open}**`, inline: true },
			// 					{ name: 'High', value: `**$${high}**`, inline: true },
			// 					{ name: 'Low', value: `**$${low}**`, inline: true },
			// 				);
			// 			message.reply(embed);
			// 		});
			// 	}
			// });
			// });
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

// Courtesy of w3: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-39.php
function thousands_separators(num) {
	const num_parts = num.toString().split('.');
	num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return num_parts.join('.');
}

// login to Discord with your app's token
client.login(token);