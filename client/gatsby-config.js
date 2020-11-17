/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "Lolly",
        fieldName: "lolly",
        url: "https://q3tnhlvz6jcjfnukr47gnm4gfm.appsync-api.us-east-2.amazonaws.com/graphql",
        // HTTP headers
        headers: {
          "x-api-key": "da2-tws3q5kycbd43ka6mj7imj5gzi"
        }
      },
    },
  ],
}
