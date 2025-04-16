module.exports = {
  apps: [
    {
      name: "html-converter-auth-service",
      script: "src/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        MONGO_URI: "mongodb+srv://devris:90fUoNDp096uz28Q@cluster0.aqcp6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        JWT_SECRET: "5797d5a76c0d936864b521cef74cd45de0e4aafe83c3480d21b2baf83687e294"
      },
      env_production: {
        MONGO_URI: "mongodb+srv://devris:90fUoNDp096uz28Q@cluster0.aqcp6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        JWT_SECRET: "5797d5a76c0d936864b521cef74cd45de0e4aafe83c3480d21b2baf83687e294"
      }
    }
  ]
};

