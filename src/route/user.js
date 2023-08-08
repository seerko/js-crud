// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class User {
  static #list = []

  constructor(email, login, password) {
    this.email = email
    this.login = login
    this.password = password
    this.id = new Date().getTime()
  }

  verifyPassword = (password) => this.password === password

  static add = (user) => {
    this.#list.push(user)
  }

  static getList = () => {
    return this.#list
  }

  static getById = (id) =>
    this.#list.find((user) => user.id === id)

  static deleteById = (id) => {
    const index = this.#list.findIndex(
      (user) => user.id === id,
    )

    if (index !== -1) {
      this.#list.splice(index, 1)
      return true
    } else {
      return false
    }
  }

  static updateById = (id, data) => {
    const user = this.getById(id)

    if (user) {
      this.update(user, data)
      return true
    } else {
      return false
    }
  }

  static update = (user, { email }) => {
    if (email) {
      user.email = email
    }
  }
}

// ================================================================

class Product {
  static #list = [] // приватний список товарів

  constructor(name, price, description) {
    this.id = this.#generateId()
    this.createDate = new Date().toISOString()
    this.name = name
    this.price = price
    this.description = description
  }

  #generateId() {
    return Math.floor(10000 + Math.random() * 90000)
  }

  static getList() {
    return this.#list
  }

  static add(product) {
    if (product.name != 0 && !isNaN(product.price)) {
      this.#list.push(product)
      return true
    }
    return false
  }

  static getById(id) {
    return this.#list.find((product) => product.id === id)
  }

  static updateById(id, data) {
    const product = this.getById(id)
    if (product) {
      product.name = data.name || product.name
      product.price = data.price || product.price
      product.description =
        data.description || product.description
      return true
    } else {
      return false
    }
  }

  static deleteById(id) {
    const index = this.#list.findIndex(
      (product) => product.id === id,
    )
    if (index !== -1) {
      this.#list.splice(index, 1)
      return true
    } else {
      return false
    }
  }
}
// ================================================================
// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки
router.get('/user-index', function (req, res) {
  // res.render генерує нам HTML сторінку

  const list = User.getList()

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('user-index', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'user-index',

    data: {
      users: {
        list,
        isEmpty: list.length === 0,
      },
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.post('/user-create', function (req, res) {
  const { email, login, password } = req.body

  const user = new User(email, login, password)

  User.add(user)

  console.log(User.getList())

  res.render('user-success-info', {
    style: 'user-success-info',
    info: 'Користувач створений',
  })
})

// ================================================================

router.get('/user-delete', function (req, res) {
  const { id } = req.query

  console.log(id)

  const user = User.deleteById(Number(id))

  res.render('user-success-info', {
    style: 'user-success-info',
    info: 'Користувач видалений',
  })
})

// ================================================================

router.post('/user-update', function (req, res) {
  const { email, password, id } = req.body

  const user = User.getById(Number(id))
  let result = false

  if (user.verifyPassword(password)) {
    User.update(user, { email })
    result = true
  }

  res.render('user-success-info', {
    style: 'user-success-info',
    info: result
      ? 'Email адреса оновлена'
      : 'Сталася помилка',
  })
})

// ================================================================

router.get('/product-create', function (req, res) {
  res.render('product-create', {
    style: 'product-create',
  })
})

// ================================================================

router.post('/product-create', function (req, res) {
  const { name, price, description } = req.body

  const product = new Product(name, price, description)

  let result = Product.add(product)

  res.render('alert', {
    style: 'alert',
    title: result ? 'Успішне виконання дії' : 'Помилка',
    info: result
      ? 'Продукт успішно створений'
      : 'Продукт не створений',
  })
})

// ================================================================

router.get('/product-list', function (req, res) {
  const list = Product.getList()

  res.render('product-list', {
    style: 'product-list',
    data: {
      products: {
        list,
        isEmpty: list.length === 0,
      },
    },
  })
})

// ================================================================

router.get('/product-edit', function (req, res) {
  const { id } = req.query

  const product = Product.getById(Number(id))

  if (product !== undefined) {
    res.render('product-edit', {
      style: 'product-edit',
      product: product,
    })
  } else {
    res.render('alert', {
      style: 'alert',
      title: 'Помилка',
      info: 'Товар з таким ID не знайдено',
    })
  }
})

// ================================================================

router.post('/product-edit', function (req, res) {
  const { id, name, price, description } = req.body

  let result = Product.updateById(Number(id), {
    name,
    price,
    description,
  })

  res.render('alert', {
    style: 'alert',
    title: result ? 'Успішне виконання дії' : 'Помилка',
    info: result
      ? 'Продукт успішно оновлений'
      : 'Продукт не знайдено',
  })
})

// ================================================================
router.get('/product-delete', function (req, res) {
  const { id } = req.query

  const result = Product.deleteById(Number(id))

  res.render('alert', {
    style: 'alert',
    title: result ? 'Успішне виконання дії' : 'Помилка',
    info: result
      ? 'Продукт успішно видалений'
      : 'Продукт не знайдено',
  })
})

// ================================================================
// Підключаємо роутер до бек-енду
module.exports = router
