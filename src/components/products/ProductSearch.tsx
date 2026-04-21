import { Search } from "lucide-react";
import type { ProductCategory } from "../../types/product.types";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from "../../types/product.types";

/* Buscador de productos con filtro por categoria */
interface Props {
  value: string;
  onChange: (value: string) => void;
  category: ProductCategory | "ALL";
  onCategoryChange: (value: ProductCategory | "ALL") => void;
}

const ProductSearch = ({
  value,
  onChange,
  category,
  onCategoryChange,
}: Props) => {
  return (
    <div className="products-search">
      <select
        className="product-filter"
        value={category}
        onChange={(e) =>
          onCategoryChange(e.target.value as ProductCategory | "ALL")
        }
      >
        <option value="ALL">Todas las categorias</option>
        {PRODUCT_CATEGORIES.map((categoryValue) => (
          <option key={categoryValue} value={categoryValue}>
            {PRODUCT_CATEGORY_LABELS[categoryValue]}
          </option>
        ))}
      </select>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          className="product-search"
          type="text"
          placeholder="Buscar producto"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProductSearch;
