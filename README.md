# Starting with NodeJS
1. Start node by creating the package.json file
  - Main file for all js projects
```bash
npm init -y
```

2. To start testing node-js, we must create a file `src/server.js`

3. Node has several internal packages
  - We will use `http` to build our APIs to create our routes (GET, POST, etc)
  - By default node uses CommonJS standard for imports (require('<packageName>')), but this isn't as used nowadays. Lately, we have been using the ESModules standard for imports/exports, which is not supported by default on NodeJs. To make NodeJS understand ESModules, we need to into the package.json
  ```"type": "module"```
  - In the most recent docs, NodeJs asks us to label the imports that are internal by adding a prefix to the package import
  ```
  Example:
  import http from 'node:http'
  ```
4. With the `node:http` module imported, we will start creating our first HTTP server

```js
import http from 'node:http'

const server = http.createServer((req, res) => {
  return res.end('Hello World')
})

server.listen(3333)

// localhost:3333
```
  - Inside `request`, we can get all the information that is arriving to the server. Example: imagine we are creating a route to create a new user. When creating a new user, we must send user information, such as name, email, password, etc. By using `request`, we can have access to all the request information ("who is requesting our server").
  - Run node server to test by `node src/server.js` in the terminal

5. Add `--watch` to the command to run nodejs to restart the server if changes were detected `node --watch src/server.js`
  - we can create scripts to automate the terminal commands - scripts are shortcutes to longer commands


# Application Structure

## HTTP methods - routes
Routes are ways of input for our API and allows frontend or other application to execute different operations with our API

Example: Route - create/list/edit/remove users


How HTTP requests work?
HTTP requests are basically made of 2 main resources (obtained by using the req/request): 
- HTTP Method
- URL

Example:
```js
import http from 'node:http'

const server = http.createServer((req, res) => {
  const {method, url} = req

  console.log(method, url)
  
  return res.end('Hello World')
})

server.listen(3333)

// http localhost:3333 -> console.log = GET /
```

Methods (more semantic than functional):
- GET = list database resource
- POST = create resource in the database
- PUT = edit/update resource in the database. This is mostly used when we want to update an entity almost entirely (multiple informations/fields at the same time). Example: form to update user information (name, email, bio, etc)
- PATCH = edit/update a specific information of a resource in the database. Example: mute/accept notifications
- DELETE = delete resource in database

We will separate each route by using a unique HTTP method per URL (HTTP Method + URL = route). We can have multiple HTTP methods within the same URL. 
For example: GET /users (list users) || POST /users (create a user)

```js
import http from 'node:http'

const server = http.createServer((req, res) => {
  const {method, url} = req

  if (method === 'GET' && url === '/users') {
    return res.end('Users list')
  }

  if (method === 'POST' && url === '/users') {
    return res.end('User creation')
  }

  return res.end('Hello World')
})

server.listen(3333)

// http GET localhost:3333/users -> Users list
// http POST localhost:3333/users -> User creation
```

# Statefull - saving users in memory (headers)
> docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#downloads

## HTTP Status Code
When we return a response to the frontend (or other backends consuming our API), we will have several numeric types of answers to communicate with the frontend the status of the request (if it worked or not and what kind of error happened). HTTP Status Code has a semanthic importance between the communication of frontend and other backends consuming our API.

Example:
```js
import http from 'node:http'

const users = []

const server = http.createServer((req, res) => {
  const {method, url} = req

  if (method === 'GET' && url === '/users') {
    return res.setHeader('Content-type', 'application/json').end(JSON.stringify(users))
  }

  if (method === 'POST' && url === '/users') {
    users.push({
      id: 1,
      name: 'John Doe',
      email: 'johndoe@example.com'
    })
    return res.writeHead(201).end()
  }

  return res.writeHead(404).end()
})

server.listen(3333)

```

# Nodejs Streams
Key functionality that made node being known by what it is today since it solved issues that other technologies either didn't solve it or were too complex.

Streams can be compared to apps such as Netflix and Spotify and those apps can help us understand how streams work. When we go watch a movie on Netflix, we noticed we can start watching the show even though it wasn't fully loaded. Streams goal is to obtain and read small chunks and start working with that data even though the full data is not available. NodeJs allows us to do this in a simple and performatic way.

Another example of app using Streams would be to import clients data via CSV (Excel) and start saving/working with that data piece by piece. Imagine a client add a CSV file with 1 Gb of size and over 1 million lines, if we do NOT use the concept of streams, once the user add the CSV using a UI with a POST route, node will need to read the whole 1 Gb of data. Then, it would loop over every line of the CSV to store in the data base. Imagine the user that is using our internet had an internet speed of 10 Mb/s, it would take at least 819,2s (~13 min and 40 s) to upload the file. When we apply the streams concept to this example, in the first second, using the user with the same internet speed, we would have 10 mb (~10.000) lines of code. With streams we can start processing the data (Readable Streams) and inserting it into the database (Writable Streas) before having to wait for the whole data to be downloaded in the server.

