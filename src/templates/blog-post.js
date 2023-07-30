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
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
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
    let url = `https://tadeasfort.eu/node-express-gatsby/vote/${post.slug}`
    console.log(url)
    const response = await axios.get(url)

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

  componentDidUpdate(prevProps, prevState) {
    const post = get(this.props, 'data.contentfulBlogPost')

    // If the likeActive or dislikeActive state changes, update localStorage
    if (prevState.likeActive !== this.state.likeActive) {
      if (this.state.likeActive) {
        localStorage.setItem(`like-${post.slug}`, true)
        localStorage.removeItem(`dislike-${post.slug}`)
      } else {
        localStorage.removeItem(`like-${post.slug}`)
      }
    } else if (prevState.dislikeActive !== this.state.dislikeActive) {
      if (this.state.dislikeActive) {
        localStorage.setItem(`dislike-${post.slug}`, true)
        localStorage.removeItem(`like-${post.slug}`)
      } else {
        localStorage.removeItem(`dislike-${post.slug}`)
      }
    }
  }

  handleVote = async (voteType) => {
    const post = get(this.props, 'data.contentfulBlogPost')
    const oppositeVote = voteType === 'like' ? 'dislike' : 'like'

    // If user has voted this type already, just return
    if (this.state[`${voteType}Active`]) return

    // If user has voted opposite type before, remove it
    if (this.state[`${oppositeVote}Active`]) {
      this.setState({ [`${oppositeVote}Active`]: false })
    }

    // Now set new vote type to state
    this.setState({ [`${voteType}Active`]: true })

    // Prepare API URL and vote action
    const url = `https://tadeasfort.eu/node-express-gatsby/vote/${post.slug}/${voteType}`
    const action = this.state[`${oppositeVote}Active`] ? 'switch' : 'new'

    // Make API call to register vote
    const response = await axios.post(url, { action })

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
        <div className={styles.container}>
          <span className={styles.meta}>
            {post.author?.name} &middot;{' '}
            <time dateTime={post.rawDate}>{post.publishDate}</time> –{' '}
            {timeToRead} minute read
          </span>
          <div className={styles.voteButtons}>
            <button
              className={`${styles.voteButton} ${
                this.state.likeActive ? styles.likeActive : ''
              }`}
              onClick={() => this.handleVote('like')}
              disabled={this.state.likeActive}
            >
              <ThumbUpIcon />
              Like [{this.state.likes}]
            </button>
            <button
              className={`${styles.voteButton} ${
                this.state.dislikeActive ? styles.dislikeActive : ''
              }`}
              onClick={() => this.handleVote('dislike')}
              disabled={this.state.dislikeActive}
            >
              <ThumbDownIcon />
              Dislike [{this.state.dislikes}]
            </button>
          </div>
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
