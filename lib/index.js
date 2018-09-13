#!/usr/bin/env node

'use strict';

const meow = require('meow');
const chalk = require('chalk');
const weather = require('./weather');
const key_config = require('./config.json');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');
const pinyin = require('js-pinyin');

pinyin.setOptions({ checkPolyphone: false, charCase: 0 });

const cli = meow(`
Usage
    $ weathercli <input>
Options
    --source, -s Which source would you like? 1: http://www.weather.com.cn/(default) 2:http://www.heweather.com/
    --city, -c City you want check
    --area, -a area you want check.
    --opt, -o the mode selection:  now:today's weather  forecast:then next few days' weather, default: 'now'
    --lang, -l language, en: English, if you ignore this option, it default to Chinese. The source 1 only support Chinese.
    --key, -k key.If you select source 1, please ignore it.
Examples
    $ weathercli -c guangzhou
    $ weathersli -s 2 -a fengtai
`, {
    flags: {
        source: {
            type: 'number',
            alias: 's',
            default: 1
        },
        city: {
            type: 'string',
            alias: 'c'
        },
        area: {
            type: 'string',
            alias: 'a'
        },
        opt: {
            type: 'string',
            alias: 'o',
            default: 'now'
        },
        lang: {
            type: 'string',
            alias: 'l',
            default: ''
        },
        key: {
            type: 'string',
            alias: 'k',
            default: key_config.key
        }
    }
});



// if (!cli.flags.source) {
//     console.log(chalk.bold.red('Please select source!'));
//     process.exit(1);
// }
let wait_for_province = async function() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    await rl.question('It is belong...(上一级地址) \n', (answer) => {
        console.log('Waiting... It is belong(它属于)', answer);
        rl.close();
        let url = 'http://flash.weather.com.cn/wmaps/xml/' + answer + '.xml';
        console.log(url)
        let get = function() {
            return axios.get(url)
                .then(response => {
                    let r = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    var reg = /\<city .*\/\>/g;
                    let cityList = response.data.match(reg);
                    let filterUrl = () => {
                        let code;
                        cityList.forEach((item, index) => {
                            let cityname = /\<city .* cityname=\"(.*?)\"/g.exec(item)[1];

                            if (cityname.substr(-1) === '市' || cityname.substr(-1) === '区' || cityname.substr(-1) === '县') {
                                cityname = cityname.substring(0, cityname.length - 1);
                            }
                            let select = pinyin.getFullChars(cityname).toLowerCase();
                            if (select === cli.flags.city) {
                                code = /\<city .* url=\"(.*?)\"/g.exec(item)[1];
                            } else if (select === cli.flags.area) {
                                code = /\<city .* url=\"(.*?)\"/g.exec(item)[1];
                            }
                        })
                        return code;
                    }

                    let filter_url = 'http://mobile.weather.com.cn/data/forecast/' + filterUrl().trim() + '.html'
                    return axios.get(filter_url);
                }).then((response) => {
                    let data = response.data;
                    let format_data = { "fa": "天气", "fb": "天气2", "fc": "最高温度", "fd": "最低温度", "fe": "风向1", "ff": "风向2", "fg": "风力1", "fh": "风力2", "fi": "日出日落" };
                    let weather_json = {
                        "10": "暴雨",
                        "11": "大暴雨",
                        "12": "特大暴雨",
                        "13": "阵雪",
                        "14": "小雪",
                        "15": "中雪",
                        "16": "大雪",
                        "17": "暴雪",
                        "18": "雾",
                        "19": "冻雨",
                        "20": "沙尘暴",
                        "21": "小到中雨",
                        "22": "中到大雨",
                        "23": "大到暴雨",
                        "24": "暴雨到大暴雨",
                        "25": "大暴雨到特大暴雨",
                        "26": "小到中雪",
                        "27": "中到大雪",
                        "28": "大到暴雪",
                        "29": "浮尘",
                        "30": "扬沙",
                        "31": "强沙尘暴",
                        "53": "霾",
                        "99": "",
                        "00": "晴",
                        "01": "多云",
                        "02": "阴",
                        "03": "阵雨",
                        "04": "雷阵雨",
                        "05": "雷阵雨伴有冰雹",
                        "06": "雨夹雪",
                        "07": "小雨",
                        "08": "中雨",
                        "09": "大雨"
                    };
                    let fx_json = {
                        "0": "无持续风向",
                        "1": "东北风",
                        "2": "东风",
                        "3": "东南风",
                        "4": "南风",
                        "5": "西南风",
                        "6": "西风",
                        "7": "西北风",
                        "8": "北风",
                        "9": "旋转风"
                    };
                    let fl_json = {
                        "0": "微风",
                        "1": "3-4级",
                        "2": "4-5级",
                        "3": "5-6级",
                        "4": "6-7级",
                        "5": "7-8级",
                        "6": "8-9级",
                        "7": "9-10级",
                        "8": "10-11级",
                        "9": "11-12级"
                    };
                    console.log(chalk.bold.yellow('Forecast :'));
                    let location = cli.flags.city || cli.flags.area;
                    console.log(chalk.red(`Location: ${location}, ${data.c.c3}`));

                    data.f.f1.forEach((item, index) => {
                        console.log(chalk.green('=============================================='))
                        console.log(chalk.bold.yellow(`The next ${index + 1} day(s) :`));
                        console.log(chalk.cyan(`${format_data.fa}: ${weather_json[item.fa]} ~ ${weather_json[item.fb]}`));
                        console.log(chalk.cyan(`${format_data.fd}: ${item.fd}`));
                        console.log(chalk.cyan(`${format_data.fc}: ${item.fc}`));
                        console.log(chalk.cyan(`${format_data.fe}: ${fx_json[item.fe]}`));
                        console.log(chalk.cyan(`${format_data.ff}: ${fx_json[item.ff]}`));
                        console.log(chalk.cyan(`${format_data.fg}: ${fl_json[item.fg]}`));
                        console.log(chalk.cyan(`${format_data.fh}: ${fl_json[item.fh]}`));
                        console.log(chalk.cyan(`${format_data.fi}: ${item.fi}`));
                    })

                })
        }
        get().then(() => {
            process.exit(0);
        });

    });
}

