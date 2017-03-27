/**
 * Main module for sample app.
 */
import * as lychart from '../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import Candlestick = lychart.model.Candlestick;
import { Asset } from './Asset';
import { ChartController } from './ChartController';
import { Settings } from './Settings';
import { Utils } from './Utils';

import * as $ from 'jquery';

class Main {
    private charts: ChartController[] = [];

    public async startup() {

        // Shift sample data to current time
        const now = new Date();
        this.sampleCandles.forEach(c => {
            c.date.setUTCMonth(now.getUTCMonth());
            c.date.setUTCDate(now.getUTCDate());
            c.date.setUTCHours(c.date.getUTCHours() + now.getUTCHours() - 2);
        });

        // Load assets list from server
        let assets: Asset[] = [];
        $.support.cors = true; // Otherwise "no transport" in IE 11.
        await $.ajax({
            method: 'GET',
            dataType: 'json',
            url: Settings.assetsUrl,
            contentType: 'application/json'
        }).then(data => {
            assets = data;
        });

        // Create charts
        const div1 = document.getElementById('container1');
        const div2 = document.getElementById('container2');
        if (!div1 || !div2) {
            console.error('ERROR: container element is not found.');
            return;
        }

        this.charts[0] = new ChartController(div1, 5, 45, assets, 'EURUSD');    // "left" and "top" depend from layout
        this.charts[1] = new ChartController(div2, 240, 45, assets, 'BTCUSD');

        // Define event handlers
        const onresize = () => {
            this.charts[0].resize();
            this.charts[1].resize();
        };

        window.onresize = onresize;
        onresize();
    }

