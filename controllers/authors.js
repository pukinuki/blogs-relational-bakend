const router = require('express').Router()
const { sequelize } = require('../util/db')

const { Blog } = require('../models')

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: [
      'author',
      [sequelize.fn('COUNT', 'author'), 'articles'],
      [sequelize.fn('sum', sequelize.col('likes')), 'likes'],
    ],
    group: ['author'],
    order: [['likes', 'DESC']],
  })
  res.json(blogs)
})

module.exports = router