if (cli.flags.source === 2) {
    if (!key_config.flag)
        try {
            let file_data = fs.readFileSync(__dirname + '/config.json', 'utf-8');
            if (!file_data.key && !cli.flags.key) {
                console.log('Please input your key! You only need to enter it once. Next time you can ignore it.');
                process.exit(0);
            }
            if (cli.flags.key) {
                let str = JSON.stringify({ key: cli.flags.key, flag: true });
                fs.writeFileSync(__dirname + '/config.json', str);
            }
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    weather.getWeather(cli.flags)
        .then(result => {
            result = JSON.parse(result);
            console.log(chalk.red(`Location: ${result.area}, ${result.city}, ${result.province}`));
            console.log(chalk.blue(`Update-Time: ${result.update_loc}`));
            console.log(chalk.green(`Data:`));
            let dat = JSON.stringify(result.data);
            let data = JSON.parse(dat);
            if (dat.length < 250) {
                console.log(chalk.bold.yellow('Today :'));
                console.log(chalk.cyan(data.cond_txt));
                console.log(chalk.cyan(`temperature(温度): ${data.tmp}`));
                console.log(chalk.cyan(`humidity(湿度): ${data.hum}`));
                console.log(chalk.cyan(`pcpn(降水量): ${data.pcpn}`));
                console.log(chalk.cyan(`vis(能见度): ${data.vis}`));
                console.log(chalk.cyan(`wind_dir(风向): ${data.wind_dir}`));
                console.log(chalk.cyan(`wind_sc(风力): ${data.wind_sc}`));
                console.log(chalk.cyan(`wind_spd(风速): ${data.wind_spd}`));
            } else {
                data.forEach((item, index) => {
                    console.log(chalk.green('=============================================='))
                    console.log(chalk.bold.yellow(`The next ${index + 1} day(s) :`));
                    console.log(chalk.cyan(item.cond_txt));
                    console.log(chalk.cyan(`min-temperature(最低温度): ${item.tmp_min}`));
                    console.log(chalk.cyan(`max-temperature(最高温度): ${item.tmp_max}`));
                    console.log(chalk.cyan(`humidity(湿度): ${item.hum}`));
                    console.log(chalk.cyan(`pcpn(降水量): ${item.pcpn}`));
                    console.log(chalk.cyan(`vis(能见度): ${item.vis}`));
                    console.log(chalk.cyan(`windDir(风向): ${item.wind_dir}`));
                    console.log(chalk.cyan(`windPower(风力): ${item.wind_sc}`));
                    console.log(chalk.cyan(`windState(风速): ${item.wind_spd}`));
                });
            }
            process.exit(0);
        }).catch(error => {
            if (error) {
                console.log(chalk.bold.red(error));
                process.exit(1);
            }
        });
} else if (cli.flags.source === 1) {
    if (!cli.flags.city && !cli.flags.area) {
        console.log(chalk.bold.red('Please select city or area!'));
        process.exit(1);
    }
    if (cli.flags.opt === 'forecast') {
        wait_for_province();
    } else {
        weather.getWeather(cli.flags)
            .then(result => {
                let city = /\<city .* cityname=\"(.*?)\"/g.exec(result)[1];
                let state = /\<city .* stateDetailed=\"(.*?)\"/g.exec(result)[1];
                let min_temp = /\<city .* tem2=\"(.*?)\"/g.exec(result)[1];
                let max_temp = /\<city .* tem1=\"(.*?)\"/g.exec(result)[1];
                let temp_now = /\<city .* temNow=\"(.*?)\"/g.exec(result)[1];
                let windState = /\<city .* windState=\"(.*?)\"/g.exec(result)[1];
                let windDir = /\<city .* windDir=\"(.*?)\"/g.exec(result)[1];
                let windPower = /\<city .* windPower=\"(.*?)\"/g.exec(result)[1];
                let humidity = /\<city .* humidity=\"(.*?)\"/g.exec(result)[1];
                console.log(chalk.bold.yellow('Today :'));
                console.log(chalk.red(`Location: ${cli.flags.city}, ${city}`))
                console.log(chalk.cyan(state));
                console.log(chalk.cyan(`min-temperature(最低温度): ${min_temp}`));
                console.log(chalk.cyan(`max-temperature(最高温度): ${max_temp}`));
                console.log(chalk.cyan(`temperature-now(现在温度): ${temp_now}`));
                console.log(chalk.cyan(`humidity(湿度): ${humidity}`));
                console.log(chalk.cyan(`windDir(风向): ${windDir}`));
                console.log(chalk.cyan(`windPower(风力): ${windPower}`));
                console.log(chalk.cyan(`windState(风速): ${windState}`));
            })
    }
}
