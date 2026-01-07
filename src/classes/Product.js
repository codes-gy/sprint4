export class Product {
    constructor({ id, name, description, price, createdAt, updatedAt, tags = [], images = [] }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tags = tags ? tags : [];
        this.images = images ? images : [];
    }
    static fromEntity(product) {
        if (!product) throw new Error('데이터가 존재하지 않습니다.');
        return new Product({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            tags: product.tags,
            images: product.images,
        });
    }
    static fromEntityList(products = []) {
        return products.map((product) => Product.fromEntity(product));
    }
}
