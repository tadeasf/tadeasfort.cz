import React, { useState, useEffect } from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import readingTime from 'reading-time'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import Seo from '../components/seo'
import Layout from '../components/layout'
import Hero from '../components/hero'
import Tags from '../components/tags'
import * as styles from './blog-post.module.css'

class BlogPostTemplate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      likes: 0,
      dislikes: 0,
      error: null,
    }
  }

  componentDidMount() {
    // Fetch the initial likes/dislikes counts when the component mounts
    this.fetchVotes()
  }

  fetchVotes = async () => {
    const post = get(this.props, 'data.contentfulBlogPost')
    try {
      const response = await fetch(
        `http://194.182.90.63:3333/vote/${post.slug}`
      )
      const data = await response.json()
      this.setState({
        likes: data.likes,
        dislikes: data.dislikes,
      })
    } catch (error) {
      console.error('Error fetching votes: ', error)
    }
  }

  handleVote = async (voteType) => {
    const post = get(this.props, 'data.contentfulBlogPost')
    try {
      const response = await fetch(
        `http://194.182.90.63:3333/vote/${post.slug}/${voteType}`,
        { method: 'POST' }
      )
      const data = await response.json()

      if (!response.ok) {
        this.setState({ error: data.message })
        return
      }

      this.setState({
        likes: data.likes,
        dislikes: data.dislikes,
        error: null, // Clear any previous error
      })
    } catch (error) {
      this.setState({ error: 'Error voting: ' + error.message })
    }
  }

  render() {
    const post = get(this.props, 'data.contentfulBlogPost')
    const previous = get(this.props, 'data.previous')
    const next = get(this.props, 'data.next')
    const plainTextDescription = documentToPlainTextString(
      JSON.parse(post.description.raw)
    )
    const plainTextBody = documentToPlainTextString(JSON.parse(post.body.raw))
    const { minutes: timeToRead } = readingTime(plainTextBody)
    const galleryImages = post.gallery
      ? post.gallery.map((image) => (
          <div key={image.id}>
            <GatsbyImage image={getImage(image)} alt="" />
          </div>
        ))
      : null
    const options = {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const gatsbyImageData = getImage(node.data.target.gatsbyImageData)
          return (
            <GatsbyImage image={gatsbyImageData} alt={node.data.target.title} />
          )
        },
      },
    }

    return (
      <Layout location={this.props.location}>
        <Seo
          title={post.title}
          description={plainTextDescription}
          image={`http:${post.heroImage.resize.src}`}
        />
        <Hero
          image={post.heroImage?.gatsbyImage}
          title={post.title}
          content={post.description}
        />
        <div className={styles.voteButtons}>
          <button onClick={() => this.handleVote('like')}>Like</button>
          <p>{this.state.likes}</p>
          <button onClick={() => this.handleVote('dislike')}>Dislike</button>
          <p>{this.state.dislikes}</p>
        </div>
        {this.state.error && <p>{this.state.error}</p>}
        <div className={styles.container}>
          <span className={styles.meta}>
            {post.author?.name} &middot;{' '}
            <time dateTime={post.rawDate}>{post.publishDate}</time> –{' '}
            {timeToRead} minute read
          </span>
          <div className={styles.article}>
            <div className={styles.body}>
              {post.body?.raw && renderRichText(post.body, options)}
            </div>
            {galleryImages && (
              <Carousel
                showArrows={true}
                showStatus={true}
                showThumbs={true}
                infiniteLoop={true}
                autoPlay={true}
                interval={3000}
                transitionTime={500}
                stopOnHover={true}
                swipeable={true}
                dynamicHeight={true}
                emulateTouch={true}
                thumbWidth={100}
                selectedItem={0}
                swipeScrollTolerance={5}
              >
                {galleryImages}
              </Carousel>
            )}
            <Tags tags={post.tags} />
            {(previous || next) && (
              <nav>
                <ul className={styles.articleNavigation}>
                  {previous && (
                    <li>
                      <Link to={`/blog/${previous.slug}`} rel="prev">
                        ← {previous.title}
                      </Link>
                    </li>
                  )}
                  {next && (
                    <li>
                      <Link to={`/blog/${next.slug}`} rel="next">
                        {next.title} →
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $slug: String!
    $previousPostSlug: String
    $nextPostSlug: String
  ) {
    contentfulBlogPost(slug: { eq: $slug }) {
      slug
      title
      author {
        name
      }
      publishDate(formatString: "MMMM Do, YYYY")
      rawDate: publishDate
      heroImage {
        gatsbyImage(layout: FULL_WIDTH, placeholder: BLURRED, width: 1280)
        resize(height: 630, width: 1200) {
          src
        }
      }
      body {
        raw
      }
      gallery {
        id
        gatsbyImageData(layout: CONSTRAINED, placeholder: BLURRED)
      }
      tags
      description {
        raw
      }
    }
    previous: contentfulBlogPost(slug: { eq: $previousPostSlug }) {
      slug
      title
    }
    next: contentfulBlogPost(slug: { eq: $nextPostSlug }) {
      slug
      title
    }
  }
`
