'use strict'
const fs = require('fs').promises
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const validator = require('email-validator')
const mariadb = require('mariadb')
const util = require('util')
const crypto = require('crypto')
const sha512 = require('js-sha512').sha512
const nodemailer = require('nodemailer')
const app = express()
const port = 80

app.use(bodyParser.urlencoded({ extended: true }))

app.use('/assets', express.static('/srv/opt/Linux-Rocks/assets'))
app.use('/images', express.static('/srv/opt/Linux-Rocks/images'))

app.route(/^\/(register)?$/)
  .get(async (req, res, next) => {
    try {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(await fs.readFile('/srv/opt/Linux-Rocks/index.html'))
      res.end()
    } catch (err) {
      next(err)
    }
  })
  .post(async (req, res, next) => {
    try {
      let template = await fs.readFile('/srv/opt/Linux-Rocks/template.ejs', { encoding: 'utf8' })
      if (typeof req.body['email'] !== 'string') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(ejs.render(template, {
          title: 'Email Address Not Provided',
          description: 'It appears that you did not submit your email address for registration',
          contentBody: `<p>
  Please enter your email address in the registration page and click &quot;Register&quot; to register for your vote.
</p>
<p>
  <a href="/" class="button">Go Back</a>
</p>`
        }))
        res.end()
      } else if (!validator.validate(req.body['email'])) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(ejs.render(template, {
          title: 'Email Address Invalid',
          description: 'It appears that you did not provide a valid email address for registration',
          contentBody: `<p>
  Please enter a valid email address in the registration page and click &quot;Register&quot; to register for your vote.
</p>
<p>
  <a href="/" class="button">Go Back</a>
</p>`
        }))
        res.end()
      } else {
        let conn = await mariadb.createConnection({
          host: 'localhost',
          user: 'voters',
          password: 'voters-pw',
          database: 'voters'
        })
        let email = conn.escape(req.body['email'])
        let rows = await conn.query(`SELECT * FROM voters WHERE email = ${email}`)
        if (rows.length > 0) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(ejs.render(template, {
            title: 'Email Already Registered',
            description: 'It appears that you have already registered this email address for voting',
            contentBody: `<p>
  Please note that each email address can only be registered once for voting.
  If you have already cast your vote, you may no longer change your vote.
  If you have previously registered this email address but have yet to cast your vote, please check your inbox for our email.
  Our email should include a one-time password (OTP) which you should enter in the voting page along with your email address to verify your identity when voting.
</p>
<p>
  <a href="/vote" class="button primary">Proceed to Vote</a> <a href="/" class="button">Go Back</a>
</p>`
          }))
          res.end()
        } else {
          let otp = crypto.randomBytes(16).toString('hex')
          let otpHash = sha512(otp)
          await conn.query(`INSERT INTO voters (email, otp_hash, vote_cast) VALUES (${email}, '${otpHash}', 0)`)
          let transporter = nodemailer.createTransport({
            sendmail: true,
            newline: 'unix',
            path: '/usr/sbin/sendmail'
          })
          await transporter.sendMail({
            from: 'webmaster@linux-rocks.com',
            to: req.body['email'],
            subject: '[Linux Rocks] Here is your OTP for your vote',
            text: `Hello voter,

It seems you have registered for a vote at "Linux Rocks". If not, your email address was probably used by someone else to register for a vote - in that case, please inform webmaster@linux-rocks.com of the incident immediately.

Your one-time password (OTP) for verifying your identity during the vote is as follows:

${otp}

Please enter your OTP along with your email address to authenticate yourself when voting for your favorite Linux distribution. Happy voting!`,
            html: `<p>Hello voter,</p>

<p>It seems you have registered for a vote at &quot;Linux Rocks&quot;. If not, your email address was probably used by someone else to register for a vote - in that case, please inform webmaster@linux-rocks.com of the incident immediately.</p>

<p>Your one-time password (OTP) for verifying your identity during the vote is as follows:</p>

<p>${otp}</p>

<p>Please enter your OTP along with your email address to authenticate yourself when voting for your favorite Linux distribution. Happy voting!</p>`
          })
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(ejs.render(template, {
            title: 'Registration Successful',
            description: 'A confirmation email with your one-time password (OTP) has been sent to your account',
            contentBody: `<p>
  Please check your inbox for our email. Once you receive our email, proceed to our voting page and enter the supplied OTP along with your email address to authenticate your vote. Happy voting!
</p>
<p>
  <a href="/vote" class="button primary">Proceed to Vote</a> <a href="/" class="button">Go Back</a>
</p>`
          }))
          res.end()
        }
        await conn.end()
      }
    } catch (err) {
      next(err)
    }
  })

