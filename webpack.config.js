const path = require("path");

module.exports = {
  entry: {
    main: "./scripts/app.js",
    signup: "./scripts/signup.validator.js",
    users: "./scripts/users.js"
  },
  output: {
    filename: "bundle-[name].js",
    path: path.resolve(__dirname, "public/js/"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
         use: {
          // `.swcrc` can be used to configure swc
             loader: "swc-loader"
         }
      }
    ],
 },
};