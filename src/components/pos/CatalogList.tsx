import { Plus } from "lucide-react";
import type { CatalogItem } from "../../types/pos.types";

/* Lista de catalogo de productos para POS */
interface Props {
  title: string;
  items: CatalogItem[];
  onAdd: (item: CatalogItem) => void;
  emptyMessage: string;
}

const CatalogList = ({ title, items, onAdd, emptyMessage }: Props) => {
  return (
    <div className="pos-catalog">
      <div className="pos-catalog-header">
        <h3>{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="pos-empty">{emptyMessage}</p>
      ) : (
        <ul className="pos-catalog-list">
          {items.map((item) => (
            <li key={item.key} className="pos-catalog-item">
              <div>
                <p className="pos-item-title">{item.name}</p>
                <p className="pos-item-meta">{item.description}</p>
                <p className="pos-item-meta">{item.category}</p>
              </div>
              <div className="pos-item-actions">
                <span className="pos-item-price">
                  ${item.unitPrice.toFixed(2)}
                </span>
                <button
                  type="button"
                  className="pos-add-btn"
                  onClick={() => onAdd(item)}
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CatalogList;
