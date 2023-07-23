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
      userVote: null, // 'like', 'dislike', or null
      error: null,
    }
  }

  componentDidMount() {
    const post = get(this.props, 'data.contentfulBlogPost')

    // Fetch the initial likes/dislikes counts when the component mounts
    this.fetchVotes()

    // Load user vote from local storage
    const userVote = window.localStorage.getItem(`userVote-${post.slug}`)

    fetch(`/api/vote/${post.slug}/userVoted`)
      .then((response) => response.json())
      .then((data) => {
        if (userVote && !data.userVoted) {
          // the user's vote is in local storage but not in db
          // remove the vote from local storage
          window.localStorage.removeItem(`userVote-${post.slug}`)
          this.setState({ userVote: null })
        } else if (userVote) {
          this.setState({ userVote })
        }
      })
  }

  fetchVotes = async () => {
    const post = get(this.props, 'data.contentfulBlogPost')
    let response
    try {
      response = await fetch(`/api/vote/${post.slug}`)
      if (response.ok) {
        const data = await response.json()
        this.setState({ likes: data.likes, dislikes: data.dislikes })
      } else {
        this.setState({ error: 'Error fetching votes: ' + response.statusText })
      }
    } catch (error) {
      this.setState({ error: 'Error fetching votes: ' + error.message })
    }
  }
  handleVote = async (voteType) => {
    const post = get(this.props, 'data.contentfulBlogPost')
    let response

    try {
      response = await fetch(`/api/vote/${post.slug}/${voteType}`, {
        method: 'POST',
      })
    } catch (error) {
      this.setState({ error: 'Error voting: ' + error.message })
    }
    if (response.ok) {
      const data = await response.json()
      this.setState({
        likes: data.likes,
        dislikes: data.dislikes,
        userVote: voteType,
      })
      window.localStorage.setItem(`userVote-${post.slug}`, voteType)
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
          <button
            className={`${styles.voteButton} ${
              this.state.userVote === 'like' ? styles.liked : ''
            }`}
            onClick={() => this.handleVote('like')}
            disabled={this.state.userVote}
          >
            Like [{this.state.likes}]
          </button>
          <button
            className={`${styles.voteButton} ${
              this.state.userVote === 'dislike' ? styles.disliked : ''
            }`}
            onClick={() => this.handleVote('dislike')}
            disabled={this.state.userVote}
          >
            Dislike [{this.state.dislikes}]
          </button>
        </div>
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
                showStatus={false}
                showThumbs={false}
                infiniteLoop={true}
                autoPlay={false}
                transitionTime={500}
                stopOnHover={true}
                swipeable={true}
                dynamicHeight={true}
                emulateTouch={true}
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
