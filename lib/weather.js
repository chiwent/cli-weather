'use strict';

const axios = require('axios');
const key_config = require('./config.json');
const readline = require('readline');



const API2 = 'https://free-api.heweather.com/s6/weather';
const API1 = 'http://mobile.weather.com.cn/data/sk/';
let city_api = 'http://flash.weather.com.cn/wmaps/xml/';


module.exports = {
    getWeather: (flags) => {
        return new Promise((resolve, reject) => {
            let source = flags.source;
            let city;
            let area;
            if (source === 2) {
                city = flags.city;
                area = flags.area;
                let location;

                location = area || city;
                let opt = flags.opt;
                let lang = flags.lang || 'zh';
                let key = flags.key || key_config.key;
                let final_api;
                if (!location) {
                    return reject(new Error('missing location'))
                }
                if (!key) {
                    return reject(new Error('missing key, website: https://www.heweather.com/douments/api/'))
                }
                if (lang) {
                    final_api = `${API2}/${opt}/?location=${location}&lang=${lang}&key=${key}`
                } else {
                    final_api = `${API2}/${opt}/?location=${location}&key=${key}`
                }
                final_api = encodeURI(final_api);
                axios.get(final_api)
                    .then(response => {
                        let datas;
                        let basic = response.data.HeWeather6[0].basic;
                        let update = response.data.HeWeather6[0].update;
                        if (response.data.HeWeather6[0].now) {
                            datas = response.data.HeWeather6[0].now;
                        } else if (response.data.HeWeather6[0].daily_forecast) {
                            datas = response.data.HeWeather6[0].daily_forecast;
                        }
                        let result = JSON.stringify({ "area": basic.location, "city": basic.parent_city, "province": basic.admin_area, "update_loc": update.loc, "data": datas });
                        resolve(result);
                    })
                    .catch(error => reject(error));
            } else if (source === 1) {
                city = flags.city;
                let cityList;
                city_api = city_api + city + '.xml';
                if (flags.opts !== 'forecast') {

                    let get = function() {
                        return new Promise((resolve) => {
                            axios.get(city_api)
                                .then(response => {
                                    var reg = /\<city .*\/\>/g;
                                    cityList = response.data.match(reg);
                                    cityList.forEach((item, index) => {
                                        console.log(index + 1, /\<city .* cityname=\"(.*?)\"/g.exec(item)[1])
                                        resolve();
                                    });
                                });
                            console.log('Waiting...')
                        })
                    }
                    get().then(() => {
                            let rl = readline.createInterface({
                                input: process.stdin,
                                output: process.stdout
                            });
                            let final_city = rl.question('What is your choice(index)?(你选择第几项?) \n', (answer) => {
                                console.log('Your choice is(你选的是): ', answer);
                                rl.close();
                                resolve(cityList[answer - 1]);
                            });
                        })
                        .catch(error => reject(error));
                }

            }
        });
    }
}