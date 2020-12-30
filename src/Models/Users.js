const bookshelf = require('../databases')

const User = bookshelf.model('User', {
  tableName: 'Users',
})

module.exports = User
