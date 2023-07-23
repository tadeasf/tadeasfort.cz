# My website to showcase how good a dev I actually am

This website is a showcase of my development capabilities. Originally based on
this [gatsby starter](https://github.com/contentful/starter-gatsby-blog).
This site has been heavily customized to include additional features,
demonstrating my proficiency in various technologies.

## Get the source code and install dependencies

```cli
git clone https://github.com/your-repo-name/your-project-name.git
npm install
```

```cli
gatsby new contentful-starter-blog https://github.com/contentful/starter-gatsby-blog/
```

## Content Model and Configuration File Setup

The project utilizes the Contentful CMS. You can set up the needed content model
and create a configuration file using the included setup command:

```cli
npm run setup
```

This command will prompt you to enter a space ID, and access tokens for the
Contentful Management and Delivery API. It will then import the necessary content
model into the specified space and write a config file (./.contentful.json).
If you wish to set this up manually, rename .contentful.json.sample to
.contentful.json and input your configuration into this file.

## Key Commands

```cli
npm run dev    # Run the project locally with live reload in development mode.
npm run build  # Run a production build into `./public`. The result is ready for
any static hosting you prefer.
npm run serve  # Spin up a production-ready server with your blog. Remember to
build your page beforehand.
```

## Extended Features

Beyond the base gatsby starter, this project includes the following custom features:

Backend Repo Integration: This project is integrated with a backend repository
hosted on [https://github.com/tadeasf/tadeasfort.cz-backend]. This backend handles
all the voting logic for the like/dislike functionality.

Like/Dislike Function: Each blog post includes a like and dislike button,
allowing users to voice their opinions on the content. The total number of likes
and dislikes are stored and managed in the backend, which provides the updated
counts to the front end.

React Responsive Carousel Integration: Blog posts now have the capability to
include image carousels using react-responsive-carousel. This allows for
visually rich content, making each post more engaging for readers.

Google Analytics Integration: To track and analyze website traffic data,
Google Analytics has been integrated into the site. This helps in understanding
user behavior and improving site content based on data-driven insights.

Sitemap Generation: A sitemap is automatically generated for the website.
This improves the SEO of the site, making it more discoverable to search engines.

Enjoy exploring the site and digging into the code!

Remember to replace [insert-backend-repo-link-here] with the actual link to your
backend repo.
