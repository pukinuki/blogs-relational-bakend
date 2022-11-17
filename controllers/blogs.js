const router = require('express').Router()
const { Op } = require('sequelize')

const { Blog, User } = require('../models')
const { tokenExtractor, sessionCheck } = require('../util/middleware')

router.get('/', async (req, res) => {
  let where = {}

  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: `%${req.query.search.toLowerCase()}%`,
          },
        },
        {
          author: {
            [Op.iLike]: `%${req.query.search.toLowerCase()}%`,
          },
        },
      ],
    }
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name', 'username'],
    },
    order: [['likes', 'DESC']],
    where,
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, sessionCheck, async (req, res) => {
  const user = req.user
  const blog = await Blog.create({ ...req.body, userId: user.id })
  return res.status(201).json(blog)
})

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id, {
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name', 'username'],
    },
  })
  next()
}

router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.delete(
  '/:id',
  tokenExtractor,
  sessionCheck,
  blogFinder,
  async (req, res, next) => {
    if (req.blog) {
      const user = req.user
      if (user.username === req.blog.user.username) await req.blog.destroy()
      else
        next({
          name: 'InvalidUserError',
          message: 'User can not delete the blog he does not own!',
        })
    }
    return res.status(200).end()
  }
)

router.put('/:id', blogFinder, async (req, res, next) => {
  if (req.blog) {
    req.blog.likes++
    await req.blog.save()
    res.json({ likes: req.blog.likes })
  } else {
    next({
      name: 'BlogNotFoundError',
      message: 'Blog was not found in the database',
    })
  }
})

module.exports = router
