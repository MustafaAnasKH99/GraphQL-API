const graphql = require('graphql')
const _ = require('lodash')
const Category = require('../models/Category')
const Product = require('../models/Product')
const Counter = require('../models/Visits_Counter.js')
const Time = require('../models/Time.js')

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
} = graphql

const ProductObjectType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        category: {
            type: CategoryObjectType,
            resolve(parent, args){
                return Category.findById(parent.parentCategoryId)
            }
        }
    })
})

const CategoryObjectType = new GraphQLObjectType({
    name: 'Category',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        products: {
            type: new GraphQLList(ProductObjectType),
            resolve(parent, args){
                return Product.find({parentCategoryId: parent.id})
            }
        }, 
    })
})

const CounterObjectType = new GraphQLObjectType({
    name: 'Counter',
    fields: () => ({
        id: { type: GraphQLID },
        number: { type: GraphQLInt },
    })
})

const TimeObjectType = new GraphQLObjectType({
    name: 'Time',
    fields: () => ({
        id: { type: GraphQLID },
        time: { type: GraphQLString },
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        //find by id
        product:{
            type: ProductObjectType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                return Product.findById(args.id)
            }
        },

        category: {
            type: CategoryObjectType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                return Category.findById(args.id)
            }
        },

        // find all
        products: {
            type: new GraphQLList(ProductObjectType),
            resolve(parent, args){
              return Product.find({})
            }
        },

        categories: {
            type: new GraphQLList(CategoryObjectType),
            resolve(parent, args){
                return Category.find({})
            }
        },

        counters: {
            type: new GraphQLList(CounterObjectType),
            resolve(parent, args){
              return Counter.find({})
            }
        },

        time: {
            type: new GraphQLList(TimeObjectType),
            resolve(parent, args){
              return Time.find({})
            }
        },
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // CREATE
        createCategory: {
            type: CategoryObjectType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args){
                let category = await new Category({
                    name: args.name
                })
                return category.save();
            }
        },

        createProduct: {
            type: ProductObjectType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                parentCategoryId: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args){
                let product = await new Product({
                    name: args.name,
                    parentCategoryId: args.parentCategoryId
                })
                return product.save()
            }
        },

        createTime: {
            type: TimeObjectType,
            async resolve(parent, args){
                let timeNow = new Date()
                let timeString = timeNow.toISOString()
                let time = await new Time({
                    time: timeString
                })
                return time.save()
            }
        },

        createCounter: {
            type: CounterObjectType,
            args: {
                number: { type: new GraphQLNonNull(GraphQLInt) }
            },
            async resolve(parent, args){
                let counter = await new Counter({
                    number: args.number
                })
                return counter.save();
            }
        },

        getTime: {
            type: TimeObjectType,
            args: {
                number: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args){
                let time = await new Time({
                    time: args.time
                })
                return time.save();
            }
        },

        // DELETE
        deleteProduct: {
            type: ProductObjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) } 
            },
            async resolve(parent, args){
                let deletedProduct = await Product.findByIdAndRemove(args.id)  
                if (!deletedProduct) {
                    throw new Error('Error')
                }
                return deletedProduct
            }
        },

        deleteCategory: {
            type: CategoryObjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args){
                let deletedProducts = await Product.deleteMany({parentCategoryId: args.id})
                let deletedCategory = await Category.findByIdAndRemove(args.id)
                if (!deletedCategory) {
                    throw new Error('Error')
                }

                return deletedCategory, deletedProducts
            }
        },

        // UPDATE
        updateProduct: {
            type: ProductObjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                parentCategoryId: { type: GraphQLString }
            },
            async resolve(parent, args){
                let updatedProduct = await Product.findByIdAndUpdate(args.id, args)
                if (!updatedProduct) {
                    throw new Error('Error')
                }
                return updatedProduct
            }
        },

        updateCounter: {
            type: CounterObjectType,
            async resolve(parent, args){
                let updatedCounter = await Counter.findByIdAndUpdate("5dbf9845ad5c0b0017bda999", {$inc: {number: 1}})
                if (!updatedCounter) {
                    throw new Error('Error')
                }
                return updatedCounter
            }
        },

        updateCategory: {
            type: CategoryObjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args){
                let updatedCategory = await Category.findByIdAndUpdate(args.id, args)
                if (!updatedCategory) {
                    throw new Error('Error')
                }
                return updatedCategory
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
  })