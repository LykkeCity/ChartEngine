## Chart Engine

Stock charting library built with [Typescript]https:(//www.typescriptlang.org/) using HTML5 Canvas element for drawing.

### Features

* Dynamically loaded data;
* Price-based chart types;
* Extendable indicators;
* Extendable figures.

#### Chart types

* Candlestick
* Heikin-Ashi
* Hollow
* Line
* Line Break
* Mountain
* OHLC
* Range Bars
* Renko

#### Indicators

* Double Exponential Moving Average
* Exponential Moving Average
* Simple Moving Average
* Smoothed Moving Average
* Triple Exponential Moving Average
* Triangular Moving Average
* Weighted Moving Average
* Aroon Up/Down
* Average Directional Index
* Average True Range
* Bollinger Bands
* Correlation
* Directional Movement Index
* Highest High / Lowest Low
* Historical Volatility
* Ichimoku Kinko Hyo
* Mean Deviation
* Parabolic SAR
* Pivot Points
* Rainbow
* Ratiocator
* Supertrend
* Standard Deviation
* Typical Price
* Aroon Oscillator
* Disparity Index
* Double Smoothed Stochastic
* Fast Stochastic
* Momentum
* Overbought/Oversold
* Rate of Change
* Relative Strength Index
* Slow Stochastic
* William’s %R
* Commodity Channel Index
* Moving Average Convergence/Divergence
* Relative Strength (Levy)

#### Figures

* Curve
* Date Range
* Ellipse
* Fibo Fan
* Fibo Level
* Fibo Projection
* Fibo Time Projection
* Gann Fan
* Horizontal line
* Line
* Path
* Pitchfork
* OHLC Proj
* Rectangle
* Text
* Trend Channel
* Triangle
* Vertical line

### Starting samples locally

```
npm install
gulp build
ws -d ./sample-webserver
http://localhost:8000/demo/index.html
```

### Demo

[Demo](https://chartengine.github.io/)

*Note that demo app uses external resource to get assets data*.
