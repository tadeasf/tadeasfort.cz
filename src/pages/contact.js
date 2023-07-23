import React, { useState } from 'react'
import emailjs from 'emailjs-com'
import Layout from '../components/layout'
import * as styles from './contact.module.css'

const ContactPage = () => {
  const [result, setResult] = useState('')

  const sendEmail = (e) => {
    e.preventDefault()

    emailjs
      .sendForm(
        'service_plmqcv9',
        'template_j9ypx3l',
        e.target,
        '0U_UfX9XF1eoxLJqZ'
      )
      .then(
        (result) => {
          console.log(result.text)
          setResult('Email successfully sent!')
        },
        (error) => {
          console.log(error.text)
          setResult('An error occurred, please try again.')
        }
      )
  }

  return (
    <Layout>
      <div className={styles.contactContainer}>
        <h1>Contact me!</h1>
        <form onSubmit={sendEmail}>
          <label>
            Your Name:
            <input type="text" name="from_name" required />
          </label>
          <label>
            Your Email:
            <input type="email" name="from_email" required />
          </label>
          <label>
            Message:
            <textarea name="message_content" required />
          </label>
          <input type="hidden" name="to_name" value="tadeas" />{' '}
          <button type="submit">Send</button>
        </form>
        {result}
        <p>
          <em>Here is my contact information:</em>
        </p>
        <p>
          <strong>Email (work):</strong> fort@daytrip.com
        </p>
        <p>
          <strong>Email (personal):</strong> taddy.fort@gmail.com
        </p>
        <p>
          <strong>Mobile:</strong> 00420 739 817 714
        </p>
      </div>
    </Layout>
  )
}

export default ContactPage
