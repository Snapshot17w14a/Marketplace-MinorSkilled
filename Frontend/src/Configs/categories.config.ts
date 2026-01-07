import { type Category } from "../types/category"

export default {
    categories: [
        {
            name: "Gaming",
            color: "text-rose-400 bg-rose-400/10"
        },
        {
            name: "Electronics",
            color: "text-lime-400 bg-lime-400/10"
        },
        {
            name: "Books",
            color: "text-yellow-400 bg-yellow-400/10"
        },
        {
            name: "Clothing",
            color: "text-cyan-400 bg-cyan-400/10"
        },
        {
            name: "Furniture",
            color: "text-orange-400 bg-orange-400/10"
        }
    ] as Category[],
    categoryIds: [
        { name: "Gaming", id: 0 },
        { name: "Electronics", id: 1 },
        { name: "Books", id: 2 },
        { name: "Clothing", id: 3 },
        { name: "Furniture", id: 4 }
    ]
}