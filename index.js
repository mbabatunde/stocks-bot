// require the discord.js module
require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');

const Discord = require('discord.js');
const finnhub = require('finnhub');
const Stocks = require('stocks.js');
const algotrader = require('algotrader');
const snoowrap = require('snoowrap');
const NewsAPI = require('newsapi');
const { default: News } = require('finnhub/dist/model/News');

// create a new Discord client
const client = new Discord.Client();
const stocks = new Stocks(process.env.STONKS);
const Data = algotrader.Data;
const Algorithm = algotrader.Algorithm;

const IEX = Data.IEX;

// Finnhub API
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINNHUB;
const finnhubClient = new finnhub.DefaultApi();

// Reddit API
const r = new snoowrap({
	userAgent: 'discord-bot',
	clientId: process.env.REDDITCLIENTID,
	clientSecret: process.env.REDDITCLIENTSECRET,
	username: process.env.REDDITUSERNAME,
	password: process.env.REDDITPASSWORD,
});

// News API
const newsapi = new NewsAPI(process.env.NEWS);


// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('ready!');
	client.user.setActivity('$PLTR 🚀🌕', { type: 'WATCHING' });
});


client.on('message', async (message) => {
	if (message.author.bot) return;
	const args = message.content.slice(process.env.PREFIX.length).trim().split(' ');
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
					{ name: '`!stonks <STOCK>`', value: 'Shows stock information (opening, closing, high, and low of an underlying security)' },
					{ name: '`!stonks -h | -help`', value: 'Brings you this embed' },
					{ name: '`!xkcd`', value: 'Shows a random xkcd comic' },
					{ name: '`!smbc`', value: 'Shows a random SMBC comic' },
					{ name: '`!reddit <SUBREDDIT>`', value: 'Gives a random top 25 post from a particular subreddit (dankmemes, funny, prequelmemes, etc.)' },
					{ name: '`!wsb` ', value: 'WSB reminder' },
					{ name: '`!news`', value: 'Shows the top 10 trending news articles from various sources' }
				);
			message.channel.send(embed);
		}
		else {
			// TODO: handle various arguments
			// for basic stocks information
			const ticker = args[0].toUpperCase();

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
			finnhubClient.quote(ticker, (error, data, response) => {
				if (response.text) {
					let open = Number(JSON.parse(response.text).o).toFixed(2);
					let high = Number(JSON.parse(response.text).h).toFixed(2);
					let low = Number(JSON.parse(response.text).l).toFixed(2);
					let current = Number(JSON.parse(response.text).c).toFixed(2);
					// What it previously closed
					let prev = Number(JSON.parse(response.text).pc).toFixed(2);
					const percentage = stockPercentage(current, prev);

					const testURL = 'https://api.iextrading.com/1.0/ref-data/symbols';
					// this is returning all symbols on common stocks
					// need to create a search algorithm to quickly find the correct symbol
					// fetch(testURL).then(resp => resp.json()).then(json => {
					// 	console.log(json);
					// });
					const url = `https://cloud.iexapis.com/v1/stock/${ticker}/logo?token=${process.env.IEX}`;
					fetch(url, {
						headers: {
							method: 'GET',
							'Content-Type': 'application/json',
						},
					}).then(resp => {
						if (resp.ok) {
							resp.json().then(json => {
								const imageURL = json.url;

								open = thousands_separators(open);
								high = thousands_separators(high);
								low = thousands_separators(low);
								current = thousands_separators(current);
								prev = thousands_separators(prev);

								const embed = new Discord.MessageEmbed()
									.setColor('#D3D3D3')
									.setTitle(`$${ticker} Info`)
								// .attachFiles(['./stonks.jpg'])
									.setThumbnail(imageURL)
									.addFields(
										// { name: 'Price Info', value: '**Current:**\nOpened:\nHigh:\nLow:\n', inline: true },
										// { name: 'Description', value: `\`$${current}\`\n\`$${open}\`\n\`$${high}\`\n\`$${low}\``, inline: true },
										// eslint-disable-next-line quotes
										{ name: `__Current__`, value: `**$${current}**`, inline: true },
										// eslint-disable-next-line quotes
										{ name: `__Trend__`, value: `**${percentage}**`, inline: true },
										// eslint-disable-next-line quotes
										{ name: `__Opening__`, value: `**$${open}**`, inline: true },
										// eslint-disable-next-line quotes
										{ name: `__High__`, value: `**$${high}**`, inline: true },
										// eslint-disable-next-line quotes
										{ name: `__Low__`, value: `**$${low}**`, inline: true },
										// eslint-disable-next-line quotes
										{ name: `__Previously Closed__`, value: `**$${prev}**`, inline: true },
									);
								message.channel.send(embed);
							});
						}
					});
				}
				else {
					message.channel.send('Finnhub API is not working correctly at this time');
				}
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
	else if (command === 'autist' | command === 'wsb') {
		const embed = new Discord.MessageEmbed()
			.setColor('#e63946')
			.attachFiles(['./wsbmascot.gif'])
			.setImage('attachment://wsbmascot.gif')
			.setTitle('You browse WSB and gamble?')
			.setDescription('Congrats you\'re an autist like the rest of WSB!')
			// eslint-disable-next-line quotes
			.setFooter(`Remember: $PLTR and other tech IPOs are the way (Not financial advice - **SEC nearby**)`);
		if (args[1]) {
			const user = getUserFromMention(args[1]);
			return message.channel.send(`${user.tag}: ${embed}`);
		}
		return message.reply(embed);
	}
	else if (command === 'reddit') {
		const sub = args[0];
		const topRes = await r.getSubreddit(sub).getTop({ time: 'day' });
		if (topRes) {
			// issue with surrealmemes subreddit
			// TODO: investigate other subreddits
			let randomNumber = getRandomInt(0, 24);
			if (sub === 'surrealmemes') {
				randomNumber = getRandomInt(0, 4);
			}
			const item = topRes[randomNumber];
			console.log(item.permalink);
			console.log(item.author.name);
			item.score = thousands_separators(item.score);
			if (!item.link_flair_text) {
				item.link_flair_text = 'No link flair for this post';
			}
			const embed = new Discord.MessageEmbed()
				.setColor('#06B253')
				.setImage(item.url_overridden_by_dest)
				.setTitle(item.subreddit_name_prefixed + ': ' + item.title)
				.setDescription('Score: ' + item.score + '\n' + item.link_flair_text)
				.setURL('https://old.reddit.com' + item.permalink)
				.setFooter('Courtesy of u/' + item.author.name);
			message.channel.send(embed);
		}
		else {
			message.reply('Please give a proper subreddit name to use this command');
		}
	}
	else if (command === 'news') {
		// eslint-disable-next-line prefer-const
		let orgs = 'bbc-news, bloomberg, the-wall-street-journal';
		if (args[0]) {
			// eslint-disable-next-line no-shadow
			const orgs = args[0].toLocaleLowerCase();
			console.log(orgs);
		}
		newsapi.v2.topHeadlines({
			sources: orgs,
		}, {
			noCache: true,
		}).then(resp => {
			console.log(resp);
			const articles = resp.articles.slice(0, 10);
			const embed = new Discord.MessageEmbed()
				.setColor('#996E3E')
				.setTitle('News for Today')
				.setFooter('From News API: https://newsapi.org/');
			articles.forEach((entry, i) => {
				const index = i + 1;
				const title = index + '.) ' + entry.title;
				embed.addFields({ name: `**${title}**`, value: entry.url });
			});
			message.channel.send(embed);
		});
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

function stockPercentage(closed, prev) {
	const change = Number(((closed - prev) / prev) * 100).toFixed(2);
	return change < 0 ? `📉 ${change}%` : `📈 +${change}%`;
}

// Discord.js documentation code
function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

// Stack Overflow
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// login to Discord with your app's token
client.login();