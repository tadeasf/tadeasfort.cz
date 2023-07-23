require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: 'Tadeáš Fořt - Portfolio',
    siteUrl: 'https://tadeasfort.cz',
    description:
      'Portfolio of Tadeáš Fořt, a data engineer and web developer from Czech Republic',
  },
  plugins: [
    'gatsby-transformer-sharp',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',
    'gatsby-plugin-image',
    `gatsby-plugin-sitemap`,
    {
      resolve: 'gatsby-source-contentful',
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        host: process.env.CONTENTFUL_HOST,
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // You can add multiple tracking ids and a pageview event will be fired for all of them.
        trackingIds: [
          'G-F6RSXJ59G6', // Google Analytics / GA
          // "AW-CONVERSION_ID", // Google Ads / Adwords / AW
        ],
        gtagConfig: {
          send_page_view: true,
        },
        pluginConfig: {
          head: true,
          delayOnRouteUpdate: 0,
        },
      },
    },
  ],
}
