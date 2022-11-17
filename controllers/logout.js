const router = require('express').Router()

const { tokenExtractor, sessionCheck } = require('../util/middleware')
const Session = require('../models/session')

router.delete('/', tokenExtractor, sessionCheck, async (req, res) => {
  const user = req.user
  await Session.destroy({
    where: { userId: user.id },
  })
  res.status(200).end()
})

module.exports = router
