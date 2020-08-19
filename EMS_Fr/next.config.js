// npm install --save @zeit/next-sass node-sass
// npm install url-loader --save

const withCss = require('@zeit/next-css')
const withSass = require('@zeit/next-sass')

// fix: prevents error when .css files are required by node
if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {}
}

module.exports = withCss(withSass({
  webpack (config, options) {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      }
    })


    return config
  }
}))
