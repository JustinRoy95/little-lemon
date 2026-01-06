import * as SQLite from 'expo-sqlite';

export type MenuItems = {
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
}

export async function initializeDB(db: SQLite.SQLiteDatabase) {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS menuitems (
            name TEXT PRIMARY KEY NOT NULL,
            description TEXT NOT NULL,
            price INT NOT NULL,
            image TEXT,
            category TEXT NOT NULL
        );
    `);
}

export async function retrieveItems(db: SQLite.SQLiteDatabase, query: string | null = null, categories: string[] | null = null) {
    if (query?.length || categories?.length) {
        let queryLayout = `SELECT * FROM menuitems WHERE name LIKE ?`
        if (categories?.length) {
            const questionMarks = categories.map(() => '?').join(',');
            queryLayout += ` AND category in (${questionMarks})`
            return await db.getAllAsync(queryLayout, [`%${query}%`, ...categories]);
        }
        return await db.getAllAsync(queryLayout, [`%${query}%`]);
    }
    return await db.getAllAsync(`
        SELECT * FROM menuitems;
    `);
}

export async function storeItems(db: SQLite.SQLiteDatabase, items: MenuItems[]) {
    for (const item of items) {
        await db.runAsync('INSERT INTO menuitems (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)', [item.name, item.description, item.price, item.image, item.category]);
    }
    return retrieveItems(db);
}