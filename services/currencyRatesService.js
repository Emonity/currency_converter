const fetch = require('node-fetch');
const axios = require('axios')
const xml2js = require('xml2js');
require('dotenv').config()

class CurrencyRatesService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.cache = new Map();
    }

    /**
     * Функция для конвертации валют
     * @param amount
     * @param exchangeRate
     * @returns {number}
     */
    async fetchDataFromExchangerate(baseCurrency, targetCurrency) {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY_EXCHANGERATE}/pair/${baseCurrency}/${targetCurrency}`)
        const data = await response.text();
        return data;
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    async fetchDataFromCBR() {
        const response = await fetch('http://www.cbr.ru/scripts/XML_daily.asp');
        const data = await response.text();
        const parsedData = await this.parseXMLData(data);
        return parsedData;
    }

    async fetchDataFromBankOfThailand() {
        const headers = {
            'X-IBM-Client-Id': this.apiKey,
        };
        let today = new Date().toISOString().slice(0,10)
        const response = await fetch(`https://apigw1.bot.or.th/bot/public/Stat-ExchangeRate/v2/DAILY_AVG_EXG_RATE/?start_period=${today}&end_period=${today}`, { headers });
        const data = await response.json();
        return data;
    }

    async parseXMLData(xmlData) {
        const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
        return new Promise((resolve, reject) => {
            parser.parseString(xmlData, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async getCurrencyRates(source) {
        const cacheKey = `${source}_rates`;
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        let data;
        if (source === 'CBR') {
            data = await this.fetchDataFromCBR();
        } else if (source === 'Thailand') {
            data = await this.fetchDataFromBankOfThailand();
        }

        this.cache.set(cacheKey, data);
        return data;
    }
}

module.exports = CurrencyRatesService;