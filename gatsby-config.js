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

    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        query: `
        {
          allSitePage {
            nodes {
              path
            }
          }
          allContentfulBlogPost {
            nodes {
              slug
              updatedAt
            }
          }
        }`,
        resolveSiteUrl: () => 'https://tadeasfort.cz',
        resolvePages: ({
          allSitePage: { nodes: allPages },
          allContentfulBlogPost: { nodes: allContentfulNodes },
        }) => {
          const contentfulNodeMap = allContentfulNodes.reduce((acc, node) => {
            const { slug } = node
            acc[`/${slug}`] = node

            return acc
          }, {})

          return allPages.map((page) => {
            return { ...page, ...contentfulNodeMap[page.path] }
          })
        },
        serialize: ({ path, updatedAt }) => {
          return {
            url: path,
            lastmod: updatedAt,
          }
        },
      },
    },
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
        gtagConfig: {},
        pluginConfig: {
          head: true,
          delayOnRouteUpdate: 0,
        },
      },
    },
  ],
}
