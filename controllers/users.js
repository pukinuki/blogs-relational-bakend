const router = require('express').Router()
const bcrypt = require('bcrypt')

const { User, Blog } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash', 'createdAt', 'updatedAt'] },
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] },
    },
  })
  res.json(users)
})

router.post('/', async (req, res, next) => {
  try {
    const existingUser = await User.findOne({
      where: {
        username: req.body.username,
      },
    })
    if (existingUser) {
      return res.status(400).json({
        error: 'username must be unique',
      })
    }
    if (req.body.password.length < 3) {
      return res.status(400).json({
        error: 'password must be at least 3 characters long',
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds)

    const user = await User.create({ ...req.body, passwordHash })
    res.json(user)
  } catch (error) {
    next(error)
    //return res.status(400).json({ error })
  }
})

router.get('/:id', async (req, res, next) => {
  const where = {}

  if (req.query.read) {
    where.read = req.query.read === 'true'
  }

  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash', 'createdAt', 'updatedAt'] },
    include: [
      /*{
        model: Blog,
        attributes: { exclude: ['userId'] },
      },*/
      {
        model: Blog,
        as: 'readings',
        attributes: { exclude: ['userId'] },
        through: {
          as: 'readinglists',
          attributes: ['id', 'read'],
          where,
        },
      },
    ],
  })
  if (user) {
    res.json(user)
  } else {
    next({
      name: 'ValidationError',
      message: 'user does not exist in the database',
    })
  }
})

router.put('/:username', async (req, res, next) => {
  if (!req.body.username)
    next({ name: 'ValidationError', message: 'new username must be given' })

  const user = await User.findOne({
    where: {
      username: req.params.username,
    },
  })

  if (user) {
    user.username = req.body.username
    await user.save()
    res.json(user)
  } else {
    next({
      name: 'ValidationError',
      message: 'user does not exist in the database',
    })
  }
})

module.exports = router
