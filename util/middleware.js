const logger = require('./logger')
const jwt = require('jsonwebtoken')

const { SECRET } = require('./config')

const Session = require('../models/session')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error)

  if (error.name === 'SequelizeValidationError') {
    return response
      .status(400)
      .send({ error: error.errors.map(e => e.message) })
  } else if (error.name === 'InvalidUserError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'BlogNotFoundError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token',
    })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired',
    })
  }

  next(error)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch (error) {
      next(error)
      //return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const userExtractor = (request, response, next) => {
  const token = request.token
  if (token) {
    const decodedUser = jwt.verify(token, process.env.SECRET)
    if (!decodedUser.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    request['user'] = decodedUser
  }
  next()
}

const sessionCheck = async (request, response, next) => {
  request.user = await User.findByPk(request.decodedToken.id)
  if (!request.user) return response.status(401).json({ error: 'invalid user' })

  if (request.user.disabled) {
    await Session.destroy({
      where: { userId: request.user.id },
    })
    return response.status(401).json({ error: 'user has been disabled' })
  }
  const session = await Session.findOne({
    where: {
      userId: request.user.id,
      token: request.get('Authorization').substring(7),
    },
  })
  if (!session) {
    return response.status(401).json({ error: 'session expired' })
  }

  next()
}

const middleware = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  sessionCheck,
}

module.exports = middleware
