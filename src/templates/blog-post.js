import React from 'react'
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
import axios from 'axios'

class BlogPostTemplate extends React.Component {
  state = {
    likeActive: false,
    dislikeActive: false,
    likes: 0,
    dislikes: 0,
  }

  async componentDidMount() {
    const post = get(this.props, 'data.contentfulBlogPost')
    const response = await axios.get(
      `http://194.182.90.63:3333/vote/${post.slug}`
    )

    // Load user vote from local storage
    const likeActive = localStorage.getItem(`like-${post.slug}`)
    const dislikeActive = localStorage.getItem(`dislike-${post.slug}`)

    this.setState({
      likeActive: !!likeActive,
      dislikeActive: !!dislikeActive,
      likes: response.data.likes,
      dislikes: response.data.dislikes,
    })
  }

  handleVote = async (voteType) => {
    const post = get(this.props, 'data.contentfulBlogPost')
    const oppositeVote = voteType === 'like' ? 'dislike' : 'like'

    if (localStorage.getItem(`${voteType}-${post.slug}`)) {
      return // User already voted this type. Stop here.
    }

    // Set this vote type to localStorage
    localStorage.setItem(`${voteType}-${post.slug}`, true)
    localStorage.removeItem(`${oppositeVote}-${post.slug}`)

    this.setState({
      [`${voteType}Active`]: true,
      [`${oppositeVote}Active`]: false,
    })

    // Make API call to register vote
    const response = await axios.post(
      `http://194.182.90.63:3333/vote/${post.slug}/${voteType}`
    )

    // Update likes and dislikes state from response
    this.setState({
      likes: response.data.likes,
      dislikes: response.data.dislikes,
    })
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
              this.state.likeActive ? styles.liked : ''
            }`}
            onClick={() => this.handleVote('like')}
            disabled={this.state.likeActive}
          >
            Like [{this.state.likes}]
          </button>
          <button
            className={`${styles.voteButton} ${
              this.state.dislikeActive ? styles.disliked : ''
            }`}
            onClick={() => this.handleVote('dislike')}
            disabled={this.state.dislikeActive}
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
