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
        url: 'https://g5ij5sea4nhxdh4lfy4ykxpuqq.appsync-api.us-east-2.amazonaws.com/graphql',
        // HTTP headers
        headers:{
          "x-api-key": "da2-to7dcsrdezhv3ev2zkpvapxkgm"
        }
      },
    },
  ],
}
