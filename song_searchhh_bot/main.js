const youtubedl = require('ytdl-core');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
const puppeteer = require('puppeteer');
const { Telegraf } = require('telegraf');


let bot_token = '<your_telegram_bot_token>'


const bot = new Telegraf(bot_token);
bot.command('start', ctx => {
    console.log(ctx.update.message.text)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Send me any song name...', {
    })
})
bot.help((ctx) => ctx.reply('Send me a song name...'));
bot.hears('hi', (ctx) => ctx.reply('Hi there!'));
bot.hears('hey', (ctx) => ctx.reply('Hey there!'));
bot.hears('hello', (ctx) => ctx.reply('Hello there!'));
bot.on('text', (ctx) => {
    let text = ctx.update.message.text;
    if (text.includes('https://yout')) {
        downloadMp3(text, ctx);
    }
    else {
        run(text, ctx);
    }
    ctx.reply('Wait... I am searching for ' + text);
})
bot.launch();
// function form download song and send song on bot
function downloadMp3(id, bot, sonName) {
    if (id.includes("https://you")) {
        var url = id;
        var sonName = 'audio';
    }
    else {
        var url = 'https://youtu.be/' + id;
    }
    bot.reply(url)
    var stream = youtubedl(url);
    // console.log(stream)
    // youtubedl(url)
    //   .pipe(fs.createWriteStream(sonName+'.mp4'));
    var proc = ffmpeg({ source: stream });


    proc.setFfmpegPath(ffmpegPath);
    proc.withAudioCodec('libmp3lame')
        .toFormat('mp3')
        .output(fs.createWriteStream(sonName + '.mp3'))
        .run();
    proc.on('end', function () {
        console.log(sonName + '.mp3 saved locally \n');
        bot.replyWithAudio({ source: './' + sonName + '.mp3' });
        console.log(sonName + '.mp3 sent \n');
        setTimeout(() => {
            fs.unlinkSync('./' + sonName + '.mp3');
            console.log(sonName + '.mp3 removed from local storage \n');
        }, 2000);
        // bot.replyWithVideo({ source: sonName+'.mp4' });
        //setTimeout(() => {
        //fs.unlinkSync('./' + sonName + '.mp4');
        //console.log(sonName + '.mp4 removed from local storage \n');
        //}, 3000);
    })
}
// function for find song 
async function run(song, bot) {
    let browser;
    if (browser) {
        console.log("browser is opened");
    }
    else {
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/brave-browser'
        });
    }
    const page = await browser.newPage();
    let url = 'https://www.youtube.com/results?search_query=' + song;
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url);
    const href = await page.$eval(".ytd-video-renderer a#video-title", (elm) => elm.href);
    let arr = href.split("=");
    let id = arr[1];
    downloadMp3(id, bot, song);
    let urls = ["https://www.google.com/search?q=" + song + "%20spotify", "https://www.google.com/search?q=" + song + "%20jio%20savan", "https://www.google.com/search?q=" + song + "%20ganna", "https://www.google.com/search?q=" + song + "%20whynk"];
    for (let i = 0; i < urls.length; i++) {
        await page.goto(urls[i]);
        await page.waitForTimeout(500);
        const h3 = await page.$eval("#search .yuRUbf h3", (elm) => elm.innerHTML);
        let sonng = song.split(" ");
        // console.log(sonng[0] + "  =======>>>>>  " + h3);
        if (h3.toLowerCase().includes(sonng[0].toLowerCase())) {
            const href = await page.$eval("#search .yuRUbf a:first-child", (elm) => elm.href);
            // console.log(href);
            bot.reply(href);
        }
        else {
            // console.log(h3);
        }
    }
    console.log("linkes sent");
    browser.close();
}

