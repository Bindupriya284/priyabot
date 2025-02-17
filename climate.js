const TelegramBot = require("node-telegram-bot-api");

const request = require("request");

const token = "6730503989:AAGA1Z8MP9kFfkWIjTKp7QJzNk10-rU3WTI";

const bot = new TelegramBot(token, { polling: true });
bot.on("polling_error", (err) => console.log(err));

const { NlpManager } = require("node-nlp");

const manager = new NlpManager({ languages: ["en"] });

// Adds the utterances and intents for the NLP
manager.addDocument("en", "goodbye for now", "greetings.bye");
manager.addDocument("en", "bye bye take care", "greetings.bye");
manager.addDocument("en", "okay see you later", "greetings.bye");
manager.addDocument("en", "bye for now", "greetings.bye");
manager.addDocument("en", "i must go", "greetings.bye");
manager.addDocument("en", "hello", "greetings.hello");
manager.addDocument("en", "hi", "greetings.hello");
manager.addDocument("en", "howdy", "greetings.hello");
manager.train();

bot.on("message", function (msg) {
  manager.process("en", msg.text).then((response) => {
    // Get the best intent
    const intent = response.intent;

    if (intent == "greetings.bye") {
      bot.sendMessage(msg.chat.id, "hey byeeeeeee");
    } else if (intent == "greetings.hello") {
      bot.sendMessage(msg.chat.id, "hey welcome to weatherbot");
    }

    bot.onText(/\/city (.+)/, function (msg, match) {
      const city = match[1];
      const chatId = msg.chat.id;
      const query =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&APPID=e64e54b1992f1b87a8e5c0e3316b4583";

      request(query, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          bot
            .sendMessage(chatId, "Looking for details of " + city + "....", {
              parse_mode: "Markdown",
            })
            .then(() => {
              const res = JSON.parse(body);
              const temp = Math.round(parseInt(res.main.temp_min) - 273.15, 2);
              const pressure = Math.round(
                parseInt(res.main.pressure) - 1013.15
              );
              const rise = new Date(parseInt(res.sys.sunrise) * 1000);
              const set = new Date(parseInt(res.sys.sunset) * 1000);

              bot.sendMessage(
                chatId,
                "*" +
                  res.name +
                  " **\nTemperature:" +
                  String(temp) +
                  "°C\nHumidity: " +
                  res.main.humidity +
                  " %\nWeather: " +
                  res.weather[0].description +
                  "\nPressure:" +
                  String(pressure) +
                  "atm\nSunrise: " +
                  rise.toLocaleTimeString() +
                  " \nSunset: " +
                  set.toLocaleTimeString() +
                  " \nCountry:" +
                  res.sys.country
              );
            });
        } else {
          bot.sendMessage(chatId, "city not found");
        }
      });
    });
  });
});