    private sampleCandles: Candlestick[] = [
        new Candlestick(new Date('2017-03-16T02:39:00Z'), 1.05487, 1.05497, 1.05497, 1.05487),
        new Candlestick(new Date('2017-03-16T02:38:00Z'), 1.05495, 1.05506, 1.05506, 1.05495),
        new Candlestick(new Date('2017-03-16T02:37:00Z'), 1.05504, 1.05509, 1.0551, 1.055),
        new Candlestick(new Date('2017-03-16T02:36:00Z'), 1.0551, 1.05512, 1.05513, 1.0551),
        new Candlestick(new Date('2017-03-16T02:35:00Z'), 1.05517, 1.05511, 1.05517, 1.0551),
        new Candlestick(new Date('2017-03-16T02:34:00Z'), 1.05524, 1.05515, 1.05524, 1.05512),
        new Candlestick(new Date('2017-03-16T02:33:00Z'), 1.05532, 1.05527, 1.05532, 1.05527),
        new Candlestick(new Date('2017-03-16T02:32:00Z'), 1.05525, 1.05528, 1.05532, 1.05524),
        new Candlestick(new Date('2017-03-16T02:31:00Z'), 1.05526, 1.05523, 1.05526, 1.05522),
        new Candlestick(new Date('2017-03-16T02:30:00Z'), 1.05527, 1.05527, 1.05527, 1.05522),
        new Candlestick(new Date('2017-03-16T02:29:00Z'), 1.05527, 1.05526, 1.05527, 1.05522),
        new Candlestick(new Date('2017-03-16T02:28:00Z'), 1.05523, 1.05526, 1.05526, 1.05522),
        new Candlestick(new Date('2017-03-16T02:27:00Z'), 1.05512, 1.05522, 1.05522, 1.05506),
        new Candlestick(new Date('2017-03-16T02:26:00Z'), 1.05503, 1.05511, 1.05512, 1.05503),
        new Candlestick(new Date('2017-03-16T02:25:00Z'), 1.05496, 1.05504, 1.05504, 1.05496),
        new Candlestick(new Date('2017-03-16T02:24:00Z'), 1.055, 1.05487, 1.055, 1.05481),
        new Candlestick(new Date('2017-03-16T02:23:00Z'), 1.05491, 1.05497, 1.05497, 1.0549),
        new Candlestick(new Date('2017-03-16T02:22:00Z'), 1.05496, 1.05493, 1.05501, 1.05492),
        new Candlestick(new Date('2017-03-16T02:21:00Z'), 1.05512, 1.05494, 1.05512, 1.05492),
        new Candlestick(new Date('2017-03-16T02:20:00Z'), 1.0549, 1.05507, 1.05507, 1.0549),
        new Candlestick(new Date('2017-03-16T02:19:00Z'), 1.05476, 1.05493, 1.05493, 1.05476),
        new Candlestick(new Date('2017-03-16T02:18:00Z'), 1.0549, 1.05475, 1.05491, 1.05475),
        new Candlestick(new Date('2017-03-16T02:17:00Z'), 1.0549, 1.05489, 1.05491, 1.05489),
        new Candlestick(new Date('2017-03-16T02:16:00Z'), 1.05487, 1.05492, 1.05492, 1.05487),
        new Candlestick(new Date('2017-03-16T02:15:00Z'), 1.05487, 1.05483, 1.05487, 1.05483),
        new Candlestick(new Date('2017-03-16T02:14:00Z'), 1.0548, 1.05486, 1.05487, 1.0548),
        new Candlestick(new Date('2017-03-16T02:13:00Z'), 1.05472, 1.05481, 1.05483, 1.05472),
        new Candlestick(new Date('2017-03-16T02:12:00Z'), 1.05483, 1.05473, 1.05485, 1.05472),
        new Candlestick(new Date('2017-03-16T02:11:00Z'), 1.05465, 1.05476, 1.05476, 1.05465),
        new Candlestick(new Date('2017-03-16T02:10:00Z'), 1.05476, 1.05474, 1.05477, 1.05474),
        new Candlestick(new Date('2017-03-16T02:09:00Z'), 1.05473, 1.05475, 1.05475, 1.05468),
        new Candlestick(new Date('2017-03-16T02:08:00Z'), 1.05473, 1.05474, 1.05481, 1.05472),
        new Candlestick(new Date('2017-03-16T02:07:00Z'), 1.05471, 1.05472, 1.05473, 1.05468),
        new Candlestick(new Date('2017-03-16T02:06:00Z'), 1.05485, 1.05469, 1.05487, 1.05465),
        new Candlestick(new Date('2017-03-16T02:05:00Z'), 1.05475, 1.05486, 1.05491, 1.05475),
        new Candlestick(new Date('2017-03-16T02:04:00Z'), 1.05485, 1.05474, 1.05489, 1.05474),
        new Candlestick(new Date('2017-03-16T02:03:00Z'), 1.05497, 1.05484, 1.05497, 1.05484),
        new Candlestick(new Date('2017-03-16T02:02:00Z'), 1.05495, 1.05492, 1.05495, 1.05488),
        new Candlestick(new Date('2017-03-16T02:01:00Z'), 1.05503, 1.055, 1.05504, 1.05496),
        new Candlestick(new Date('2017-03-16T02:00:00Z'), 1.05496, 1.05504, 1.05504, 1.05493),
        new Candlestick(new Date('2017-03-16T01:59:00Z'), 1.05516, 1.05504, 1.05517, 1.05504),
        new Candlestick(new Date('2017-03-16T01:58:00Z'), 1.0553, 1.05524, 1.05536, 1.0552),
        new Candlestick(new Date('2017-03-16T01:57:00Z'), 1.05531, 1.05529, 1.05537, 1.05527),
        new Candlestick(new Date('2017-03-16T01:56:00Z'), 1.05533, 1.05527, 1.05534, 1.05524),
        new Candlestick(new Date('2017-03-16T01:55:00Z'), 1.05541, 1.05535, 1.05541, 1.05532),
        new Candlestick(new Date('2017-03-16T01:54:00Z'), 1.05547, 1.05544, 1.05547, 1.05541),
        new Candlestick(new Date('2017-03-16T01:53:00Z'), 1.05545, 1.05546, 1.05554, 1.05543),
        new Candlestick(new Date('2017-03-16T01:52:00Z'), 1.05554, 1.05544, 1.05555, 1.05544),
        new Candlestick(new Date('2017-03-16T01:51:00Z'), 1.05527, 1.05557, 1.05557, 1.05527),
        new Candlestick(new Date('2017-03-16T01:50:00Z'), 1.05517, 1.05521, 1.05521, 1.05514),
        new Candlestick(new Date('2017-03-16T01:49:00Z'), 1.05517, 1.05516, 1.05517, 1.0551),
        new Candlestick(new Date('2017-03-16T01:48:00Z'), 1.05511, 1.05518, 1.0552, 1.05511),
        new Candlestick(new Date('2017-03-16T01:47:00Z'), 1.05517, 1.05516, 1.05519, 1.05514),
        new Candlestick(new Date('2017-03-16T01:46:00Z'), 1.05512, 1.05516, 1.05517, 1.05511),
        new Candlestick(new Date('2017-03-16T01:45:00Z'), 1.05508, 1.05513, 1.05515, 1.05507),
        new Candlestick(new Date('2017-03-16T01:44:00Z'), 1.05521, 1.05505, 1.05521, 1.05505),
        new Candlestick(new Date('2017-03-16T01:43:00Z'), 1.05504, 1.05525, 1.05534, 1.05502),
        new Candlestick(new Date('2017-03-16T01:42:00Z'), 1.05494, 1.05501, 1.05503, 1.05491),
        new Candlestick(new Date('2017-03-16T01:41:00Z'), 1.05491, 1.05495, 1.05496, 1.0549),
        new Candlestick(new Date('2017-03-16T01:40:00Z'), 1.05485, 1.0549, 1.0549, 1.05484),
        new Candlestick(new Date('2017-03-16T01:39:00Z'), 1.05486, 1.05484, 1.05489, 1.05484),
        new Candlestick(new Date('2017-03-16T01:38:00Z'), 1.05487, 1.05485, 1.05487, 1.05471),
        new Candlestick(new Date('2017-03-16T01:37:00Z'), 1.05472, 1.05485, 1.05488, 1.05471),
        new Candlestick(new Date('2017-03-16T01:36:00Z'), 1.05482, 1.05471, 1.05482, 1.05471),
        new Candlestick(new Date('2017-03-16T01:35:00Z'), 1.0547, 1.05476, 1.05477, 1.05469),
        new Candlestick(new Date('2017-03-16T01:34:00Z'), 1.05476, 1.05469, 1.05478, 1.05469),
        new Candlestick(new Date('2017-03-16T01:33:00Z'), 1.05479, 1.05477, 1.05483, 1.05476),
        new Candlestick(new Date('2017-03-16T01:32:00Z'), 1.0547, 1.05478, 1.05479, 1.0547),
        new Candlestick(new Date('2017-03-16T01:31:00Z'), 1.05479, 1.05473, 1.05482, 1.0547),
        new Candlestick(new Date('2017-03-16T01:30:00Z'), 1.05466, 1.05476, 1.05476, 1.05466),
        new Candlestick(new Date('2017-03-16T01:29:00Z'), 1.05471, 1.05464, 1.05473, 1.05464),
        new Candlestick(new Date('2017-03-16T01:28:00Z'), 1.05491, 1.05472, 1.05491, 1.05472),
        new Candlestick(new Date('2017-03-16T01:27:00Z'), 1.05482, 1.0549, 1.0549, 1.05482),
        new Candlestick(new Date('2017-03-16T01:26:00Z'), 1.05478, 1.0548, 1.05482, 1.05477),
        new Candlestick(new Date('2017-03-16T01:25:00Z'), 1.05477, 1.05474, 1.05477, 1.05473),
        new Candlestick(new Date('2017-03-16T01:24:00Z'), 1.05476, 1.05475, 1.05479, 1.05471),
        new Candlestick(new Date('2017-03-16T01:23:00Z'), 1.05471, 1.05475, 1.05477, 1.05471),
        new Candlestick(new Date('2017-03-16T01:22:00Z'), 1.05476, 1.05472, 1.05476, 1.05468),
        new Candlestick(new Date('2017-03-16T01:21:00Z'), 1.0547, 1.05475, 1.05476, 1.0547),
        new Candlestick(new Date('2017-03-16T01:20:00Z'), 1.05462, 1.05472, 1.05475, 1.05456),
        new Candlestick(new Date('2017-03-16T01:19:00Z'), 1.05471, 1.05461, 1.05473, 1.05461),
        new Candlestick(new Date('2017-03-16T01:18:00Z'), 1.05473, 1.05472, 1.05473, 1.05465),
        new Candlestick(new Date('2017-03-16T01:17:00Z'), 1.05478, 1.0547, 1.05482, 1.0547),
        new Candlestick(new Date('2017-03-16T01:16:00Z'), 1.05481, 1.05476, 1.05488, 1.05476),
        new Candlestick(new Date('2017-03-16T01:15:00Z'), 1.05474, 1.0548, 1.05483, 1.05474),
        new Candlestick(new Date('2017-03-16T01:14:00Z'), 1.05484, 1.05475, 1.05492, 1.05475),
        new Candlestick(new Date('2017-03-16T01:13:00Z'), 1.05474, 1.05486, 1.05493, 1.05471),
        new Candlestick(new Date('2017-03-16T01:12:00Z'), 1.05469, 1.05475, 1.05477, 1.05467),
        new Candlestick(new Date('2017-03-16T01:11:00Z'), 1.05481, 1.05472, 1.05481, 1.0547),
        new Candlestick(new Date('2017-03-16T01:10:00Z'), 1.05476, 1.05485, 1.05486, 1.05471),
        new Candlestick(new Date('2017-03-16T01:09:00Z'), 1.05485, 1.05475, 1.05485, 1.0547),
        new Candlestick(new Date('2017-03-16T01:08:00Z'), 1.0547, 1.05488, 1.05488, 1.05469),
        new Candlestick(new Date('2017-03-16T01:07:00Z'), 1.05466, 1.05468, 1.05472, 1.05462),
        new Candlestick(new Date('2017-03-16T01:06:00Z'), 1.05484, 1.0547, 1.05492, 1.0547),
        new Candlestick(new Date('2017-03-16T01:05:00Z'), 1.05492, 1.0548, 1.05495, 1.05479),
        new Candlestick(new Date('2017-03-16T01:04:00Z'), 1.05472, 1.05489, 1.05491, 1.05471),
        new Candlestick(new Date('2017-03-16T01:03:00Z'), 1.05461, 1.05461, 1.05461, 1.05454),
        new Candlestick(new Date('2017-03-16T01:02:00Z'), 1.05461, 1.05465, 1.05466, 1.05461),
        new Candlestick(new Date('2017-03-16T01:01:00Z'), 1.05451, 1.05463, 1.05463, 1.0545),
        new Candlestick(new Date('2017-03-16T01:00:00Z'), 1.05435, 1.05452, 1.05452, 1.05435),
        new Candlestick(new Date('2017-03-16T00:59:00Z'), 1.05434, 1.05436, 1.05436, 1.05434),
        new Candlestick(new Date('2017-03-16T00:58:00Z'), 1.05443, 1.05435, 1.05444, 1.05435),
        new Candlestick(new Date('2017-03-16T00:57:00Z'), 1.05432, 1.05433, 1.05433, 1.0543),
        new Candlestick(new Date('2017-03-16T00:56:00Z'), 1.05423, 1.05425, 1.05427, 1.05414),
        new Candlestick(new Date('2017-03-16T00:55:00Z'), 1.05435, 1.05422, 1.05435, 1.05422),
        new Candlestick(new Date('2017-03-16T00:54:00Z'), 1.05417, 1.05434, 1.05434, 1.05417),
        new Candlestick(new Date('2017-03-16T00:53:00Z'), 1.05415, 1.05416, 1.05423, 1.05414),
        new Candlestick(new Date('2017-03-16T00:52:00Z'), 1.05418, 1.05412, 1.05418, 1.05411),
        new Candlestick(new Date('2017-03-16T00:51:00Z'), 1.0543, 1.05426, 1.0543, 1.05421),
        new Candlestick(new Date('2017-03-16T00:50:00Z'), 1.05434, 1.05431, 1.05434, 1.05431),
        new Candlestick(new Date('2017-03-16T00:49:00Z'), 1.0544, 1.05435, 1.0544, 1.05432),
        new Candlestick(new Date('2017-03-16T00:48:00Z'), 1.05442, 1.05439, 1.05442, 1.05436),
        new Candlestick(new Date('2017-03-16T00:47:00Z'), 1.05433, 1.05437, 1.05437, 1.05429),
        new Candlestick(new Date('2017-03-16T00:46:00Z'), 1.05427, 1.05431, 1.05431, 1.05426),
        new Candlestick(new Date('2017-03-16T00:45:00Z'), 1.05424, 1.05426, 1.05436, 1.05424),
        new Candlestick(new Date('2017-03-16T00:44:00Z'), 1.05431, 1.05426, 1.05431, 1.05416),
        new Candlestick(new Date('2017-03-16T00:43:00Z'), 1.05437, 1.05424, 1.05437, 1.05424),
        new Candlestick(new Date('2017-03-16T00:42:00Z'), 1.05442, 1.05441, 1.05444, 1.05437),
        new Candlestick(new Date('2017-03-16T00:41:00Z'), 1.05435, 1.05439, 1.05444, 1.05435),
        new Candlestick(new Date('2017-03-16T00:40:00Z'), 1.0544, 1.05434, 1.0544, 1.05431),
        new Candlestick(new Date('2017-03-16T00:39:00Z'), 1.05435, 1.05446, 1.05447, 1.05431),
        new Candlestick(new Date('2017-03-16T00:38:00Z'), 1.05449, 1.05436, 1.05449, 1.05436),
        new Candlestick(new Date('2017-03-16T00:37:00Z'), 1.05465, 1.0545, 1.05465, 1.05449),
        new Candlestick(new Date('2017-03-16T00:36:00Z'), 1.05455, 1.05469, 1.05469, 1.05451),
        new Candlestick(new Date('2017-03-16T00:35:00Z'), 1.05457, 1.05456, 1.0546, 1.05451),
        new Candlestick(new Date('2017-03-16T00:34:00Z'), 1.05462, 1.05461, 1.05468, 1.05454),
        new Candlestick(new Date('2017-03-16T00:33:00Z'), 1.05457, 1.05453, 1.05458, 1.05451),
        new Candlestick(new Date('2017-03-16T00:32:00Z'), 1.05451, 1.05452, 1.05452, 1.0545),
        new Candlestick(new Date('2017-03-16T00:31:00Z'), 1.0546, 1.05452, 1.05468, 1.05447),
        new Candlestick(new Date('2017-03-16T00:30:00Z'), 1.05461, 1.05456, 1.05463, 1.05447),
        new Candlestick(new Date('2017-03-16T00:29:00Z'), 1.05464, 1.05465, 1.05465, 1.05461),
        new Candlestick(new Date('2017-03-16T00:28:00Z'), 1.05462, 1.0546, 1.05463, 1.0546),
        new Candlestick(new Date('2017-03-16T00:27:00Z'), 1.05461, 1.05465, 1.05465, 1.0546),
        new Candlestick(new Date('2017-03-16T00:26:00Z'), 1.05469, 1.05462, 1.05469, 1.05459),
        new Candlestick(new Date('2017-03-16T00:25:00Z'), 1.05462, 1.05477, 1.05477, 1.05461),
        new Candlestick(new Date('2017-03-16T00:24:00Z'), 1.05482, 1.05465, 1.05482, 1.05461),
        new Candlestick(new Date('2017-03-16T00:23:00Z'), 1.05475, 1.05484, 1.05486, 1.05475),
        new Candlestick(new Date('2017-03-16T00:22:00Z'), 1.05466, 1.05474, 1.05474, 1.05465),
        new Candlestick(new Date('2017-03-16T00:21:00Z'), 1.05484, 1.05465, 1.05484, 1.05462),
        new Candlestick(new Date('2017-03-16T00:20:00Z'), 1.05466, 1.05482, 1.05484, 1.05466),
        new Candlestick(new Date('2017-03-16T00:19:00Z'), 1.05491, 1.0547, 1.05491, 1.05463),
        new Candlestick(new Date('2017-03-16T00:18:00Z'), 1.05468, 1.05492, 1.05493, 1.05466),
        new Candlestick(new Date('2017-03-16T00:17:00Z'), 1.05476, 1.05481, 1.05491, 1.05476),
        new Candlestick(new Date('2017-03-16T00:16:00Z'), 1.05485, 1.0547, 1.05486, 1.05467),
        new Candlestick(new Date('2017-03-16T00:15:00Z'), 1.05464, 1.05488, 1.05488, 1.05464),
        new Candlestick(new Date('2017-03-16T00:14:00Z'), 1.05462, 1.0547, 1.0547, 1.05462),
        new Candlestick(new Date('2017-03-16T00:13:00Z'), 1.05458, 1.05473, 1.05473, 1.05456),
        new Candlestick(new Date('2017-03-16T00:12:00Z'), 1.05453, 1.05457, 1.05459, 1.05453),
        new Candlestick(new Date('2017-03-16T00:11:00Z'), 1.05445, 1.05454, 1.05457, 1.05444),
        new Candlestick(new Date('2017-03-16T00:10:00Z'), 1.05424, 1.05443, 1.05446, 1.05424),
        new Candlestick(new Date('2017-03-16T00:09:00Z'), 1.0542, 1.05422, 1.05425, 1.05418),
        new Candlestick(new Date('2017-03-16T00:08:00Z'), 1.05434, 1.05419, 1.05435, 1.05418),
        new Candlestick(new Date('2017-03-16T00:07:00Z'), 1.05418, 1.05436, 1.05436, 1.05417),
        new Candlestick(new Date('2017-03-16T00:06:00Z'), 1.05417, 1.05419, 1.05433, 1.05417),
        new Candlestick(new Date('2017-03-16T00:05:00Z'), 1.05413, 1.05416, 1.05416, 1.05413),
        new Candlestick(new Date('2017-03-16T00:03:00Z'), 1.05411, 1.05414, 1.05419, 1.05407),
        new Candlestick(new Date('2017-03-16T00:02:00Z'), 1.05416, 1.05414, 1.05417, 1.05414),
        new Candlestick(new Date('2017-03-16T00:01:00Z'), 1.05425, 1.05415, 1.05425, 1.05411),
        new Candlestick(new Date('2017-03-16T00:00:00Z'), 1.05422, 1.05417, 1.05443, 1.05417)
    ];
}

(new Main()).startup();
