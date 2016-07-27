var Bookshelf = require('bookshelf')
var ContinuationLocalStorage = require('continuation-local-storage')

// Monkey-patch Bluebird
var Promise = require('bluebird');
var clsBluebird = require('cls-bluebird');

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : 'password',
    database : 'gofetch-restify',
    charset  : 'utf8'
  }
})

var bookshelf = require('bookshelf')(knex)

var User = bookshelf.Model.extend({
  tableName: 'user'
})

var promise = async function() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
}

// Setup CLS
var transactionId = require('uuid').v4()
var namespace = ContinuationLocalStorage.createNamespace('namespace')
clsBluebird(namespace)

namespace.run(() => {

  namespace.set('transactionId', transactionId)

  console.log('Starting app.js')
  console.log(`Transaction id at start: ${namespace.get('transactionId')}`)

  // Testing native ES6 promises
  promise().then(() => {
    console.log(`Transaction id after promise 1: ${namespace.get('transactionId')}`)
    // Native ES6 promises work
  }).catch(error => {

  })

  // Testing Bookshelf calls
  User.fetchAll().then(users => {
    console.log(`Transaction id after fetching users: ${namespace.get('transactionId')}`)
    // Bookshelf calls do not work
  })

  var currentNamespace = namespace
  User.fetchAll().then(users => {
    namespace.enter(currentNamespace)
    console.log(`Transaction id after fetching users with new namespace variable: ${namespace.get('transactionId')}`)
    // Bookshelf calls do not work
  })

})
