'use strict';

const envconfig = () => {

	return (process.env.ENV && process.env.ENV === 'production') ? {
		api: {
			port: 3100,
		},
		mongo: {
			dbName: 'currency-api',
		},
	} : {
		api: {
			port: 3101,
		},
		mongo: {
			dbName: 'currency-api',
		},
	};

}


module.exports = envconfig();