app.route('/vote')
  .get(async (req, res, next) => {
    try {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(await fs.readFile('/srv/opt/Linux-Rocks/vote.html'))
      res.end()
    } catch (err) {
      next(err)
    }
  })
  .post(async (req, res, next) => {
    let template = await fs.readFile('/srv/opt/Linux-Rocks/template.ejs', { encoding: 'utf8' })
    let validDistros = [
      'Debian',
      'Ubuntu',
      'Linux Mint',
      'Fedora',
      'RHEL',
      'CentOS',
      'SLES',
      'openSUSE',
      'Arch Linux',
      'Gentoo Linux',
      'Slackware Linux',
      'NixOS',
      'Alpine Linux',
      'Other',
      'None'
    ]
    try {
      if (typeof req.body['email'] !== 'string' || typeof req.body['otp'] !== 'string' || typeof req.body['vote'] !== 'string') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(ejs.render(template, {
          title: 'Required Fields Missing',
          description: 'Your email address, OTP and choice of favorite distro must be provided',
          contentBody: `<p>
  Please make sure you submit your email address, OTP and choice of favorite distro in the voting page.
</p>
<p>
  <a href="/vote" class="button primary">Go Back</a>
  <a href="/" class="button">Return to registration page</a>
</p>`
        }))
        res.end()
      } else if (!validator.validate(req.body['email'])) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(ejs.render(template, {
          title: 'Invalid Email Address Provided',
          description: 'The email address you provided is invalid',
          contentBody: `<p>
  Please make sure you have typed in your email address correctly and try again.
</p>
<p>
  <a href="/vote" class="button primary">Go Back</a>
  <a href="/" class="button">Return to registration page</a>
</p>`
        }))
        res.end()
      } else if (!validDistros.includes(req.body['vote'])) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(ejs.render(template, {
          title: 'Invalid Option Selected',
          description: 'It seems you chose something other than the options we provided',
          contentBody: `<p>
  Please choose one of the options provided in the voting form as your favorite distro and re-submit your vote.
  Note that the &quot;Linux From Scratch / other Linux distributions&quot; options is available in case your favorite distro is not listed in one of the options.
</p>
<p>
  <a href="/vote" class="button primary">Go Back</a>
  <a href="/" class="button">Return to registration page</a>
</p>`
        }))
        res.end()
      } else {
        let conn = await mariadb.createConnection({
          host: 'localhost',
          user: 'voters',
          password: 'voters-pw',
          database: 'voters'
        })
        let rows = await conn.query(`SELECT * FROM voters WHERE email = ${conn.escape(req.body['email'])}`)
        if (rows.length !== 1) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(ejs.render(template, {
            title: 'Email Address Not Registered',
            description: 'The email address you entered was not registered for voting',
            contentBody: `<p>
  Please go to the registration page and submit your email address there to register for a vote.
  If you have already registered for a vote, please make sure you have typed in your email address correctly and try again.
</p>
<p>
  <a href="/" class="button primary">Register for your vote</a>
  <a href="/vote" class="button">Try Again</a>
</p>`
          }))
          res.end()
        } else {
          let row = rows[0]
          let voteCast = !!row['vote_cast'][0]
          if (voteCast) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write(ejs.render(template, {
              title: 'Vote Already Cast',
              description: 'It appears that you have already voted for your favorite Linux distribution',
              contentBody: `<p>
  It appears that you have already voted for your favorite Linux distribution.
  Note that each email address is only entitled to one vote.
</p>
<p>
  <a href="/" class="button">Return to Main Page</a>
</p>`
            }))
            res.end()
          } else if (sha512(req.body['otp']) !== row['otp_hash']) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write(ejs.render(template, {
              title: 'Incorrect OTP supplied',
              description: 'It appears that you have supplied an incorrect one-time password',
              contentBody: `<p>
  Please make sure you have typed in or copied over the OTP we provided you correctly and try again.
</p>
<p>
  <a href="/vote" class="button primary">Try Again</a>
  <a href="/" class="button">Return to registration page</a>
</p>`
            }))
            res.end()
          } else {
            let distroMap = {
              'Debian': 'debian',
              'Ubuntu': 'ubuntu',
              'Linux Mint': 'mint',
              'Fedora': 'fedora',
              'RHEL': 'rhel',
              'CentOS': 'centos',
              'SLES': 'sles',
              'openSUSE': 'opensuse',
              'Arch Linux': 'arch',
              'Gentoo Linux': 'gentoo',
              'Slackware Linux': 'slackware',
              'NixOS': 'nixos',
              'Alpine Linux': 'alpine',
              'Other': 'other',
              'None': 'none'
            }
            let distroVotes = await fs.readFile('/opt/Linux-Rocks/results.json', { encoding: 'utf8' })
            distroVotes = JSON.parse(distroVotes)
            ++distroVotes[distroMap[req.body['vote']]]
            await fs.writeFile('/opt/Linux-Rocks/results.json', JSON.stringify(distroVotes))
            await conn.query(`UPDATE voters SET vote_cast = 1 WHERE email = ${conn.escape(req.body['email'])}`)
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write(ejs.render(template, {
              title: 'Vote Recorded',
              description: 'Thank you for voting for your favorite Linux distro',
              contentBody: `<p>
  Thank you for taking the time to vote for your favorite Linux distribution.
  Your response has been recorded.
  Don't forget to check out what others have chosen as their favorite Linux distribution!
</p>
<p>
  <a href="/results" class="button primary">View voting results</a>
  <a href="/" class="button">Return to Main Page</a>
</p>`
            }))
            res.end()
          }
        }
        await conn.end()
      }
    } catch (err) {
      next(err)
    }
  })