With node, every input/output (req/res) port/door is automatically a stream. NodeJS has a lot of different input/output doors, req/rest is an example. To explain NodeJs concepts, we will work with another model of input/output, which is the node process, `stdin` (readable stream) and `stdout` (writable stream), stdin is exactly what we type in the terminal.

`.pipe()` -> form of forwarding data

`stdin` is a Duplex stream. 

Example
```js
process.stdin.pipe(process.stdout)
```

Every stream has a mandatory method called `_read`. Readable stream's object is to provide data. `push()` is the method we use with a readable stream to provide the data to whom is consuming the readable stream. With Streams, we cannot work with strings/numbers/boolean. The chunk being read by a stream can never be in a primitive format. We will need to work with another Nodejs format, which is known as `Buffer`

Example

```js
import { Readable } from 'node:stream'

class OneToHundredStream extends Readable {
  index = 1

  _read() {
    const i = this.index++

    setTimeout(() => {
      if (i > 100) {
        this.push(null)
      } else {
        const buffer = Buffer.from(String(i))
        this.push(buffer)
      }
    }, 1000)
  }
}

new OneToHundredStream().pipe(process.stdout)
```

`node streams/fundamentals.js`

### Writeable Stream
Differently from a Readable Stream, a writeable stream will receive and process the data.
A Writeable stream needs a `_write()` method that receives as parameters `chunk` (piece of data sent to stream - e.g. buffer), `encoding` (how the data is encoded), and `callback` (function that the writeable stream needs to call when it needs to process the data).

A writeable stream should never return something. It will process the data, but not transform it into something else.

```js
import { Readable, Writable } from 'node:stream'

class OneToHundredStream extends Readable {
  index = 1

  _read() {
    const i = this.index++

    setTimeout(() => {
      if (i > 100) {
        this.push(null)
      } else {
        const buffer = Buffer.from(String(i))
        this.push(buffer)
      }
    }, 1000)
  }
}

class MultiplyByTenStream extends Writable {
  _write(chunk, encoding, callback) {
    console.log(Number(chunk.toString()) * 10)
    callback()
  }
}

new OneToHundredStream().pipe(new MultiplyByTenStream)
```

Writeable Stream can't redirect the data to another stream. It can only RECEIVE and do something to it.

### Transform Streams
Used to transform a chunk into another chunk.

Callback first parameter is the `error`. Second parameter is the conversion (transformed data).

This stream needs to read and redirect data to somewhere else. This is used to communicate between 2 other streams.

```js
import { Readable, Transform, Writable } from 'node:stream'

class OneToHundredStream extends Readable {
  index = 1

  _read() {
    const i = this.index++

    setTimeout(() => {
      if (i > 100) {
        this.push(null)
      } else {
        const buffer = Buffer.from(String(i))
        this.push(buffer)
      }
    }, 1000)
  }
}

class InverseNumberStream extends Transform {
  _transform(chunk, encoding, callback) {
    const transformed = Number(chunk.toString()) * -1

    callback(null, Buffer.from(String(transformed)))
  }
}

class MultiplyByTenStream extends Writable {
  _write(chunk, encoding, callback) {
    console.log(Number(chunk.toString()) * 10)
    callback()
  }
}

new OneToHundredStream()
  .pipe(new InverseNumberStream())
  .pipe(new MultiplyByTenStream())
```

### Writeable X Transform Streams
https://efficient-sloth-d85.notion.site/Qual-a-diferen-a-entre-Writable-e-Transform-Stream-8d422279e5834d3cbef3bce82c6c2274

Imagine a seguinte situação:

Você está criando uma pipeline de processamento de áudio, a ideia é ler um arquivo de áudio, normalizar o volume do áudio, ou seja, cuidar pra não ficar nem muito alto, nem muito baixo e, após a normalização, salvar novamente em um arquivo do sistema.

Utilizanando o conceito de streams logo nos vem a cabeça poder ler/escrever esse arquivo no sistema utilizando streams, dessa forma evitamos que o arquivo fique salvo em memória poupando recursos.

Se usarmos o fs.createReadStream para ler o conteúdo do arquivo estamos criando uma stream de leitura, ou seja, podemos ler os dados aos poucos e enviar pra alguma outra stream.

Se enviarmos esses dados para uma stream de escrita (WriteableStream), ela stream poderá receber os dados aos poucos, normalizar o áudio normalmente, mas não vai conseguir enviar os pedacinhos do áudio normalizado para outra stream porque uma WriteableStream sempre é um ponto final, não consigo encaminhar nada dali pra frente.

Se eu usar uma TransformStream, posso também ler a stream de leitura do arquivo de áudio, normalizar o volume e reencaminhar os dados processados para fora dessa stream para então usar um fs.createWriteStream para escrever o arquivo em disco com o áudio normalizado.

Entende a diferença?

