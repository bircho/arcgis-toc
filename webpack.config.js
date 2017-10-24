const path = require('path');

// Constant with our paths
const paths = {
  DIST: path.resolve(__dirname, 'dist'),
  SRC: path.resolve(__dirname, '.'),
  JS: path.resolve(__dirname, 'src')
};

// Webpack configuration
module.exports = {
  entry: path.join(paths.JS, 'main.js'),
  output: {
    //libraryTarget: 'amd',
    path: paths.DIST,
    filename: 'arcgis-toc.js'
  },
  externals: [/^esri/, /^dijit/],
  devServer: {
    contentBase: paths.SRC,
  }
};