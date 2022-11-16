const Blog = require('./blog')
const User = require('./user')
const UserBlogs = require('./userBlogs')

User.hasMany(Blog)
Blog.belongsTo(User)

/*Blog.sync({ alter: true })
User.sync({ alter: true })*/

Blog.belongsToMany(User, { through: UserBlogs, as: 'readinglists' })
User.belongsToMany(Blog, { through: UserBlogs, as: 'readings' })

module.exports = {
  Blog,
  User,
  UserBlogs,
}
