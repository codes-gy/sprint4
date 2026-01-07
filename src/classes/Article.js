export class Article {
    constructor({ id, title, content, image, createdAt, updatedAt }) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.image = image;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromEntity(article) {
        if (!article) throw new Error('데이터가 존재하지 않습니다.');
        return new Article({
            id: article.id,
            title: article.title,
            content: article.content,
            image: article.image,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
        });
    }
    static fromEntityList(articles = []) {
        return articles.map((article) => Article.fromEntity(article));
    }
}
