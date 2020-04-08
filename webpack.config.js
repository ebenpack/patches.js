const webpack = require("webpack");
const path = require("path");

module.exports = (env) => {
    const isProduction = env && env.NODE_ENV === "production";
    const mode = isProduction ? "production" : "development";
    const devtool = isProduction ? false : "inline-source-map";
    return {
        entry: "./src/index.ts",
        target: "web",
        mode,
        devtool,
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "bundle.js",
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {
                                sourceMap: !isProduction,
                            },
                        },
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/])],
    };
};
