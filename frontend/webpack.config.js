var webpack = require('webpack');
var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';
var isProduction = nodeEnv === 'production';
var precss = require('precss');
var autoprefixer = require('autoprefixer');

module.exports = {
  devtool: isProduction ? 'hidden-source-map' : 'eval-cheap-module-source-map',

  context: path.join(__dirname, './src'),

  entry: {
    js: './index.js',
    vendor: ['react', 'react-dom', 'redux', 'react-redux']
  },

  output: {
    path: path.resolve(__dirname, '../public/js'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'file',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 }
          },
          {
            loader: 'postcss-loader',
            // options: {
            //   plugins: function() {
            //     return [
            //       require('precss'),
            //       require('autoprefixer')
            //     ];
            //   }
            // }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      },
      {
        test: /\.json$/,
        use: [
          'json-loader'
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    enforceExtension: false,
    modules: [
      path.join(__dirname,  './src'),
      'node_modules'
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js'
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: __dirname,
        postcss: [
          precss,
          autoprefixer
        ]
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      },
      sourceMap: false
    })
  ],

  devServer: {
    contentBase: './static'
  }
};
