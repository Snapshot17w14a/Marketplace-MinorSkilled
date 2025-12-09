import type { Category } from "../types/category";

export default function CategoryLabel({ category } : { category: Category }) {
    return(
        <span 
            className={`text-xs font-medium px-2 py-1 rounded ${category.color}`}
        >
            {category.category}
        </span>
    )
}