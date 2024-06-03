import express from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';

const app = express();

const PORT = process.env.PORT || 3000;

// vi hämtar produkter
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

// vi hämtar användare
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));

//Slår ihop all json data till en variabel
const allData = {
  products: products,
  users: users,
};

// ____________________________
// 🤖 Genererar ID
function getNextId(array) {
  // Om arrayen är tom, returnera 1 eftersom det är det första möjliga id
  if (array.length === 0) {
    return 1;
  }

  // Leta efter det största id:t i arrayen
  const maxId = array.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, 0);

  // Returnera det största id:t plus 1
  return parseInt(maxId) + 1;
}
//_____________________________

//*----------Middleware----------🐛
app.use(express.json());
app.use(express.static('public'));

//*----------Register view engine----------🐛
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//* ROOT 🐛
app.get('/', (req, res) => {
  // Create an array to hold one product from each category
  const featuredProducts = [];

  // Iterate through each category
  products.forEach((category) => {
    // If the category has items, push the first item to the array
    if (category.items.length > 0) {
      featuredProducts.push(category.items[0]);
    }
  });

  // Render your template with the array of featured products
  res.render('home', { featuredProducts });
});
//* CATEGORIES 🐛
app.get('/categories', (req, res) => {
  res.render('categories', { products });
});

app.get('/categories/:category', (request, response) => {
  let category = request.params.category;

  const indexOfCategory = products.findIndex(
    (product) => product.category === category
  );

  response.status(200).render('categoryDetail', {
    categoryName: products[indexOfCategory].category,
    categoryItems: products[indexOfCategory].items,
  });
});

app.get('/categories/:categoryName/:productId', (request, response) => {
  let categoryName = request.params.categoryName;
  let productId = request.params.productId;
  console.log(categoryName, productId);

  const indexOfCategory = products.findIndex(
    (product) => product.category === categoryName
  );
  //If the category is not found, return a 404 status
  if (indexOfCategory === -1) {
    return response.status(404).send('Category not found');
  }
  // console.log(products[indexOfCategory].items[3].id);
  let indexOfProduct = products[indexOfCategory].items.findIndex(
    (item) => item.id == productId
  );

  // If the product is not found, return a 404 status
  if (indexOfProduct === -1) {
    return response.status(404).send('Product not found');
  }
  // console.log(indexOfProduct);

  const product = products[indexOfCategory].items[indexOfProduct];
  console.log(product);
  // response.sendStatus(200);
  response.render('productDetail', {
    product,
  });
});

//* CONTACT 🐛
app.get('/contact', (req, res) => {
  res.render('contact');
});

//* GET ALL DATA 🐛
app.get('/api', (request, response) => {
  response.status(200).send(allData);
  // response.status(200).send(users);
});

// *-----------PRODUCTS-----------

//* GET PRODUCTS 🐛
app.get('/api/products', (request, response) => {
  response.status(200).send(products);
});

//* GET PRODUCTS by Category 🐛
app.get('/api/products/:category', (request, response) => {
  let category = request.params.category;

  const indexOfCategory = products.findIndex(
    (product) => product.category === category
  );

  response.status(200).send(products[indexOfCategory]);
});

app.get('/api/products/:category/items', (request, response) => {
  let category = request.params.category;
  const indexOfCategory = products.findIndex(
    (product) => product.category === category
  );

  response.status(200).send(products[indexOfCategory].items);
});

//* POST PRODUCTS 🐛
app.post('/api/products/:category', (request, response) => {
  const { body } = request;

  // hitta de objekt som motsvarar önskade kategorin
  let category = request.params.category;
  const indexOfCategory = products.findIndex(
    (product) => product.category === category
  );
  if (indexOfCategory === -1)
    return response.status(400).send('Bad request. Kategori ogiltig.');

  // vi vill pusha in i följande:
  // products[indexOfCategory].items

  const addNewProduct = {
    id: randomUUID(),
    ...body,
  };
  products[indexOfCategory].items.push(addNewProduct);
  // TODO: VALIDERING OCH SKICKA FEL OM PAYLOAD INTE ÄR KORREKT IFYLLD:
  response.status(201).send(addNewProduct);
});

