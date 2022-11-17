const Blog = require('./blog')
const User = require('./user')
const UserBlogs = require('./userBlogs')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)

/*Blog.sync({ alter: true })
User.sync({ alter: true })*/

Blog.belongsToMany(User, { through: UserBlogs, as: 'readinglists' })
User.belongsToMany(Blog, { through: UserBlogs, as: 'readings' })

User.hasMany(Session)
Session.belongsTo(User)

module.exports = {
  Blog,
  User,
  UserBlogs,
  Session,
}
