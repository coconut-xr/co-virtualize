const withPurgeCss = require("next-purgecss")

module.exports =
    withPurgeCss({
        purgeCssPaths: ["pages/**/*", "components/**/*"],
        purgeCss: {
            whitelistPatterns: () => [/^html$/, /^body$/],
        },
    })
