class StorageError extends Error {
    constructor(message, code = 'STORAGE_ERROR', details = null) {
        super(message);
        this.name = 'StorageError';
        this.code = code;
        this.details = details;
    }
}

class StorageAdapter {
    constructor(storageType = 'session') {
        this.storage = storageType === 'local' ? localStorage : sessionStorage;
        this.prefix = 'bbps_';
    }

    _getKey(key) {
        return `${this.prefix}${key}`;
    }

    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            this.storage.setItem(this._getKey(key), serialized);
            return true;
        } catch (error) {
            throw new StorageError(
                `Failed to set item: ${error.message}`,
                'SET_ERROR',
                { key, error: error.message }
            );
        }
    }

    get(key) {
        try {
            const item = this.storage.getItem(this._getKey(key));
            return item ? JSON.parse(item) : null;
        } catch (error) {
            throw new StorageError(
                `Failed to get item: ${error.message}`,
                'GET_ERROR',
                { key, error: error.message }
            );
        }
    }

    remove(key) {
        try {
            this.storage.removeItem(this._getKey(key));
            return true;
        } catch (error) {
            throw new StorageError(
                `Failed to remove item: ${error.message}`,
                'REMOVE_ERROR',
                { key, error: error.message }
            );
        }
    }

    clear() {
        try {
            // Only clear items with our prefix
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            throw new StorageError(
                `Failed to clear storage: ${error.message}`,
                'CLEAR_ERROR',
                { error: error.message }
            );
        }
    }

    keys() {
        try {
            const keys = [];
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.substring(this.prefix.length));
                }
            }
            return keys;
        } catch (error) {
            throw new StorageError(
                `Failed to get keys: ${error.message}`,
                'KEYS_ERROR',
                { error: error.message }
            );
        }
    }

    has(key) {
        return this.storage.getItem(this._getKey(key)) !== null;
    }

    size() {
        return this.keys().length;
    }
}

class Storage {
    constructor(storageType = 'session') {
        this.adapter = new StorageAdapter(storageType);
    }

