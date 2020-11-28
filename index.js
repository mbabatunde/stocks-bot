// require the discord.js module
const { prefix, token, stonks } = require('./config.json');
const fetch = require('node-fetch');

const Discord = require('discord.js');
const Stocks = require('stocks.js');

// create a new Discord client
const client = new Discord.Client();
const stocks = new Stocks(stonks);

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
		// message.channel.send('PLTR to the 🚀');
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

			console.log(result[0]);
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
});


// login to Discord with your app's token
client.login(token);