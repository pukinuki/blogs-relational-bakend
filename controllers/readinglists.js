const router = require('express').Router()

const { UserBlogs } = require('../models')
const { tokenExtractor, sessionCheck } = require('../util/middleware')

router.post('/', async (req, res) => {
  const blog_added = await UserBlogs.create({ ...req.body })
  res.json(blog_added)
})

router.put('/:id', tokenExtractor, sessionCheck, async (req, res) => {
  const blog_read = await UserBlogs.findOne({
    where: { id: req.params.id, userId: req.decodedToken.id },
  })
  blog_read.read = req.body.read
  await blog_read.save()
  res.json(blog_read)
})

module.exports = router
