const { stonks } = require('./config.json');

async function request() {
	// eslint-disable-next-line no-undef
	const result = await stocks.timeSeries({
		symbol: 'PLTR',
		interval: '1min',
		amount: 10,
	});
	console.log(result);
}

request();