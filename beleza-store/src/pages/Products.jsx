const products = [
    { id: 1, name: "Shampoo", price: 120, whatsapp: "27821234567" },
    { id: 2, name: "Conditioner", price: 130, whatsapp: "27821234567" },
    { id: 3, name: "Hair Oil", price: 90, whatsapp: "27821234567" },
  ];
  
  export default function Products() {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Products</h2>
        <div style={{ display: "flex", gap: "15px" }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
              <h3>{product.name}</h3>
              <p>Price: R{product.price}</p>
              <a
                href={`https://wa.me/${product.whatsapp}?text=Hi, I want to order ${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Order via WhatsApp
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }