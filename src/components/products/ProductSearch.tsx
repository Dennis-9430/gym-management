interface Props {
  value: string;
  onChange: (value: string) => void;
}

const ProductSearch = ({ value, onChange }: Props) => {
  return (
    <div className="products-search">
      <div>
        <h2>Lista de productos</h2>
        <p className="products-subtitle">
          Gestiona el inventario y los servicios del gimnasio.
        </p>
      </div>
      <div className="search-input-wrapper">
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
