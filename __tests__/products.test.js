import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"
import server from "../src/server.js"
import ProductsModel from "../src/products/model.js"

dotenv.config()

const client = supertest(server)

const newProduct = {
  name: "test",
  description: "bal bla bla",
  price: 29,
}

const notValidProduct = {
  description: "bal bla bla",
  price: 29,
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_CONNECTION)
  const product = new ProductsModel(newProduct)
  await product.save()
})

afterAll(async () => {
  await ProductsModel.deleteMany()
  await mongoose.connection.close()
})

describe("Test Products APIs", () => {
  it("Should check that Mongo connection string is not undefined", () => {
    expect(process.env.MONGO_TEST_CONNECTION).toBeDefined()
  })

  it("Should test that GET /products returns a success status and a body", async () => {
    const response = await client.get("/products").expect(200)
    console.log(response.body)
  })

  it("Should test that POST /products returns a valid _id and 201", async () => {
    const response = await client.post("/products").send(newProduct).expect(201)
    expect(response.body._id).toBeDefined()
  })

  it("Should test that POST /products with a not valid product returns 400", async () => {
    await client.post("/products").send(notValidProduct).expect(400)
  })
})