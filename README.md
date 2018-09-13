# waether-cli

[![NPM](https://nodei.co/npm/weather-ct.png)](https://nodei.co/npm/weather-ct/)

天气预报cli工具(支持中国天气网和和风天气)<br>

该版本可以视为[和风天气](https://github.com/chiwent/weather-hf)的升级版本，引入了中国天气网的源，支持最长7天的天气预报（和风免费用户最多支持3天），并且中国天气网不需要引入开发者key，查询的次数都不限制，这些方面都是优于和风的。不过和风提供的数据类型更多，比如支持能见度，中国天气网不支持。<br>

### 安装
```
npm install -g weather-ct

```

### 参数说明

```
--source / -s : 选择源（1：中国天气网，2：和风天气）,默认是1
--city / -c : 选择目标城市(如果选择了地区可以忽略)
--area / -a : 选择目标地区(如果选择了城市可以忽略)
--opt  / -o : 选择查询的模式，目前有now(今天的天气情况)，forecast(未来天气情况).如果选择了1的源，请忽略now选项.如果选择了2的源，默认是now
--lang / -l : 语言，默认为中文，可忽略。如果选择了1的源，请忽略
--key  / -k : 开发者key，如果在config.json中已经填了可忽略此选项。如果选择了1的源，请忽略。
```

#### 注意事项
在最开始使用和风源的时候，需要在命令行中加入key配置，它只需要配置一次，后续可以省略key<br>
中国天气网输入的地址需要是汉语拼音，和风支持中文汉字<br>
下面的模式无法使用：<br>
```
$ waethercli -a huadu
```
请使用：<br>
```
$ waethercli -c guangzhou（待查询地区的辖区）
```


### demo

#### 中国天气网（1）
```
$ waethercli -c guangzhou
$ waethercli -c guangzhou -o forecast
$ waethercli -a huadu -o forecast
```

#### 和风天气（2）
```js
$ waethercli -c guangzhou
$ waethercli -c guangzhou -o forecast
$ waethercli -a huadu
$ waethercli -a huadu -o forecast
```


#### 补充
两个源都还没有测试过外国和港澳台<br>
中国天气网的的源有两个，一个可以靠位置的拼音来查询，另外一个只能靠位置的编码来查询，并且在部分地区的命名上也没有统一的标准，有些区直接划为了市，有些区把“区”的称号取消了，让人很难受。所以可能在输入部分地区后会有bug<br>