//* PUT PRODUCTS 🐛
app.put('/api/products/:category/:id', (request, response) => {
  let id = request.params.id;
  let body = request.body;

  // hitta de objekt som motsvarar önskade kategorin
  let category = request.params.category;
  const indexOfCategory = products.findIndex(
    (product) => product.category === category
  );
  if (indexOfCategory === -1)
    return response.status(400).send('Bad request. Kategori ogiltig.');

  id = parseInt(id);
  if (isNaN(id)) {
    return response.sendStatus(400);
  }
  let index = products[indexOfCategory].items.findIndex((product) => {
    return product.id === id;
  });
  if (index === -1) {
    return response.status(404).send('Not found');
  }
  // TODO: VALIDERING OCH SKICKA FEL OM PAYLOAD INTE ÄR KORREKT IFYLLD:

  // vi går in i den array som har index av önskad kategori.
  // i den går vi sedan in i det item som har index av det önskade id.
  products[indexOfCategory].items[index] = { id: id, ...body };
  response.status(200).send(products[indexOfCategory].items[index]);
});

//* PATCH PRODUCTS 🐛
app.patch('/api/products/:category/:id', (request, response) => {
  let id = request.params.id;
  let body = request.body;

  // hitta de objekt som motsvarar önskade kategorin
  let category = request.params.category;
  const indexOfCategory = products.findIndex(
    (product) => product.category === category
  );
  if (indexOfCategory === -1)
    return response.status(400).send('Bad request. Kategori ogiltig.');

  id = parseInt(id);
  if (isNaN(id)) {
    return response.sendStatus(400);
  }
  let index = products[indexOfCategory].items.findIndex((product) => {
    return product.id === id;
  });
  if (index === -1) {
    return response.status(404).send('Not found');
  }
  // TODO: VALIDERING OCH SKICKA FEL OM PAYLOAD INTE ÄR KORREKT IFYLLD:

  // vi går in i den array som har index av önskad kategori.
  // i den går vi sedan in i det item som har index av det önskade id.
  products[indexOfCategory].items[index] = {
    ...products[indexOfCategory].items[index],
    ...body,
  };
  response.status(200).send(products[indexOfCategory].items[index]);
});

//* DELETE PRODUCTS 🐛
app.delete('/api/products/:category/:id', (request, response) => {
  let id = request.params.id;
  let category = request.params.category;

  const indexOfCategory = products.findIndex(
    (product) => product.category === category
  );
  if (indexOfCategory === -1)
    return response.status(400).send('Bad request. Kategori ogiltig.');

  id = parseInt(id);
  if (isNaN(id)) {
    return response.sendStatus(400);
  }
  let index = products[indexOfCategory].items.findIndex((product) => {
    return product.id === id;
  });
  if (index === -1) {
    return response.status(404).send('Not found');
  }

  // Ny kod för delete 🐛
  products[indexOfCategory].items.splice(index, 1);
  response.status(200).send('product is deleted');
});

// =========================================================
// ===========U=============================================
// =======================S=================================
// =================E=======================================
// ===================================R=====================
// ===========================S=============================
// =============================================!===========
// ===L=======O======L======================?===============

// *-----------USERS-----------

//* GET USERS 🐛
app.get('/api/users', (request, response) => {
  response.status(200).send(users);
});

//* POST USERS 🦝
app.post('/api/users', (request, response) => {
  const { body } = request;
  const addNewUser = { id: getNextId(users), ...body };
  users.push(addNewUser);
  // TODO: VALIDERING OCH SKICKA FEL OM PAYLOAD INTE ÄR KORREKT IFYLLD:

  response.status(201).send(addNewUser);
});

//* PUT USERS 🐛
app.put('/api/users/:id', (request, response) => {
  let id = request.params.id;
  let body = request.body;

  id = parseInt(id);
  if (isNaN(id)) {
    return response.sendStatus(400);
  }
  let index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index === -1) {
    return response.status(404).send('Not found');
  }

  // TODO: VALIDERING OCH SKICKA FEL OM PAYLOAD INTE ÄR KORREKT IFYLLD:

  users[index] = { id: id, ...body };
  response.status(200).send(users[index]);
});

//* PATCH USERS 🐛
app.patch('/api/users/:id', (request, response) => {
  let id = request.params.id;
  let body = request.body;
  id = parseInt(id);
  if (isNaN(id)) {
    return response.sendStatus(400);
  }
  let index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index === -1) {
    return response.status(404).send('404: Page not found');
  }
  users[index] = { ...users[index], ...body };
  response.status(200).send(users[index]);
});

//* DELETE USERS 🐛
app.delete('/api/users/:id', (request, response) => {
  //SAMMA KOD SOM I PUT OCH PATCHvvvvvvvvvvvvvv
  let id = request.params.id;

  id = parseInt(id);
  if (isNaN(id)) {
    return response.sendStatus(400);
  }
  let index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index === -1) {
    return response.status(404).send('Not found');
  }
  //SAMMA KOD SOM I PUT OCH PATCH^^^^^^^^^^^^^^^^^^

  //Ny kod för delete
  users.splice(index, 1);
  response.status(200).send('user is deleted');
});
