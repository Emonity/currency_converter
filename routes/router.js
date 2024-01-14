require('dotenv').config()

const Router = require('express')
const router = new Router()
const authenticateToken = require("../controllers/authController")
const jwt = require("jsonwebtoken");
const CurrencyRatesService = require('../services/currencyRatesService');
const currencyRatesService = new CurrencyRatesService(process.env.API_KEY); // Создаем экземпляр сервиса с указанием API ключа для ЦБ Таиланда
const secretKey = process.env.SECRET_KEY; // ключ для токена

/**
 * Создадим моковые данные для авторизации
 */
const users = [
    {username: 'user1', password: '123'},
    {username: 'user2', password: '123'}
];

/**
 * Функция для конвертации валют
 * @param amount
 * @param exchangeRate
 * @returns {number}
 */
function convertCurrency(amount, exchangeRate) {
    amount.match(/,/) ? amount = amount.replace(/,/, ".") : amount
    exchangeRate.match(/,/) ? exchangeRate = exchangeRate.replace(/,/, ".") : exchangeRate
    return amount * exchangeRate;
}

// Роут для авторизации
router.post('/login', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const accessToken = jwt.sign(user, secretKey, {expiresIn: '3h'});
        res.json({accessToken: accessToken});
    } else {
        res.status(401).json({error: 'Неудачная авторизация'});
    }
});

// Роут для получения списка курсов ЦБ определенной страны
router.get('/currency-rates/:country', authenticateToken, async (req, res) => {
    const country = req.params.country;
    let source = 'CBR'; // Устанавливаем ЦБ России в качестве источника данных по умолчанию
    if (country.toLowerCase() === 'thailand') {
        source = 'Thailand'; // Если указана Таиланд, устанавливаем ЦБ Таиланда в качестве источника данных
    }
    try {
        const rates = await currencyRatesService.getCurrencyRates(source);
        res.json(rates);
    } catch (error) {
        res.status(500).json({error: 'Не удалось получить курсы валют.'});
    }
});

// Роут для конвертации валюты из одной в другую
router.get('/convert-currency', authenticateToken, async (req, res) => {
    console.log(req)
    const baseCurrency = req.query.baseCurrency;
    const targetCurrency = req.query.targetCurrency;
    console.log("baseCurrency: ", baseCurrency, "targetCurrency: ", targetCurrency)

    try {
        const rates = await currencyRatesService.fetchDataFromExchangerate(baseCurrency, targetCurrency);
        res.json({ result: JSON.parse(rates) }); // Возвращаем результат конвертации
    } catch (error) {
        res.status(500).json({error: 'Не удалось конвертировать валюту'});
    }
});

module.exports = router