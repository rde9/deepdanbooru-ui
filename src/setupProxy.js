const { createProxyMiddleware: proxy } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    proxy('/evaluate', {
      target: 'http://localhost:7500/evaluate',
      changeOrigin: true,
      pathRewrite: { '^/evaluate': '' }
    })
  )
}