    // Create or Update
    async set(key, value) {
        try {
            if (!key || typeof key !== 'string') {
                throw new StorageError('Invalid key: must be a non-empty string', 'INVALID_KEY');
            }
            this.adapter.set(key, value);
            return { success: true, key, value };
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to store data: ${error.message}`,
                'SET_FAILED',
                { key, error: error.message }
            );
        }
    }

    // Read single item
    async get(key, defaultValue = null) {
        try {
            if (!key || typeof key !== 'string') {
                throw new StorageError('Invalid key: must be a non-empty string', 'INVALID_KEY');
            }
            const value = this.adapter.get(key);
            return value !== null ? value : defaultValue;
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to retrieve data: ${error.message}`,
                'GET_FAILED',
                { key, error: error.message }
            );
        }
    }

    // Read multiple items
    async getMultiple(keys) {
        try {
            if (!Array.isArray(keys)) {
                throw new StorageError('Keys must be an array', 'INVALID_KEYS');
            }
            const results = {};
            for (const key of keys) {
                results[key] = await this.get(key);
            }
            return results;
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to retrieve multiple items: ${error.message}`,
                'GET_MULTIPLE_FAILED',
                { keys, error: error.message }
            );
        }
    }

    // Read all items
    async getAll() {
        try {
            const keys = this.adapter.keys();
            const results = {};
            for (const key of keys) {
                results[key] = this.adapter.get(key);
            }
            return results;
        } catch (error) {
            throw new StorageError(
                `Failed to retrieve all items: ${error.message}`,
                'GET_ALL_FAILED',
                { error: error.message }
            );
        }
    }

    // Update (same as set but checks existence)
    async update(key, value) {
        try {
            if (!this.adapter.has(key)) {
                throw new StorageError(
                    `Key "${key}" does not exist`,
                    'KEY_NOT_FOUND',
                    { key }
                );
            }
            return await this.set(key, value);
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to update data: ${error.message}`,
                'UPDATE_FAILED',
                { key, error: error.message }
            );
        }
    }

    // Partial update (merge with existing data)
    async merge(key, partialValue) {
        try {
            const existing = await this.get(key);
            if (existing === null) {
                throw new StorageError(
                    `Key "${key}" does not exist`,
                    'KEY_NOT_FOUND',
                    { key }
                );
            }
            if (typeof existing !== 'object' || Array.isArray(existing)) {
                throw new StorageError(
                    'Cannot merge: existing value is not an object',
                    'INVALID_MERGE_TARGET',
                    { key, existingType: typeof existing }
                );
            }
            const merged = { ...existing, ...partialValue };
            return await this.set(key, merged);
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to merge data: ${error.message}`,
                'MERGE_FAILED',
                { key, error: error.message }
            );
        }
    }

    // Delete single item
    async delete(key) {
        try {
            if (!key || typeof key !== 'string') {
                throw new StorageError('Invalid key: must be a non-empty string', 'INVALID_KEY');
            }
            const existed = this.adapter.has(key);
            this.adapter.remove(key);
            return { success: true, key, existed };
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to delete data: ${error.message}`,
                'DELETE_FAILED',
                { key, error: error.message }
            );
        }
    }

    // Delete multiple items
    async deleteMultiple(keys) {
        try {
            if (!Array.isArray(keys)) {
                throw new StorageError('Keys must be an array', 'INVALID_KEYS');
            }
            const results = {};
            for (const key of keys) {
                const result = await this.delete(key);
                results[key] = result.existed;
            }
            return { success: true, results };
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to delete multiple items: ${error.message}`,
                'DELETE_MULTIPLE_FAILED',
                { keys, error: error.message }
            );
        }
    }

    // Clear all items
    async clear() {
        try {
            this.adapter.clear();
            return { success: true };
        } catch (error) {
            throw new StorageError(
                `Failed to clear storage: ${error.message}`,
                'CLEAR_FAILED',
                { error: error.message }
            );
        }
    }

    // Check if key exists
    async has(key) {
        try {
            if (!key || typeof key !== 'string') {
                throw new StorageError('Invalid key: must be a non-empty string', 'INVALID_KEY');
            }
            return this.adapter.has(key);
        } catch (error) {
            throw new StorageError(
                `Failed to check key existence: ${error.message}`,
                'HAS_FAILED',
                { key, error: error.message }
            );
        }
    }

    // Get all keys
    async keys() {
        try {
            return this.adapter.keys();
        } catch (error) {
            throw new StorageError(
                `Failed to get keys: ${error.message}`,
                'KEYS_FAILED',
                { error: error.message }
            );
        }
    }

    // Get storage size
    async size() {
        try {
            return this.adapter.size();
        } catch (error) {
            throw new StorageError(
                `Failed to get size: ${error.message}`,
                'SIZE_FAILED',
                { error: error.message }
            );
        }
    }

    // Query items by filter function
    async query(filterFn) {
        try {
            if (typeof filterFn !== 'function') {
                throw new StorageError('Filter must be a function', 'INVALID_FILTER');
            }
            const all = await this.getAll();
            const results = {};
            for (const [key, value] of Object.entries(all)) {
                if (filterFn(value, key)) {
                    results[key] = value;
                }
            }
            return results;
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to query storage: ${error.message}`,
                'QUERY_FAILED',
                { error: error.message }
            );
        }
    }

    // Export all data
    async export() {
        try {
            const all = await this.getAll();
            return {
                timestamp: new Date().toISOString(),
                count: Object.keys(all).length,
                data: all
            };
        } catch (error) {
            throw new StorageError(
                `Failed to export data: ${error.message}`,
                'EXPORT_FAILED',
                { error: error.message }
            );
        }
    }

    // Import data
    async import(data, options = { overwrite: false }) {
        try {
            if (!data || typeof data !== 'object') {
                throw new StorageError('Import data must be an object', 'INVALID_IMPORT_DATA');
            }
            const imported = [];
            const skipped = [];
            
            for (const [key, value] of Object.entries(data)) {
                if (!options.overwrite && this.adapter.has(key)) {
                    skipped.push(key);
                    continue;
                }
                await this.set(key, value);
                imported.push(key);
            }
            
            return {
                success: true,
                imported: imported.length,
                skipped: skipped.length,
                details: { imported, skipped }
            };
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to import data: ${error.message}`,
                'IMPORT_FAILED',
                { error: error.message }
            );
        }
    }
}