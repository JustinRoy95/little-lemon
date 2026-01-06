import * as SQLite from 'expo-sqlite';

export type MenuItems = {
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
}

export type Filter = {
    name: string,
    value: boolean
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

export async function retrieveItems(db: SQLite.SQLiteDatabase) {
    const entries =  await db.getAllAsync(`
        SELECT * FROM menuitems;
    `);
    return entries;
}

export async function storeItems(db: SQLite.SQLiteDatabase, items: MenuItems[]) {
    for (const item of items) {
        await db.runAsync('INSERT INTO menuitems (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)', [item.name, item.description, item.price, item.image, item.category]);
    }
    return retrieveItems(db);
}