Vejo que na sua mensagem você mencionou também o termo "duplex", mas cuidado porque uma TransformStream não é a mesma coisa que uma DuplexStream, porque a Transform recebe e escreve ao mesmo tempo enquanto uma Duplex pode receber OU escrever individualmente, ou seja, posso usar ela pra ler mas não pra escrever se eu quiser.

### Duplex Stream (not as used)
It has methods to read/write data (combination of readable and writeable streams). Example: file in our system - we can read it and write on it, but not necessarily we can transform something inside of it.

### Combining HTTP Examples + Streams
Req => Readable Stream
Res => Writeable Stream

Node differential -> We can open a channel with our server and keep it open to send/receive information by chunks. (example: fake-upload-to-http-stream + stream-http-server)

### Consuming complete Stream
In some scenarios, I might want to read all the stream data before being able to process it. To do this, we first create an array of buffers to hold, iterate over the stream, and populate the new buffers array.
Example: there are a lot of different data that has the metadata spread all over the file, so we can't really work with the file until it's fully read. JSON format is very complicated to work partially, so we tend to wait for the full response.

Example of files that allow reading/processing with partial streams: texts, videos, songs, etc

### Understanding Buffers in Nodejs
Buffer is a representation of the memory space used in the computer to transit data super fast. The data stored in a buffer are temporarily stored while it's processed and then they are removed. Buffer (internal API) stores data as binary, and that's why it presents more performance. Buffer API was created due to the incapacity of javascript to deal with binary data efficiently. 

```js
const buf = Buffer.from("ok")

console.log(buf)
// <Buffer 6f 6b>
// 6f and 6b are hexadecimals to represent letters. 6f = o || 6b = k
```

### Creating JSON middleware
Middleware is an intercepter. Function that will intercept the request. Middlewares always receive as parameter the request and response.


### Creating JSON DB
#database -> makes property private in javascript

Node global variables
__filename, __dirname -> doesn't work well with ESModules
import.meta.url -> returns the exact path to the file in execution


### Routes
Since we have a way to list and create new users, the natural moving forward will be to create more routes.

There are 3 ways a frontend or another backend to send information to our API

1. Query Parameters
Name params sent in the url address. We use this when we need a url to maintain stateful. Imagine you accessed an app that has a list of all users that allows you to filter a specific user. You search all the users with the name "Will", and then you copy the url to send to a friend. If the parameters are not in the url, when your friend opens the link, the filter won't be active.
- We use this to store non-sensible data that can modify the response from the backend. This is often used as optional
Usage: filters, pagination
For example: http://localhost:3333/users?userId=1&name=Will

2. Route Parameters
Params used in a route to **identify a resource**. 
- We use this to store non-sensible data

Example: GET http://localhost:3333/users/1

3. Request Body
Usually, it's used to send data from a form. This data usually is transferred using HTTPs request, which is hard to be decrypted or intercepted

Nodejs -> ":" (e.g. users/:id) means = the route will receive a dynamic parameter

Since we are not using a framework, we'll need to create a regex to understand the dynamic parameter. Looking for all uppercase/lowercase letters that can repeat one or more times ("+") after :. We add "g" (as global) at the end for the case of having multiple dynamic parameters, such as /users/:userId/groups/:groupId. Without "g", the regex will stop at the first match

`const routeParamsRegex = /:([a-zA-Z]+)/g` used to find all dynamic parameters.
`const pathWithParams = path.replaceAll(routeParamsRegex, '([a-z0-9\-_]+)')` to validate the url with real parameters using the routeParamsRegex to validate the dynamic params. For example: /users/1 -> returns as valid. Although it validates the string, it doesn't return a named value, which it makes it difficult to identify which value is for what.

For example,

```js
// If I try to get the route params for a route with multiple dynamic fields (e.g. /users/:id/groups/:groupId)
const routeParams = req.url.match(route.path)

// Returns
// ['users/1/groups/1', '1', '1', index: 0, input: 'users/1/groups/1', groups: undefined]
```

With Regex is possible to create groups by using `?<>`. 

We can also select a group within a specific position `?<$1>`

```js
const pathWithParams = path.replaceAll(routeParamsRegex, '(?<$1>[a-z0-9\-_]+)')

// Returns
// ['users/1', '1', index: 0, input: 'users/1', groups: { id: '1'}]
// ['users/1/groupId/1', '1', '1', index: 0, input: 'users/1/groupId/1', groups: { id: '1', groupId: '1'}]
```


Improving Regex for Query Params

```js
 const pathRegex = new RegExp(`^${pathWithParams}(?<query>)?$`)
 // route - /users?search=Diego
 // console.log (routeParams.groups)
 // {query: '?search=Diego'}
```
(?<query>) => creates a group for query params
(?<query>)? => ? at the end indicates that this is OPTIONAL
(?<query>)?$ => $ indicates it ends with
(?<query>\\?(.*))?$ => \\? (scaped ? to indicate it starts with ?), `(.*)` (creates a group to select all characters)