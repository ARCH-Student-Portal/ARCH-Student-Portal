const mongoose = require('mongoose');

class DBConnection {
    constructor() {
        if (DBConnection.instance) {
            return DBConnection.instance;
        }
        this.connection = null;
        DBConnection.instance = this;
    }

    async connect() {
        if (this.connection) {
            console.log('Using existing MongoDB connection');
            return this.connection;
        }
        try {
            this.connection = await mongoose.connect(process.env.MONGO_URI);
            console.log(`MongoDB Connected: ${this.connection.connection.host}`);
            return this.connection;
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }
}

module.exports = new DBConnection();