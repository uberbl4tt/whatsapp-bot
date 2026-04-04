module.exports = {
  apps : [{
    name: "whatsapp-bot",
    script: "./index.js",
    watch: true,
    watch_delay: 1000,
    ignore_watch : ["node_modules", ".wwebjs_cache", "auth", ".git"],
  }]
}
