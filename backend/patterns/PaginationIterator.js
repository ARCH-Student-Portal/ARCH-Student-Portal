// The Iterator pattern provides a way to sequentially access
// elements of a collection without exposing its underlying structure.
// Here we implement pagination as an iterator over any dataset.

class PaginationIterator {
    constructor(data, pageSize = 10) {
        this.data = data;
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.totalPages = Math.ceil(data.length / pageSize);
    }

    hasNext() {
        return this.currentPage <= this.totalPages;
    }

    next() {
        if (!this.hasNext()) return null;
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const items = this.data.slice(start, end);
        this.currentPage++;
        return items;
    }

    getPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages) return [];
        const start = (pageNumber - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.data.slice(start, end);
    }

    getMeta() {
        return {
            totalItems: this.data.length,
            totalPages: this.totalPages,
            pageSize: this.pageSize,
            currentPage: this.currentPage - 1
        };
    }

    reset() {
        this.currentPage = 1;
    }
}

module.exports = PaginationIterator;