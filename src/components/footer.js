import React from 'react'

import Container from './container'
import * as styles from './footer.module.css'

const Footer = () => (
  <Container as="footer">
    <div className={styles.container}>
      Built by Tadeáš Fořt in 2023 &middot;{' '}
      <a href="https://www.instagram.com/whostoletedsusername/">Instagram</a>
    </div>
  </Container>
)

export default Footer
