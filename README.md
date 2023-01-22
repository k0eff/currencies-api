
# Currency API

Currency API provides an interface to query latest currency pairs, emitted by various banks. The service downloads data from a bank, stores it in MongoDB and provides a restful interface for easy querying. 
The only currently supported bank is ECB (European Central Bank) in both historic and daily mode.

# Usage

## Run at localhost

1. **Cd to a project container dir**
2. **Clone the project**
3. **Cd to the project dir**
4. **Make sure you have Mongo installed and running on localhost**
5. **Edit the main config**
```javascript 
// config/config.js

module.exports  = {
	api: {
		port:  3101,
	},
	mongo: {
		dbName:  'currency-api',
	},
};
```
6. **Start the service**
> $ pm2 start currencies-api


7. **Import historical data**
> $ node bin/cli.js sync ecb historic

8. **Add a cronjob**
In order to have daily updates you must add a cronjob.

$ vim /et	c/crontab 
3 17 * * * node [**full path**]/bin/cli.js sync ecb historic

Note: Data in ECB is updated every day at 16:00 CET. The given example makes sense for EEST. 

6. **Query the API** 

The format is as follows:
[server] **:** [port] **/** exchange **/** [currency name] **/** [amount] **/** [date] **?** rounding=4

* Currency name: currently supported currencies are the currencies exported from ECB: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

* Amount: Numbers such as Ints and Decimals with precision up to 2 are supported

* Date: ISO 8601 date

* Query params: 
* * rounding - decimal.js rounding mode for the output data: https://mikemcl.github.io/decimal.js/#modes . Default is 4 (ROUND_HALF_UP)



> GET http://localhost:3101/exchange/bgn/1.97/2019-07-21


## Deploy

1. Create a new deployment config or edit the preset one: 
> vim stage.ecosystem.json5

2. Run the deployment script:
> pm2 deploy stage.ecosystem.json5 stage