app.get('/results', async (req, res, next) => {
  try {
    let results = await fs.readFile('/opt/Linux-Rocks/results.json')
    results = JSON.parse(results)
    let winner = 'none'
    let total = Object.keys(results).reduce((acc, distro) => {
      if (results[distro] > results[winner])
        winner = distro
      return acc + results[distro]
    }, 0)
    let debian = total > 0 ? Math.round(100 * results['debian'] / total) : 0
    let ubuntu = total > 0 ? Math.round(100 * results['ubuntu'] / total) : 0
    let mint = total > 0 ? Math.round(100 * results['mint'] / total) : 0
    let fedora = total > 0 ? Math.round(100 * results['fedora'] / total) : 0
    let rhel = total > 0 ? Math.round(100 * results['rhel'] / total) : 0
    let centos = total > 0 ? Math.round(100 * results['centos'] / total) : 0
    let sles = total > 0 ? Math.round(100 * results['sles'] / total) : 0
    let opensuse = total > 0 ? Math.round(100 * results['opensuse'] / total) : 0
    let arch = total > 0 ? Math.round(100 * results['arch'] / total) : 0
    let gentoo = total > 0 ? Math.round(100 * results['gentoo'] / total) : 0
    let slackware = total > 0 ? Math.round(100 * results['slackware'] / total) : 0
    let nixos = total > 0 ? Math.round(100 * results['nixos'] / total) : 0
    let alpine = total > 0 ? Math.round(100 * results['alpine'] / total) : 0
    let other = total > 0 ? Math.round(100 * results['other'] / total) : 0
    let none = total > 0 ? Math.round(100 * results['none'] / total) : 0
    let displayDistro = {
      'debian': 'Debian',
      'ubuntu': 'Ubuntu',
      'mint': 'Linux Mint',
      'fedora': 'Fedora',
      'rhel': 'RHEL',
      'centos': 'CentOS',
      'sles': 'SLES',
      'opensuse': 'openSUSE',
      'arch': 'Arch Linux',
      'gentoo': 'Gentoo Linux',
      'slackware': 'Slackware Linux',
      'nixos': 'NixOS',
      'alpine': 'Alpine Linux',
      'other': 'Linux From Scratch / other Linux distributions',
      'none': 'None'
    }
    winner = displayDistro[winner]
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(ejs.render(await fs.readFile('/srv/opt/Linux-Rocks/results.ejs', { encoding: 'utf8' }), {
      winner,
      debian,
      ubuntu,
      mint,
      fedora,
      rhel,
      centos, 
      sles,
      opensuse,
      arch,
      gentoo,
      slackware,
      nixos,
      alpine,
      other,
      none
    }))
    res.end()
  } catch (err) {
    next(err)
  }
})

app.get('/license', async (req, res, next) => {
  try {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write(await fs.readFile('/srv/opt/Linux-Rocks/LICENSE'))
    res.end()
  } catch (err) {
    next(err)
  }
})

app.listen(port)
